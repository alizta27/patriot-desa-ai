import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const transaction_status = body.transaction_status;
    const order_id = body.order_id;
    const subscription_id = body.subscription_id;

    // Get user_id from order_id (format: ORDER-timestamp) or metadata
    const user_id = body.custom_field1 || body.metadata?.user_id;

    if (!user_id) {
      console.error("No user_id found in webhook data");
      return new Response("Invalid webhook data - missing user_id", {
        status: 400,
      });
    }

    // Handle recurring subscription updates
    if (subscription_id) {
      const status = body.status; // "active", "pending", "expired", "cancelled", "failed"

      const updates: any = {
        last_payment_id: subscription_id,
      };

      if (status === "active") {
        updates.subscription_status = "premium";
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        updates.subscription_expiry = endDate.toISOString();
      } else if (status === "expired" || status === "cancelled") {
        updates.subscription_status = "free";
        updates.subscription_expiry = null; // Clear expiry for expired/cancelled
      }

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", user_id);
      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // Update subscriptions table
      if (status === "active") {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan: "premium",
            end_date: endDate.toISOString(),
            amount_paid: body.gross_amount || 99000,
          })
          .eq("user_id", user_id);

        if (subError) {
          console.error("Error updating subscription:", subError);
        }
      }
    }

    // Handle one-time payment completion (first payment)
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      // Check if this is a first payment (FIRST-PAY order_id) or subscription payment
      const isFirstPayment = order_id && order_id.startsWith("FIRST-PAY");

      if (isFirstPayment) {
        console.log(
          "First payment completed, user can now create subscription"
        );
        // Don't update subscription status here - let the frontend handle subscription creation
        // Just log the successful first payment
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            last_payment_id: order_id,
          })
          .eq("id", user_id);

        if (profileError) {
          console.error(
            "Error updating profile for first payment:",
            profileError
          );
        }
      } else {
        // This is a regular subscription payment
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "premium",
            subscription_expiry: endDate.toISOString(),
            last_payment_id: order_id,
          })
          .eq("id", user_id);

        if (profileError) {
          console.error(
            "Error updating profile for subscription payment:",
            profileError
          );
        }

        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan: "premium",
            end_date: endDate.toISOString(),
            amount_paid: body.gross_amount,
          })
          .eq("user_id", user_id);

        if (subError) {
          console.error("Error updating subscription for payment:", subError);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});
