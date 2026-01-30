"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    onSelect: (priceId: string) => void;
    isLoading?: boolean;
}

export default function PricingCard({ tier, onSelect, isLoading }: PricingCardProps) {
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

            <p className="mb-6 text-sm text-zinc-400">{tier.description}</p>

            <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                        <Check className="h-5 w-5 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onSelect(tier.priceId)}
                disabled={isLoading}
                className={cn(
                    "w-full rounded-xl py-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
                    tier.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                        : "bg-white text-zinc-900 hover:bg-zinc-200"
                )}
            >
                {isLoading ? "Processing..." : "Start 14-Day Free Trial"}
            </button>

            {tier.savings && (
                <p className="mt-3 text-center text-xs font-medium text-emerald-400">
                    Save {tier.savings}
                </p>
            )}
        </div>
    );
}
