// Supabase Edge Function (Deno) - create-user
// Deploy with: supabase functions deploy create-user --project-ref <ref>
// This function uses the SERVICE_ROLE key from environment variables
// to call the Postgres RPC `public.create_usuario` securely.

import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { userId, fullName, document, email, phone, role } = body;

    if (!userId || !document || !email || !fullName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Llama la función RPC 'public.create_usuario' definida en la DB.
    const { data, error } = await supabaseAdmin.rpc("create_usuario", {
      p_id: userId,
      p_documento: document,
      p_email: email,
      p_nombre: fullName,
      p_telefono: phone ?? null,
      p_rol_nombre: role ?? null,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message, details: error }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
