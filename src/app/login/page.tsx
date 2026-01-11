"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const requestedMode = searchParams.get("mode");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | "facebook" | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const roleOptions = [
    { value: "investor", label: "Investor" },
    { value: "wholesaler", label: "Wholesaler" },
    { value: "vendor", label: "Vendor" },
    { value: "contractor", label: "Transaction Services" },
  ];

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

  useEffect(() => {
    if (requestedMode === "signup") {
      setMode("signup");
    } else if (requestedMode === "signin") {
      setMode("signin");
    }
  }, [requestedMode]);

  function toggleRole(value: string) {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((role) => role !== value) : [...prev, value]
    );
  }

  async function handleOAuthSignIn(provider: "google" | "apple" | "facebook") {
    setError(null);
    setSuccessMessage(null);
    setOauthLoading(provider);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        throw new Error("Supabase configuration is missing. Please check your environment variables.");
      }

      const supabase = createSupabaseBrowserClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed");
      setOauthLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "signup" && selectedRoles.length === 0) {
        throw new Error("Please select at least one role to continue.");
      }

      // Validate env vars before creating client
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error("Supabase configuration is missing. Please check your environment variables.");
      }
      
      // Create client only when needed (client-side only)
      const supabase = createSupabaseBrowserClient();
      
      if (mode === "signup") {
        // Use production URL from env var, fallback to current origin for development
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const redirectUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;
        
        const { data: signUpData, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              roles: selectedRoles,
            },
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-16 dark:from-zinc-900 dark:to-zinc-950">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full opacity-25 brightness-50">
          <Image
            src="/logo.png"
            alt=""
            fill
            className="object-contain scale-150"
            priority
          />
        </div>
      </div>

      <main className="relative z-10 w-full max-w-3xl space-y-6 rounded-2xl border border-zinc-200 bg-white/95 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        {mode === "signup" && (
          <div className="absolute right-6 top-6">
            <Link
              href="/"
              className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Back to homepage
            </Link>
          </div>
        )}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-4 h-32 w-64">
            <Image
              src="/logo.png"
              alt="Houston Real Estate Investment Group Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {mode === "signup"
              ? "Pick your roles and choose how you want to sign up."
              : "Sign in to continue building your real estate network."}
          </p>
        </div>

        <div className={mode === "signup" ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "space-y-4"}>
          <div className="space-y-4">
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

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-400 dark:bg-zinc-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Other options
              </span>
              <div className="h-px flex-1 bg-zinc-400 dark:bg-zinc-500" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={oauthLoading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                {oauthLoading === "google" ? "Connecting..." : "Google"}
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn("apple")}
                disabled={oauthLoading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  />
                </svg>
                {oauthLoading === "apple" ? "Connecting..." : "Apple"}
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={oauthLoading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
                  />
                </svg>
                {oauthLoading === "facebook" ? "Connecting..." : "Facebook"}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Select your role(s)
              </legend>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose all that apply so we can personalize your experience.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {roleOptions.map((role) => {
                  const isSelected = selectedRoles.includes(role.value);
                  return (
                    <label
                      key={role.value}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRole(role.value)}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                      />
                      {role.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>

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
