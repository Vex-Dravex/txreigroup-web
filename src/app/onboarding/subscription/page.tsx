"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import PricingCard from "./components/PricingCard";
import { getStripe } from "@/lib/stripe-client";
import FadeIn, { FadeInStagger } from "@/app/components/FadeIn";

export default function SubscriptionPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleSelectPlan = async (priceId: string) => {
        try {
            setLoading(priceId);

            // Create a checkout session
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId,
                    successUrl: window.location.origin + "/app?session_id={CHECKOUT_SESSION_ID}",
                    cancelUrl: window.location.origin + "/onboarding/subscription",
                }),
            });

            const { url, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setLoading(null);
        }
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
                <FadeIn>
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl font-display">
                            Start your <span className="text-blue-500">14-day free trial</span>
                        </h1>
                        <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto">
                            Unlock the full power of the TX REI Group platform. Analyze deals, connect with top-tier vendors, and grow your portfolio.
                        </p>
                    </div>
                </FadeIn>

                <FadeInStagger className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
                    {PRICING_TIERS.map((tier) => (
                        <FadeIn key={tier.id}>
                            <PricingCard
                                tier={tier}
                                onSelect={handleSelectPlan}
                                isLoading={loading === tier.priceId}
                            />
                        </FadeIn>
                    ))}
                </FadeInStagger>

                <FadeIn delay={0.4}>
                    <div className="mt-16 text-center">
                        <p className="text-sm text-zinc-500">
                            By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel anytime during your trial to avoid being charged.
                        </p>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
