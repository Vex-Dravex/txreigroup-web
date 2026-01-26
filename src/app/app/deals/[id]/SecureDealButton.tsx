"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SecureDealButtonProps {
    dealId: string;
    dealTitle: string;
}

export default function SecureDealButton({ dealId, dealTitle }: SecureDealButtonProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSecureDeal = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createSupabaseBrowserClient();

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setError("You must be logged in to secure a deal");
                return;
            }

            // Get user profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name, email, phone")
                .eq("id", user.id)
                .single();

            // Record interest in database
            const { error: insertError } = await supabase
                .from("deal_interest")
                .insert({
                    deal_id: dealId,
                    user_id: user.id,
                    investor_name: profile?.display_name || user.email,
                    investor_email: user.email || profile?.email,
                    investor_phone: profile?.phone,
                    message: `Interested in securing: ${dealTitle}`,
                    status: 'pending'
                });

            if (insertError) {
                // Check if it's a unique constraint error (already expressed interest)
                if (insertError.code === '23505') {
                    setError("You've already expressed interest in this deal");
                    setHasExpressedInterest(true);
                } else {
                    setError("Failed to submit interest. Please try again.");
                    console.error("Error submitting interest:", insertError);
                }
                return;
            }

            // Success!
            setHasExpressedInterest(true);
            setShowSuccessModal(true);

        } catch (err) {
            console.error("Error:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasExpressedInterest) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 dark:bg-green-500 py-5 text-center font-black text-white shadow-xl"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interest Submitted
                </motion.div>

                {/* Success Modal */}
                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    dealTitle={dealTitle}
                />
            </>
        );
    }

    return (
        <>
            <motion.button
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-5 text-center font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Submitting...
                    </>
                ) : (
                    <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure This Deal
                        <span className="text-lg">→</span>
                    </>
                )}
            </motion.button>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 dark:text-red-400 font-medium mt-2 text-center"
                >
                    {error}
                </motion.p>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleSecureDeal}
                dealTitle={dealTitle}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

// Confirmation Modal Component
function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    dealTitle,
    isSubmitting
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    dealTitle: string;
    isSubmitting: boolean;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative w-full max-w-lg glass rounded-[2.5rem] border border-white/10 bg-white dark:bg-zinc-900 p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />

                            <div className="relative z-10 space-y-6">
                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"
                                        />
                                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        Secure This Deal?
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                        You're about to express interest in:
                                    </p>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 px-4">
                                        "{dealTitle}"
                                    </p>
                                    <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed pt-2">
                                        Our team will contact you shortly with next steps and detailed information about this opportunity.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent py-4 font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isSubmitting}
                                        className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Submitting..." : "Confirm"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

// Success Modal Component
function SuccessModal({
    isOpen,
    onClose,
    dealTitle
}: {
    isOpen: boolean;
    onClose: () => void;
    dealTitle: string;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative w-full max-w-lg glass rounded-[2.5rem] border border-white/10 bg-white dark:bg-zinc-900 p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/20 blur-3xl rounded-full" />

                            <div className="relative z-10 space-y-6">
                                {/* Success Icon */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0, 1.2, 1] }}
                                            transition={{ duration: 0.5 }}
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                                        >
                                            <motion.svg
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                                className="h-10 w-10 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                        </motion.div>
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        Interest Submitted!
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                        Your interest in this deal has been recorded.
                                    </p>
                                    <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                                        <p className="text-sm font-bold text-green-900 dark:text-green-100">
                                            "{dealTitle}"
                                        </p>
                                    </div>
                                    <div className="pt-2 space-y-2">
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                                            What happens next?
                                        </p>
                                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 text-left max-w-sm mx-auto">
                                            <li className="flex items-start gap-2">
                                                <svg className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Our team will review your submission</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>You'll receive a call or email within 24 hours</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>We'll provide detailed deal information</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={onClose}
                                    className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Got It!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
