// Paste your values from Supabase > Project Settings > API
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY"; // anon key only, never the service key
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
