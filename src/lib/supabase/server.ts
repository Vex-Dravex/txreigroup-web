import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  }

  const cookieStore = await cookies();

  // Helper to safely set cookies - only works in Route Handlers and Server Actions
  const safeSetCookie = (name: string, value: string, options?: any) => {
    try {
      cookieStore.set(name, value, options);
    } catch {
      // Silently fail in Server Components - cookies can only be set in Route Handlers/Actions
      // This is expected behavior for read-only operations
    }
  };

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Next.js only allows cookie modifications in Server Actions or Route Handlers.
        // In Server Components, we can't set cookies, so we skip this operation.
        // Cookies will be properly set in Route Handlers and Server Actions where needed.
        // For read-only operations in Server Components, we don't need to update cookies.
        cookiesToSet.forEach(({ name, value, options }) => {
          safeSetCookie(name, value, options);
        });
      },
    },
  });
}
