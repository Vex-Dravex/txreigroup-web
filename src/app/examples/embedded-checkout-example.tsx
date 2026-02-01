"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import FadeIn, { FadeInStagger } from "@/app/components/FadeIn";
import { Check } from "lucide-react";

export default function SubscriptionPageWithEmbeddedCheckout() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSuccess = () => {
        // Redirect to success page or show success message
        router.push("/onboarding/subscription?success=true");
    };

    const handleCancel = () => {
        setSelectedPlan(null);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                            Choose Your Plan
                        </h1>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Get instant access to exclusive real estate deals, analytics, and our investor community
                        </p>
                    </div>
                </FadeIn>

                <FadeInStagger>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PRICING_TIERS.map((tier) => (
                            <FadeIn key={tier.id}>
                                <div
                                    className={`relative bg-white dark:bg-zinc-900 rounded-2xl p-6 border-2 transition-all ${tier.highlight
                                            ? "border-blue-500 shadow-xl shadow-blue-500/20"
                                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        }`}
                                >
                                    {/* Badge */}
                                    {tier.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tier.highlight
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                    }`}
                                            >
                                                {tier.badge}
                                            </span>
                                        </div>
                                    )}

                                    {/* Plan Name */}
                                    <div className="text-center mb-6 mt-2">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                            {tier.name}
                                        </h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                                                {tier.price}
                                            </span>
                                            <span className="text-zinc-500 dark:text-zinc-400">
                                                /{tier.interval}
                                            </span>
                                        </div>
                                        {tier.savings && (
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                                {tier.savings}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-6">
                                        {tier.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6">
                                        {tier.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button - Now uses Embedded Checkout */}
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
                    </div>
                </FadeInStagger>

                {/* Trust Indicators */}
                <FadeIn>
                    <div className="mt-12 text-center">
                        <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                Secure Payment
                            </div>
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                14-Day Free Trial
                            </div>
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Cancel Anytime
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
