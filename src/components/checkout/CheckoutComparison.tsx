"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";

interface CheckoutComparisonProps {
    priceId: string;
    planName: string;
    planPrice: string;
}

/**
 * Component that shows both checkout options side by side
 * Use this to compare the user experience
 */
export default function CheckoutComparison({
    priceId,
    planName,
    planPrice,
}: CheckoutComparisonProps) {
    const router = useRouter();
    const [isLoadingHosted, setIsLoadingHosted] = useState(false);

    // Hosted Checkout (redirects to Stripe)
    const handleHostedCheckout = async () => {
        setIsLoadingHosted(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId,
                    successUrl: `${window.location.origin}/onboarding/subscription?success=true`,
                    cancelUrl: `${window.location.origin}/onboarding/subscription?canceled=true`,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create checkout session");
            }

            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setIsLoadingHosted(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-8">
            {/* Hosted Checkout Option */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-zinc-200 dark:border-zinc-800">
                <div className="mb-6">
                    <div className="inline-flex px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-4">
                        Traditional
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Hosted Checkout
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Redirects to Stripe's secure checkout page
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Easy to implement
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Stripe handles everything
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                PCI compliant
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Fully secure out of the box
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                User leaves your site
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Redirect flow can feel clunky
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Less control over UX
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Limited customization
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleHostedCheckout}
                    disabled={isLoadingHosted}
                    className="w-full px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {isLoadingHosted ? "Loading..." : "Try Hosted Checkout"}
                </button>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-4">
                    You'll be redirected to Stripe
                </p>
            </div>

            {/* Embedded Checkout Option */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-blue-500 shadow-xl shadow-blue-500/20">
                <div className="mb-6">
                    <div className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                        Recommended
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Embedded Checkout
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Seamless checkout without leaving your site
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                User stays on your site
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Seamless, branded experience
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Full control over UX
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Customize every detail
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Better conversion rates
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                No redirect friction
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                Still PCI compliant
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Stripe Elements handles security
                            </p>
                        </div>
                    </div>
                </div>

                <EmbeddedCheckout
                    priceId={priceId}
                    planName={planName}
                    planPrice={planPrice}
                    onSuccess={() => router.push("/app/dashboard")}
                    onCancel={() => console.log("Cancelled")}
                />

                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-4">
                    Payment form opens in a modal
                </p>
            </div>
        </div>
    );
}
