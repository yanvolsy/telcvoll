const { json, getSupabaseUrl } = require('./_lib/auth');

exports.handler = async () => {
  return json(200, {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    supabaseUrl: getSupabaseUrl(),
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_CLIENT_KEY || '',
  });
};
