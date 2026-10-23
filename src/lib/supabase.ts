import { createClient } from "@supabase/supabase-js";

// Client-side Supabase configuration
// Only public, anonymous keys are accessed here.
// NEVER add SUPABASE_SERVICE_ROLE_KEY to any frontend code!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id")
);

// Fallback dummy client if environment variables are not yet populated
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient("https://placeholder-project.supabase.co", "placeholder-key", {
      auth: { persistSession: false },
    });
