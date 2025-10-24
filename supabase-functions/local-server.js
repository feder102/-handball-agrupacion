// Simple Express server to emulate the Supabase Edge Function locally.
// Usage:
// 1) In supabase-functions folder: npm install
// 2) Set environment variables locally (e.g., create .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
// 3) npm start

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

// Allow CORS from the Vite dev server (and any origin during local dev)
// Adjust the origin in production to be more restrictive.
app.use(
  cors({
    origin: process.env.LOCAL_CORS_ORIGIN || 'http://localhost:3002',
    methods: ['GET', 'POST', 'OPTIONS'],
    // include x-admin-secret so admin UI can send the header in requests
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
    credentials: false,
  })
);

// Respond to preflight requests for all routes
app.options('*', (req, res) => {
  res.sendStatus(204);
});

// Use a shared helper that creates the admin client (keeps creation logic in one place)
const { supabaseAdmin } = require('./lib/supabaseAdmin');

app.post('/create-user', async (req, res) => {
  try {
    const { userId, fullName, document, email, phone, role } = req.body;

    console.log('POST /create-user payload:', JSON.stringify(req.body));

    if (!userId || !document || !email || !fullName) {
      console.warn('Missing required fields in payload');
      return res.status(400).json({ error: 'Missing required fields', received: req.body });
    }

    // If the request includes a valid admin secret header, allow the
    // client-provided role; otherwise force role to 'socio' for public
    // registration flows.
    const adminSecret = process.env.LOCAL_ADMIN_SECRET;
    const providedAdminSecret = req.headers['x-admin-secret'];
    const isAdminCall = adminSecret && providedAdminSecret === adminSecret;

    const rpcPayload = {
      p_id: userId,
      p_documento: document,
      p_email: email,
      p_nombre: fullName,
      p_telefono: phone ?? null,
      p_rol_nombre: isAdminCall ? role ?? 'socio' : 'socio',
    };

    console.log('Calling RPC create_usuario with:', JSON.stringify(rpcPayload));

    // If phone wasn't provided by the client, try to fetch it from
    // the auth.users row (user metadata) as a fallback. This covers
    // cases where the client stored the phone in user_metadata but
    // the top-level 'phone' field is null (e.g., email signups).
    if (!rpcPayload.p_telefono) {
      try {
        console.log('No phone provided in payload — looking up auth.users for phone/raw_user_meta_data');
        const usr = await supabaseAdmin.from('auth.users').select('phone, raw_user_meta_data').eq('id', userId).maybeSingle();
        console.log('auth.users lookup result:', JSON.stringify(usr, null, 2));
        const authPhone = usr?.data?.phone || (usr?.data?.raw_user_meta_data && usr.data.raw_user_meta_data.phone) || null;
        if (authPhone) {
          rpcPayload.p_telefono = authPhone;
          console.log('Using phone from auth.users:', authPhone);
        } else {
          console.log('No phone found in auth.users for user', userId);
        }
      } catch (e) {
        console.warn('Failed to lookup auth.users for phone fallback:', String(e));
      }
    }

    const rpcRes = await supabaseAdmin.rpc('create_usuario', rpcPayload);

    // Log the full RPC response from supabase-js (includes data and error)
    console.log('RPC response:', JSON.stringify(rpcRes, null, 2));

    if (rpcRes.error) {
      // Return both the error and any detail useful for debugging
      return res.status(500).json({
        success: false,
        payload: req.body,
        rpc: {
          error: rpcRes.error,
          data: rpcRes.data ?? null,
        },
      });
    }

    return res.json({ success: true, payload: req.body, rpc: { data: rpcRes.data } });
  } catch (err) {
    console.error('Exception in /create-user:', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Admin-only endpoint: creates an auth user (admin API) and the related
// usuarios row. Requires the LOCAL_ADMIN_SECRET to be present in the
// request header 'x-admin-secret'. This endpoint is intended for the
// admin UI and should be protected in production (e.g., via session
// verification or a signed token).
app.post('/admin/create-user', async (req, res) => {
  try {
    const adminSecret = process.env.LOCAL_ADMIN_SECRET;
    const providedAdminSecret = req.headers['x-admin-secret'];
    if (!adminSecret || providedAdminSecret !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, password, fullName, document, phone, role } = req.body;
    if (!email || !password || !fullName || !document || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the user in Auth using the service role key
    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone: phone ?? null,
      user_metadata: { full_name: fullName, document, role },
    });

    if (createRes.error) {
      return res.status(500).json({ error: createRes.error.message, detail: createRes.error });
    }

    const userId = createRes.data?.user?.id;
    if (!userId) return res.status(500).json({ error: 'Failed to create auth user' });

    // Call the RPC to create the usuarios row
    const rpcPayload = {
      p_id: userId,
      p_documento: document,
      p_email: email,
      p_nombre: fullName,
      p_telefono: phone ?? null,
      p_rol_nombre: role,
    };

    const rpcRes = await supabaseAdmin.rpc('create_usuario', rpcPayload);
    if (rpcRes.error) {
      return res.status(500).json({ error: rpcRes.error, data: rpcRes.data ?? null });
    }

    return res.json({ success: true, userId, rpc: rpcRes.data });
  } catch (err) {
    console.error('Exception in /admin/create-user:', err);
    return res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 54321;
app.listen(port, () => {
  console.log(`Supabase local server listening on http://localhost:${port}`);
});
