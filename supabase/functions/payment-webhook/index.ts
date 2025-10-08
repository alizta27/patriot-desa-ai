import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const { transaction_status, order_id, custom_field1 } = body;
    const user_id = custom_field1;

    if (!user_id) {
      console.error("No user_id found in webhook");
      return new Response("Missing user_id", { status: 400 });
    }

    // Handle one-time payment completion
    if (order_id && order_id.startsWith("ONETIME-") && transaction_status === "settlement") {
      console.log("One-time payment completed, upgrading user to premium...");
      
      // Set premium for 30 days from now
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days premium

      // Update profiles table
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "premium",
          subscription_expiry: endDate.toISOString(),
          last_payment_id: order_id,
        })
        .eq("id", user_id);

      // Update subscriptions table
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "premium",
          end_date: endDate.toISOString(),
          amount_paid: body.gross_amount || 99000,
        })
        .eq("user_id", user_id);

      console.log(`User ${user_id} upgraded to premium until ${endDate.toISOString()}`);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});
