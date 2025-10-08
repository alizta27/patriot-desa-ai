import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
  try {
    const { user_id, customer_name, customer_email } = await req.json();
    if (!user_id || !customer_name || !customer_email) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    const amount = 99000; // Fixed amount
    // Create simple one-time payment transaction
    const snapPayload = {
      transaction_details: {
        order_id: `ONETIME-${Date.now()}-${user_id.substring(0, 8)}`,
        gross_amount: amount.toString(),
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email,
      },
      // enabled_payments: [
      //   "credit_card"
      // ],
      custom_field1: user_id,
    };
    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(MIDTRANS_SERVER_KEY + ":"),
        },
        body: JSON.stringify(snapPayload),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        snap_token: data.token,
        redirect_url: data.redirect_url,
        message: "Payment token created successfully",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
