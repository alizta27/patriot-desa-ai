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
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's current subscription status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("subscription_status, subscription_expiry")
      .eq("id", user_id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    const expiryDate = profile.subscription_expiry ? new Date(profile.subscription_expiry) : null;
    
    // Check if subscription has expired
    if (profile.subscription_status === "premium" && expiryDate && expiryDate < now) {
      console.log(`Subscription expired for user ${user_id}, downgrading to free`);
      
      // Downgrade to free
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "free",
          subscription_expiry: null,
        })
        .eq("id", user_id);

      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "free",
          end_date: null,
        })
        .eq("user_id", user_id);

      return new Response(
        JSON.stringify({
          status: "free",
          expired: true,
          message: "Subscription expired and downgraded to free",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return current status
    return new Response(
      JSON.stringify({
        status: profile.subscription_status,
        expiry: profile.subscription_expiry,
        expired: false,
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
