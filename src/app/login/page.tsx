"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if Supabase env vars are available on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      const isProduction = process.env.NODE_ENV === 'production';
      const missingVars = [];
      if (!url) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!key) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      
      setError(
        isProduction
          ? `Configuration Error: Missing environment variables (${missingVars.join(', ')}). To fix: 1) Go to your Vercel project dashboard → Settings → Environment Variables, 2) Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your Supabase dashboard, 3) Redeploy your application.`
          : `Configuration Error: Missing environment variables (${missingVars.join(', ')}). Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your Supabase dashboard.`
      );
    }
    
    // Check for error query parameter (e.g., from auth callback)
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_token") {
      setError("The email confirmation link is invalid or has expired. Please try signing up again or request a new confirmation email.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Validate env vars before creating client
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error("Supabase configuration is missing. Please check your environment variables.");
      }
      
      // Create client only when needed (client-side only)
      const supabase = createSupabaseBrowserClient();
      
      if (mode === "signup") {
        const { data: signUpData, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          }
        });
        
        if (error) throw error;
        
        // Check if email confirmation is required
        if (signUpData.user && !signUpData.session) {
          // Email confirmation required
          setSuccessMessage(
            "Account created! Please check your email and click the confirmation link to verify your account before signing in."
          );
          // Don't redirect - user needs to confirm email first
          setMode("signin"); // Switch to signin mode so they can log in after confirming
        } else if (signUpData.session) {
          // Auto-logged in (email confirmation disabled)
          setSuccessMessage("Account created! Redirecting...");
          router.push(next);
          router.refresh();
        } else {
          // Fallback
          setSuccessMessage("Account created! Please check your email to verify your account.");
          setMode("signin");
        }
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          // Provide more helpful error messages
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Please check your credentials and try again.");
          } else if (error.message.includes("Email not confirmed")) {
            throw new Error("Please check your email and click the confirmation link to verify your account before signing in.");
          } else {
            throw error;
          }
        }
        
        if (!signInData.user) {
          throw new Error("Sign in failed. Please try again.");
        }
        
        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <main className="w-full max-w-md space-y-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">TXREIGROUP</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Texas Real Estate Investor Community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
