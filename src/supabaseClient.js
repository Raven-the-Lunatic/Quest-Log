import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloud Sync is entirely optional — the free tier (localStorage only) works with no
// Supabase project configured at all. When these env vars are missing, `supabase` is
// null and every call site checks for that before touching it.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
