import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // During build/prerender, env vars might not be available
    // Return a client that will fail gracefully on actual use
    if (typeof window === 'undefined') {
      // Return a mock during SSR/build - actual client created on client side
      return {
        auth: {
          signUp: async () => ({ error: { message: 'Not available during build' } }),
          signInWithPassword: async () => ({ error: { message: 'Not available during build' } }),
        },
      } as any;
    }
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  }
  
  return createBrowserClient(url, key);
}
