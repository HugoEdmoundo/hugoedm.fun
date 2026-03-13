import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "hugoedm.fun@portfolio.local";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const accessCode = String(body?.accessCode ?? "").trim();

    if (!accessCode) {
      return new Response(JSON.stringify({ error: "Access code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: config, error: configError } = await supabase
      .from("site_config")
      .select("admin_code")
      .limit(1)
      .single();

    if (configError) throw configError;

    if (!config || config.admin_code !== accessCode) {
      return new Response(JSON.stringify({ error: "Invalid access code" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) throw usersError;

    const existingAdmin = usersData.users.find((user) => user.email === ADMIN_EMAIL);

    let adminUserId: string;

    if (!existingAdmin) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: accessCode,
        email_confirm: true,
        user_metadata: { display_name: "Admin" },
      });
      if (createError) throw createError;
      adminUserId = created.user.id;
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingAdmin.id, {
        password: accessCode,
        email_confirm: true,
      });
      if (updateError) throw updateError;
      adminUserId = existingAdmin.id;
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: adminUserId, role: "admin" }, { onConflict: "user_id,role" });

    if (roleError) throw roleError;

    return new Response(JSON.stringify({ ok: true, message: "Admin ready" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
