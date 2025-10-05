import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

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
    const { user_id, customer_name, customer_email, amount } = body;

    if (!user_id || !customer_name || !customer_email || !amount) {
      return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tanggal mulai subscription
    const startTime = new Date();
    const start_time = startTime.toISOString().replace("Z", "+07:00");

    // Request create subscription ke Midtrans
    const resp = await fetch(`${MIDTRANS_BASE}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(MIDTRANS_SERVER_KEY + ":"),
      },
      body: JSON.stringify({
        name: "Premium Subscription",
        amount,
        currency: "IDR",
        interval: 1,
        interval_unit: "month",
        start_time,
        payment_type: "credit_card",
        customer_details: {
          first_name: customer_name,
          email: customer_email,
        },
        metadata: {
          user_id: user_id,
        },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Simpan subscription_id sementara di database
    await supabaseAdmin
      .from("profiles")
      .update({
        last_payment_id: data.id,
        subscription_status: "premium",
      })
      .eq("id", user_id);

    // Return token + subscription_id ke frontend
    return new Response(
      JSON.stringify({
        token: data.token,
        subscription_id: data.id,
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
