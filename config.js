// Paste your values from Supabase > Project Settings > API
const SUPABASE_URL = "https://yhrvcbjvlnflohtscgea.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7rj5uzVdVgn2lY_QsAbbJg_xNn9dvMk"; // anon key only, never the service key
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
