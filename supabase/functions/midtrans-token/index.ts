import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { order_id, gross_amount, customer_name, customer_email, user_id } =
      await req.json();

    if (!order_id || !gross_amount || !customer_name || !customer_email) {
      return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const basicAuth = "Basic " + btoa(`${MIDTRANS_SERVER_KEY}:`);

    const snapRes = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: basicAuth,
        },
        body: JSON.stringify({
          transaction_details: { order_id, gross_amount },
          customer_details: {
            first_name: customer_name,
            email: customer_email,
          },
        }),
      }
    );

    const snapData = await snapRes.json();

    if (!snapRes.ok) {
      return new Response(JSON.stringify({ error: snapData }), {
        status: snapRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store token temporarily for reference
    await supabaseAdmin
      .from("profiles")
      .update({
        payment_token: snapData.token,
      })
      .eq("id", user_id);

    // Return token - subscription will be updated via webhook after payment
    return new Response(JSON.stringify({ token: snapData.token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
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
