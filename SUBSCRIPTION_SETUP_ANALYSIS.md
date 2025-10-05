# Patriot Desa - Subscription Flow Analysis & Fixes

## Issues Found & Fixed

### 1. ✅ Supabase Client Configuration (FIXED)
**Problem**: Mismatch between environment variable names
- Code was looking for: `VITE_SUPABASE_ANON_KEY`
- .env file had: `VITE_SUPABASE_PUBLISHABLE_KEY`

**Solution**: Updated `src/integrations/supabase/client.ts` to use fallback:
```typescript
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

### 2. ⚠️ Port Configuration Issue
**Problem**: Workflow expects port 5000, but Vite runs on port 8080
- `.replit` config: `waitForPort = 5000`
- `vite.config.ts`: `port: 8080`

**Recommendation**: The vite.config.ts is correct as-is. The port mismatch is causing workflow failures but the app runs fine on port 8080.

### 3. 🔧 Midtrans Recurring Payment Setup

Your current implementation has **ONE-TIME payments** but you want **RECURRING subscriptions**. Here's what needs to be updated:

#### Current Flow (One-Time Payment):
1. User clicks "Upgrade"
2. Calls `midtrans-token` edge function
3. Gets Snap token for ONE-TIME payment
4. User completes payment
5. Subscription updated in database

#### Recommended Flow (Recurring Payment):
1. User clicks "Upgrade" 
2. Call `midtrans-subscription` edge function (already created!)
3. Get subscription token from Midtrans
4. User authorizes recurring payment
5. Midtrans handles automatic monthly billing
6. Webhook updates subscription status

## Edge Functions Status

### ✅ `midtrans-token` (One-Time Payment)
- **Purpose**: Creates one-time payment token
- **Status**: Working, but updates subscription immediately (wrong for recurring)
- **Issue**: Lines 73-88 update subscription status BEFORE payment confirmation

### ✅ `midtrans-subscription` (Recurring Payment) 
- **Purpose**: Creates recurring subscription with Midtrans
- **Status**: Implemented but NOT being used
- **API**: Uses Midtrans Subscription API correctly

### ✅ `midtrans-webhook` (Payment Notifications)
- **Purpose**: Receives payment status updates from Midtrans
- **Status**: Implemented
- **Needs**: Midtrans webhook URL configuration

## Required Changes for Recurring Payments

### 1. Update Subscription Page to Use Recurring Flow

**File**: `src/pages/Subscription.tsx`

Change the `handleUpgrade` function to call `midtrans-subscription` instead of `midtrans-token`:

```typescript
const handleUpgrade = async () => {
  if (!userId) return;
  setIsLoading(true);

  try {
    // Get user info
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call SUBSCRIPTION function (not token)
    const { data, error } = await supabase.functions.invoke(
      "midtrans-subscription",  // Changed from "midtrans-token"
      {
        body: {
          user_id: userId,
          customer_name: user?.user_metadata?.name || "User",
          customer_email: user?.email || "",
          amount: 99000,
        },
      }
    );

    if (error || !data?.token) {
      toast.error("Gagal membuat subscription");
      setIsLoading(false);
      return;
    }

    // Open Snap with subscription token
    if (window.snap) {
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          toast.success("Subscription berhasil dibuat!");
          // Don't update immediately - wait for webhook
        },
        onPending: function (result: any) {
          toast.info("Menunggu konfirmasi pembayaran");
        },
        onError: function (result: any) {
          toast.error("Subscription gagal");
        },
        onClose: function () {
          toast.info("Popup ditutup");
        },
      });
    }
  } catch (err) {
    toast.error("Terjadi kesalahan");
  }
  
  setIsLoading(false);
};
```

### 2. Fix Edge Function Database Updates

**File**: `supabase/functions/midtrans-token/index.ts`

**Remove** lines 73-88 (database updates) because payment confirmation should happen via webhook:

```typescript
// DELETE THESE LINES (73-88):
// await supabaseAdmin
//   .from("profiles")
//   .update({
//     payment_token: snapData.token,
//     subscription_status: "premium",
//   })
//   .eq("id", user_id);
//
// await supabaseAdmin
//   .from("subscriptions")
//   .update({
//     plan: "premium",
//     end_date: endDate.toISOString(),
//     amount_paid: gross_amount,
//   })
//   .eq("user_id", user_id);

// Just return the token:
return new Response(JSON.stringify({ token: snapData.token }), {
  status: 200,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
```

### 3. Configure Midtrans Webhook

**Midtrans Dashboard Steps**:
1. Go to Settings → Configuration
2. Set Payment Notification URL to: `https://[your-supabase-url]/functions/v1/midtrans-webhook`
3. Enable notification for: `payment`, `recurring`

### 4. Update Webhook to Handle Subscriptions

**File**: `supabase/functions/midtrans-webhook/index.ts`

Update to handle both one-time and recurring payments:

```typescript
serve(async (req) => {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  try {
    const body = await req.json();
    
    const transaction_status = body.transaction_status;
    const order_id = body.order_id;
    const subscription_id = body.subscription_id; // For recurring
    
    // Extract user_id from order_id (format: ORDER-{timestamp}-{user_id})
    // OR get from subscription metadata
    const user_id = body.custom_field1 || body.metadata?.user_id;

    if (!user_id) {
      console.error("No user_id in webhook");
      return new Response("Invalid data", { status: 400 });
    }

    // Handle subscription status
    if (subscription_id) {
      const status = body.status; // active, cancelled, expired
      await supabaseAdmin
        .from("profiles")
        .update({ 
          subscription_status: status === "active" ? "premium" : "free",
          last_payment_id: subscription_id 
        })
        .eq("id", user_id);
    }
    
    // Handle one-time payment
    if (transaction_status === "settlement" || transaction_status === "capture") {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "premium" })
        .eq("id", user_id);
        
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "premium",
          end_date: endDate.toISOString(),
          amount_paid: body.gross_amount,
        })
        .eq("user_id", user_id);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
});
```

## Testing Checklist

### Local Testing
- [ ] Supabase client connects (no more "supabaseUrl is required" error)
- [ ] Midtrans Snap loads correctly
- [ ] Edge functions are deployed to Supabase
- [ ] Environment variables are set in Supabase Dashboard

### Midtrans Integration
- [ ] Test Subscription API call
- [ ] Verify Snap popup shows recurring payment option
- [ ] Check webhook receives notifications
- [ ] Verify database updates correctly

### Production Checklist
- [ ] Change Midtrans from sandbox to production
- [ ] Update Snap script src to production URL
- [ ] Configure production webhook URL
- [ ] Test with real payment method

## Environment Variables Summary

### Frontend (.env or Replit Secrets):
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)
- ✅ `VITE_MIDTRANS_CLIENT_KEY`

### Supabase Edge Functions (Set in Supabase Dashboard):
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `MIDTRANS_SERVER_KEY`

## Next Steps

1. **Deploy Edge Functions** to Supabase:
   ```bash
   supabase functions deploy midtrans-token
   supabase functions deploy midtrans-subscription
   supabase functions deploy midtrans-webhook
   ```

2. **Update Frontend** to use `midtrans-subscription` for recurring payments

3. **Configure Webhook** in Midtrans Dashboard

4. **Test** the complete flow in sandbox mode

5. **Switch to Production** when ready
