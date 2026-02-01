"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
import { useRouter } from "next/navigation";

interface PricingTier {
    id: string;
    name: string;
    price: string;
    interval: string;
    description: string;
    features: string[];
    highlight: boolean;
    badge?: string;
    valueHook?: string;
    savings?: string;
    priceId: string;
}

interface PricingCardProps {
    tier: PricingTier;
}

export default function PricingCard({ tier }: PricingCardProps) {
    const router = useRouter();

    const handleSuccess = () => {
        router.push("/app");
    };

    const handleCancel = () => {
        console.log("Checkout cancelled");
    };
    return (
        <div
            className={cn(
                "relative flex flex-col rounded-2xl border p-6 shadow-xl transition-all hover:scale-[1.02]",
                tier.highlight
                    ? "border-blue-500 bg-zinc-900/80 ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            )}
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

            <p className="mb-6 text-sm text-zinc-400">{tier.description}</p>            {/* Trial Information Block */}
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

            {/* New Embedded Checkout Component */}
            <EmbeddedCheckout
                priceId={tier.priceId}
                planName={tier.name}
                planPrice={tier.price}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div >
    );
}
