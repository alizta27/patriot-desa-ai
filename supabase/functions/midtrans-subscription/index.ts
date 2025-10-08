import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Supabase Admin
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Midtrans
const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY")!;
const MIDTRANS_BASE = "https://api.sandbox.midtrans.com/v1";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const amount = 99000;
    const { user_id, customer_name, customer_email, card_token } = body;
    if (!user_id || !customer_name || !customer_email) {
      return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no card token provided, return Snap token for first payment
    if (!card_token) {
      // Step 1: Get Snap token for first payment (full amount)
      const snapResp = await fetch(
        `https://app.sandbox.midtrans.com/snap/v1/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa(MIDTRANS_SERVER_KEY + ":"),
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: `FIRST-PAY-${Date.now()}-${user_id.substring(0, 8)}`,
              gross_amount: amount.toString(), // Full amount for first payment
            },
            credit_card: {
              secure: true,
              save_card: true, // Important: save card for subscription
            },
            customer_details: {
              first_name: customer_name,
              email: customer_email,
            },
            enabled_payments: ["credit_card"],
            custom_field1: user_id, // For webhook tracking
          }),
        }
      );

      const snapData = await snapResp.json();
      if (!snapResp.ok) {
        return new Response(JSON.stringify({ error: snapData }), {
          status: snapResp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Return Snap token for first payment
      return new Response(
        JSON.stringify({
          snap_token: snapData.token,
          redirect_url: snapData.redirect_url,
          step: "first_payment",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Create subscription with saved card token
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // Start 1 hour from now
    const start_time = startTime.toISOString().replace("Z", "+07:00");

    const subscriptionPayload = {
      name: `MONTHLY_${new Date().getFullYear()}`,
      amount: amount.toString(),
      currency: "IDR",
      payment_type: "credit_card",
      token: card_token,
      custom_field1: user_id, // Add user_id for webhook tracking
      schedule: {
        interval: 1,
        interval_unit: "month",
        max_interval: 12,
        start_time: start_time,
      },
      retry_schedule: {
        interval: 1,
        interval_unit: "day",
        max_interval: 3,
      },
      metadata: {
        description: "Patriot Desa Premium Subscription",
        user_id: user_id,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email,
      },
    };

    const resp = await fetch(`${MIDTRANS_BASE}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(MIDTRANS_SERVER_KEY + ":"),
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save subscription details
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await supabaseAdmin
      .from("profiles")
      .update({
        last_payment_id: data.id,
        subscription_status: "premium",
        subscription_expiry: endDate.toISOString(),
      })
      .eq("id", user_id);

    await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: "premium",
        end_date: endDate.toISOString(),
        amount_paid: amount,
      })
      .eq("user_id", user_id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: data.id,
        subscription_name: data.name,
        status: data.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
