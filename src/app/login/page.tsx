"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const requestedMode = searchParams.get("mode");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | "facebook" | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const roleOptions = [
    { value: "investor", label: "Investor", icon: "📈", desc: "Buying and holding assets" },
    { value: "wholesaler", label: "Wholesaler", icon: "⚡", desc: "Finding and assigning deals" },
    { value: "vendor", label: "Vendor", icon: "🛠️", desc: "Providing supplies or services" },
    { value: "contractor", label: "Transaction Services", icon: "📑", desc: "Managing documentation" },
  ];

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
          ? `Configuration Error: Missing environment variables (${missingVars.join(', ')}).`
          : `Configuration Error: Missing environment variables (${missingVars.join(', ')}). Please check your .env.local file.`
      );
    }

    const errorParam = searchParams.get("error");
    if (errorParam === "invalid_token") {
      setError("The email confirmation link is invalid or has expired.");
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

  function validatePassword(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          throw new Error(passwordError);
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const redirectUrl = `${siteUrl}/auth/callback`;

        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          }
        });

        if (error) throw error;

        if (signUpData.user && !signUpData.session) {
          setSuccessMessage("Account created! Please check your email to verify your account.");
          setMode("signin");
        } else if (signUpData.session) {
          // User signed up and has immediate session (email confirmation disabled)
          // Redirect to onboarding since they're a new user
          setSuccessMessage("Account created! Setting up your profile...");
          router.push("/onboarding");
          router.refresh();
        }
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        if (!signInData.user) throw new Error("Sign in failed.");

        // Check if user has completed onboarding
        const { data: onboardingData } = await supabase
          .from('user_onboarding')
          .select('completed')
          .eq('user_id', signInData.user.id)
          .single();

        // If user hasn't completed onboarding, redirect to onboarding
        if (!onboardingData || !onboardingData.completed) {
          router.push("/onboarding");
        } else {
          router.push(next);
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-8 selection:bg-blue-500/30">
      <div className="noise-overlay opacity-20" />

      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px]"
        />
      </div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl glass rounded-[2.5rem] p-8 md:p-12 lg:p-16 overflow-hidden shadow-2xl border-white/10"
      >
        <div className="absolute top-0 right-0 p-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Header Section */}
          <div className="space-y-10 relative">
            {/* Large background logo - creates depth and brand presence */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] opacity-[0.15] pointer-events-none">
              <Image
                src="/logo.png"
                alt=""
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-6 relative z-10 flex flex-col items-center text-center">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95]"
              >
                {mode === "signin" ? (
                  <>Welcome <span className="text-blue-500">Back</span></>
                ) : (
                  <>Start Your <span className="text-purple-500">Journey</span></>
                )}
              </motion.h1>
              <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
                {mode === "signin"
                  ? "Continue building your real estate empire and connect with the best in Texas."
                  : "Join the premier ecosystem for wholesalers, investors, and vendors."}
              </p>
            </div>

            {/* Removed Social Logins from here */}
          </div>

          {/* Form Section */}
          <motion.div
            variants={staggerContainer}
            className="space-y-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wide text-zinc-400 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wide text-zinc-400 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium"
                  required
                  minLength={6}
                />
              </motion.div>

              <AnimatePresence>
                {mode === "signup" && (isPasswordFocused || password.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password Requirements</p>
                      <div className="grid grid-cols-1 gap-2">
                        {passwordRequirements.map((req, i) => (
                          <div key={i} className={`flex items-center gap-2 text-sm transition-colors duration-200 ${req.met ? "text-green-400" : "text-zinc-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${req.met ? "bg-green-400" : "bg-zinc-600"}`} />
                            {req.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    key="confirm-password"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={itemVariants}
                    className="space-y-3"
                  >
                    <label className="text-sm font-bold uppercase tracking-wide text-zinc-400 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium"
                      required
                      minLength={6}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:opacity-50 text-white text-base font-bold uppercase tracking-wider py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  mode === "signup" ? "Create Account" : "Sign In"
                )}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="space-y-8">
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                  <span className="bg-[#0c0c0e] px-4 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  className="relative flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98] group overflow-hidden"
                  disabled={oauthLoading !== null}
                >
                  {oauthLoading === 'google' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <span className="text-zinc-400 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                  </span>
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">
                    Continue with Google
                  </span>
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 text-center">
              <motion.button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-base font-bold text-zinc-500 hover:text-zinc-300 transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === "signin" ? (
                  <>New to HTXREIGROUP? <span className="text-blue-500 group-hover:text-blue-400 group-hover:underline decoration-2 underline-offset-4 transition-all">Sign Up Free</span></>
                ) : (
                  <>Already have an account? <span className="text-blue-500 group-hover:text-blue-400 group-hover:underline decoration-2 underline-offset-4 transition-all">Sign In</span></>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.main >

      {/* Decorative Blobs */}
      < div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-square pointer-events-none opacity-20" >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div >
    </div >
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
