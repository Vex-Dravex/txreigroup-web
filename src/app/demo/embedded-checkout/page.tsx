"use client";

import { useRouter } from "next/navigation";
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import FadeIn, { FadeInStagger } from "@/app/components/FadeIn";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EmbeddedCheckoutDemoPage() {
    const router = useRouter();

    const handleSuccess = () => {
        alert("🎉 Payment Successful! In production, this would redirect to your dashboard.");
        router.push("/app");
    };

    const handleCancel = () => {
        console.log("User cancelled checkout");
    };

    return (
        <div className="min-h-screen bg-zinc-950 selection:bg-blue-500/30">
            <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.05]" />

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/onboarding/subscription"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Original Subscription Page
                </Link>

                <FadeIn>
                    <div className="text-center mb-8">
                        <div className="inline-flex px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold uppercase tracking-wide mb-4">
                            ✨ New: Embedded Checkout Demo
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white sm:text-6xl font-display">
                            Embedded Checkout <span className="text-blue-500">Experience</span>
                        </h1>
                        <p className="mt-4 text-xl text-zinc-400 max-w-3xl mx-auto">
                            This is the new embedded checkout - users stay on your site! Click any plan below to see the modal in action.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-8 text-sm text-zinc-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                No redirect to Stripe
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Modal opens on your site
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Seamless experience
                            </div>
                        </div>
                    </div>
                </FadeIn>

                <FadeInStagger className="grid gap-8 lg:grid-cols-4 md:grid-cols-2 mt-12">
                    {PRICING_TIERS.map((tier) => (
                        <FadeIn key={tier.id}>
                            <div
                                className={`relative flex flex-col rounded-2xl border p-6 shadow-xl transition-all hover:scale-[1.02] ${tier.highlight
                                    ? "border-blue-500 bg-zinc-900/80 ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950"
                                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                    }`}
                            >
                                {tier.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                                        {tier.badge}
                                    </div>
                                )}

                                <div className="mb-5">
                                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                                    {tier.valueHook && (
                                        <p className="mt-1 text-sm font-medium text-blue-400">{tier.valueHook}</p>
                                    )}
                                </div>

                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">{tier.price}</span>
                                    <span className="text-sm font-medium text-zinc-400">/{tier.interval}</span>
                                </div>

                                <p className="mb-6 text-sm text-zinc-400">{tier.description}</p>

                                {/* Trial Information Block */}
                                <div className="mb-10 p-5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Start Today • Free</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-zinc-300 font-medium">
                                            Your 14-day free trial starts today. You will only be billed <span className="text-white font-bold">{tier.price}</span> for <span className="text-white font-bold">{tier.name}</span> after your trial period ends.
                                        </p>
                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                                                Cancel anytime during trial
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {tier.savings && (
                                    <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-emerald-500">
                                        Save {tier.savings}
                                    </p>
                                )}

                                {/* Embedded Checkout Component */}
                                <EmbeddedCheckout
                                    priceId={tier.priceId}
                                    planName={tier.name}
                                    planPrice={tier.price}
                                    onSuccess={handleSuccess}
                                    onCancel={handleCancel}
                                />
                            </div>
                        </FadeIn>
                    ))}
                </FadeInStagger>

                {/* Info Section */}
                <FadeIn delay={0.4}>
                    <div className="mt-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            🎨 What's Different?
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 text-zinc-300">
                            <div>
                                <h3 className="font-bold text-white mb-2">❌ Old (Hosted Checkout)</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>• Redirects to stripe.com</li>
                                    <li>• User leaves your site</li>
                                    <li>• Less control over UX</li>
                                    <li>• Redirect friction</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-400 mb-2">✅ New (Embedded Checkout)</h3>
                                <ul className="space-y-2 text-sm">
                                    <li>• Modal opens on your site</li>
                                    <li>• User stays on your site</li>
                                    <li>• Full control over UX</li>
                                    <li>• Seamless experience</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <p className="text-sm text-blue-300">
                                💡 <strong>Test it:</strong> Click any "SELECT" button above. A modal will open right here on this page - no redirect! Use test card: <code className="bg-zinc-800 px-2 py-1 rounded">4242 4242 4242 4242</code>
                            </p>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={0.5}>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-zinc-500">
                            By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel anytime during your trial to avoid being charged.
                        </p>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
