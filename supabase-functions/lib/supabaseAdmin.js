const { createClient } = require('@supabase/supabase-js');

function createSupabaseAdmin() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Export both a factory and a default client for convenience in local scripts
const supabaseAdmin = createSupabaseAdmin();
module.exports = { createSupabaseAdmin, supabaseAdmin };
