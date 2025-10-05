import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  try {
    const body = await req.json();
    const subscription_id = body.id;
    const status = body.status; // "active", "pending", "expired", "cancelled", "failed"
    const user_id = body.metadata?.user_id; // optional jika dikirim

    if (!subscription_id || !user_id) {
      return new Response("Invalid webhook data", { status: 400 });
    }

    // Update status subscription di database
    let updates: any = { subscription_status: status };
    if (status === "active") {
      const now = new Date();
      updates.subscription_expiry = new Date(now.setMonth(now.getMonth() + 1));
    }

    await supabaseAdmin.from("profiles").update(updates).eq("id", user_id);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
});
