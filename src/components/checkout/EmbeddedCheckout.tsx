"use client";

import { useState, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { X, Tag, Check } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
    couponCode: string;
    setCouponCode: (code: string) => void;
    appliedCoupon: string | null;
    handleApplyCoupon: () => Promise<void>;
    handleRemoveCoupon: () => Promise<void>;
    isValidatingCoupon: boolean;
    couponError: string | null;
}

function CheckoutForm({
    clientSecret,
    onSuccess,
    onCancel,
    couponCode,
    setCouponCode,
    appliedCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    isValidatingCoupon,
    couponError
}: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // Detect if this is a setup intent (trial period) or payment intent
            const isSetupIntent = clientSecret.startsWith('seti_');

            if (isSetupIntent) {
                // For trial periods, use confirmSetup
                const { error } = await stripe.confirmSetup({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/onboarding/subscription?success=true`,
                    },
                    redirect: "if_required",
                });

                if (error) {
                    setErrorMessage(error.message || "An error occurred");
                    setIsProcessing(false);
                } else {
                    // Setup succeeded (trial started)
                    onSuccess();
                }
            } else {
                // For immediate payments, use confirmPayment
                const { error } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/onboarding/subscription?success=true`,
                    },
                    redirect: "if_required",
                });

                if (error) {
                    setErrorMessage(error.message || "An error occurred");
                    setIsProcessing(false);
                } else {
                    // Payment succeeded
                    onSuccess();
                }
            }
        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Applied Indicator */}
            {couponCode && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                            Coupon Applied: <code className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded">{couponCode}</code>
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                            Your discount will be applied to this subscription
                        </p>
                    </div>
                </div>
            )}

            <PaymentElement options={{
                layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                },
                fields: {
                    billingDetails: {
                        name: 'auto',
                        email: 'auto',
                        phone: 'auto',
                        address: 'auto',
                    }
                }
            }} />

            {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {errorMessage}
                    </p>
                </div>
            )}

            {/* Promo Code Section - Positioned above buttons */}
            <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-3">
                <label className="block text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Have a promo code?
                </label>
                {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500 p-1.5 rounded-lg">
                                <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                <code className="bg-emerald-500/20 px-2 py-1 rounded text-emerald-500 mr-2">{appliedCoupon}</code> Applied
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 uppercase tracking-tighter"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                            placeholder="ENTER PROMO CODE"
                            className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-white transition-all uppercase placeholder:text-zinc-400"
                        />
                        <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || isValidatingCoupon}
                            className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl text-xs font-black transition-all disabled:opacity-50 uppercase tracking-tight"
                        >
                            {isValidatingCoupon ? "CHECKING..." : "APPLY"}
                        </button>
                    </div>
                )}
                {couponError && (
                    <p className="text-[11px] font-bold text-red-500 uppercase px-1">{couponError}</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="order-2 sm:order-1 flex-1 px-6 py-4 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="order-1 sm:order-2 flex-[2] px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </span>
                    ) : (
                        "Subscribe Now"
                    )}
                </button>
            </div>
        </form>
    );
}

interface EmbeddedCheckoutProps {
    priceId: string;
    planName: string;
    planPrice: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EmbeddedCheckout({
    priceId,
    planName,
    planPrice,
    onSuccess,
    onCancel,
}: EmbeddedCheckoutProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOpenCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId,
                    couponCode: appliedCoupon || undefined,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create checkout session");
            }

            const { clientSecret } = await response.json();
            setClientSecret(clientSecret);
        } catch (err: any) {
            console.error("Error creating checkout:", err);
            setError(err.message || "Failed to initialize checkout");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsValidatingCoupon(true);
        setCouponError(null);

        try {
            const response = await fetch("/api/validate-coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ couponCode: couponCode.trim() }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Invalid coupon code");
            }

            const { valid } = await response.json();
            if (valid) {
                setAppliedCoupon(couponCode.trim());
                setCouponError(null);

                // If modal is already open, recreate payment intent with coupon
                if (clientSecret) {
                    await recreatePaymentIntentWithCoupon(couponCode.trim());
                }
            } else {
                throw new Error("Invalid coupon code");
            }
        } catch (err: any) {
            console.error("Error validating coupon:", err);
            setCouponError(err.message || "Failed to validate coupon");
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = async () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError(null);

        // If modal is already open, recreate payment intent without coupon
        if (clientSecret) {
            await recreatePaymentIntentWithCoupon(null);
        }
    };

    const recreatePaymentIntentWithCoupon = async (coupon: string | null) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId,
                    couponCode: coupon || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update payment intent");
            }

            const { clientSecret: newClientSecret } = await response.json();
            setClientSecret(newClientSecret);
        } catch (err: any) {
            console.error("Error updating payment intent:", err);
            setError(err.message || "Failed to update checkout");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = () => {
        setClientSecret(null);
        onSuccess?.();
    };

    const handleCancel = () => {
        setClientSecret(null);
        onCancel?.();
    };

    const modalContent = clientSecret && mounted ? createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            style={{ WebkitBackdropFilter: 'blur(12px)' }}
            onClick={handleCancel}
        >
            <div
                className="relative w-full max-w-4xl md:w-[750px] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-white/10 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            Complete Your Subscription
                        </h2>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                            {planName} • <span className="text-blue-500">{planPrice}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
                    >
                        <X className="w-5 h-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
                    {/* Payment Area */}
                    <div className="space-y-8">
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: "night",
                                    variables: {
                                        colorPrimary: "#3b82f6",
                                        colorBackground: "#09090b",
                                        colorText: "#ffffff",
                                        colorDanger: "#ef4444",
                                        fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
                                        spacingUnit: "5px",
                                        borderRadius: "14px",
                                    },
                                    rules: {
                                        '.Input': {
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: 'none',
                                        },
                                        '.Label': {
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            fontSize: '11px',
                                            letterSpacing: '0.05em',
                                            color: '#a1a1aa',
                                        },
                                        '.TabLabel': {
                                            display: 'none',
                                        }
                                    }
                                } as any,
                                paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'cashapp', 'link'],
                            } as any}
                        >
                            <CheckoutForm
                                clientSecret={clientSecret}
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                                couponCode={couponCode}
                                setCouponCode={setCouponCode}
                                appliedCoupon={appliedCoupon}
                                handleApplyCoupon={handleApplyCoupon}
                                handleRemoveCoupon={handleRemoveCoupon}
                                isValidatingCoupon={isValidatingCoupon}
                                couponError={couponError}
                            />
                        </Elements>
                    </div>
                </div>

                {/* Footer Security Badge */}
                <div className="px-8 py-5 bg-zinc-50 dark:bg-white/5 border-t border-zinc-200 dark:border-white/10">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.1em]">
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        Encrypted SSL Secured Payment via Stripe
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <Fragment>
            {/* Trigger Button */}
            <button
                onClick={handleOpenCheckout}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </span>
                ) : (
                    "SELECT"
                )}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
                    <p className="text-xs font-black text-red-500 uppercase">{error}</p>
                </div>
            )}

            {modalContent}
        </Fragment>
    );
}
