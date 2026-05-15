import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isTest = Boolean(import.meta.env.VITEST);

export const hasSupabase = Boolean(url && key) && !isTest;

export const supabase = hasSupabase
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
