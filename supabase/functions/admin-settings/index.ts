import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "PUT") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Check if user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin role
    const { data: hasAdminRole } = await supabaseAdmin
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET settings
    if (req.method === "POST") {
      const { data: settings, error } = await supabaseAdmin
        .from("app_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch settings" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Settings fetched successfully",
          data: settings,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // UPDATE settings
    if (req.method === "PUT") {
      const updates = await req.json();

      // Get the first (and should be only) settings record
      const { data: currentSettings } = await supabaseAdmin
        .from("app_settings")
        .select("id")
        .single();

      if (!currentSettings) {
        return new Response(JSON.stringify({ error: "Settings not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: updatedSettings, error } = await supabaseAdmin
        .from("app_settings")
        .update(updates)
        .eq("id", currentSettings.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating settings:", error);
        return new Response(JSON.stringify({ error: "Failed to update settings" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Settings updated successfully",
          data: updatedSettings,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
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
