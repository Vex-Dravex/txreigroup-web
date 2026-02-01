"use client";

import { PRICING_TIERS } from "@/lib/constants/pricing";

export default function DiagnosticPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🔍 Stripe Price ID Diagnostic</h1>

                <div className="space-y-4">
                    {PRICING_TIERS.map((tier) => (
                        <div key={tier.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                            <h2 className="text-xl font-bold mb-2">{tier.name}</h2>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-zinc-500">Price ID:</span> <code className="text-emerald-400">{tier.priceId}</code></p>
                                <p><span className="text-zinc-500">Price:</span> {tier.price}</p>
                                <p><span className="text-zinc-500">Interval:</span> {tier.interval}</p>
                                {tier.priceId.includes('placeholder') && (
                                    <p className="text-red-500 font-bold mt-2">⚠️ Using placeholder - environment variable not loaded!</p>
                                )}
                                {tier.priceId.startsWith('price_1') && (
                                    <p className="text-emerald-500 font-bold mt-2">✅ Valid Stripe Price ID detected</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h3 className="font-bold mb-2">📝 Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>If you see "placeholder" values, restart your dev server</li>
                        <li>Make sure .env.local has NEXT_PUBLIC_STRIPE_PRICE_ID_* variables</li>
                        <li>All valid Price IDs should start with "price_1"</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
