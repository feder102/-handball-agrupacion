Supabase Edge Function: create-user

Purpose
-------
This function is an example Supabase Edge Function (Deno) that calls the Postgres RPC
`public.create_usuario` using the SERVICE_ROLE key. Use this to perform sensitive DB operations
(server-side) that should not run from the browser.

How to deploy
-------------
1. Install the Supabase CLI and login: https://supabase.com/docs/guides/cli

2. Set environment variables for the function (do NOT commit service role key to the repo):

   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

   When deploying with the Supabase CLI you can set variables via the dashboard or the CLI.

3. Deploy the function:

   supabase functions deploy create-user --project-ref <your-project-ref>

4. After deployment, copy the function's public URL and set it in your Vite app:

   In `web/.env` (local, not committed):

   VITE_CREATE_USER_URL=https://<your-function-url>/

Usage from the frontend
-----------------------
The frontend (already adapted) will POST JSON to `VITE_CREATE_USER_URL` with the body:

  { userId, fullName, document, email, phone, role }

The function will call the DB RPC and return JSON with `data` or `error`.

Security note
-------------
Keep the service role key secret. Do not add it to the repository. Use Supabase environment variables
or a secret manager in your deployment pipeline.
