export const env = {
  appName: import.meta.env.VITE_APP_NAME || "TheWayToInterview",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

