"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface InquiryModalButtonProps {
    dealId: string;
    dealTitle: string;
    dealAddress: string;
}

export default function InquiryModalButton({ dealId, dealTitle, dealAddress }: InquiryModalButtonProps) {
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState("");

    const handleSubmitInquiry = async () => {
        if (!questions.trim()) {
            setError("Please enter your questions before submitting");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createSupabaseBrowserClient();

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setError("You must be logged in to submit an inquiry");
                return;
            }

            // Get user profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("display_name, email, phone")
                .eq("id", user.id)
                .single();

            // Submit inquiry to database
            const { error: insertError } = await supabase
                .from("deal_inquiries")
                .insert({
                    deal_id: dealId,
                    investor_id: user.id,
                    message: questions.trim(),
                    contact_email: user.email || profile?.email,
                    contact_phone: profile?.phone,
                    status: 'pending'
                });

            if (insertError) {
                setError("Failed to submit inquiry. Please try again.");
                console.error("Error submitting inquiry:", insertError);
                return;
            }

            // Success!
            setShowInquiryModal(false);
            setShowSuccessModal(true);
            setQuestions(""); // Clear form

        } catch (err) {
            console.error("Error:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <motion.button
                id="detail-inquiry-button"
                onClick={() => setShowInquiryModal(true)}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-5 text-center font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Full Inquiry
                <span className="text-lg">→</span>
            </motion.button>

            {/* Inquiry Modal */}
            <InquiryModal
                isOpen={showInquiryModal}
                onClose={() => {
                    setShowInquiryModal(false);
                    setError(null);
                }}
                onSubmit={handleSubmitInquiry}
                dealTitle={dealTitle}
                dealAddress={dealAddress}
                questions={questions}
                setQuestions={setQuestions}
                isSubmitting={isSubmitting}
                error={error}
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                dealTitle={dealTitle}
            />
        </>
    );
}

// Inquiry Modal Component
function InquiryModal({
    isOpen,
    onClose,
    onSubmit,
    dealTitle,
    dealAddress,
    questions,
    setQuestions,
    isSubmitting,
    error
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    dealTitle: string;
    dealAddress: string;
    questions: string;
    setQuestions: (value: string) => void;
    isSubmitting: boolean;
    error: string | null;
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative w-full max-w-2xl glass rounded-[2.5rem] border border-white/10 bg-white dark:bg-zinc-900 p-8 shadow-2xl my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />

                            <div className="relative z-10 space-y-6">
                                {/* Header with Icon */}
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"
                                            />
                                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                            Submit Your Inquiry
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
                                            Have questions about this property? Ask our team!
                                        </p>
                                    </div>
                                </div>

                                {/* Deal Info */}
                                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-purple-900 dark:text-purple-100 leading-tight">
                                                {dealTitle}
                                            </p>
                                            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                                {dealAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Your Questions
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            value={questions}
                                            onChange={(e) => setQuestions(e.target.value)}
                                            placeholder="What would you like to know about this property?&#10;&#10;Examples:&#10;• Is the property currently occupied?&#10;• What's included in the repair estimate?&#10;• Are there any liens or encumbrances?&#10;• What's the timeline for closing?"
                                            rows={8}
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none font-medium text-sm leading-relaxed"
                                            disabled={isSubmitting}
                                        />
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                            💡 Tip: Be specific with your questions to get the most helpful answers
                                        </p>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                    {error}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
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
                                        onClick={onSubmit}
                                        disabled={isSubmitting || !questions.trim()}
                                        className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                                                />
                                                Submitting...
                                            </span>
                                        ) : (
                                            "Submit Inquiry"
                                        )}
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
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />

                            <div className="relative z-10 space-y-6">
                                {/* Success Icon */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0, 1.2, 1] }}
                                            transition={{ duration: 0.5 }}
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
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
                                            className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="text-center space-y-3">
                                    <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        Inquiry Submitted!
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                        Your questions have been sent to our Dispo team.
                                    </p>
                                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                                        <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                                            "{dealTitle}"
                                        </p>
                                    </div>
                                    <div className="pt-2 space-y-2">
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                                            What happens next?
                                        </p>
                                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 text-left max-w-sm mx-auto">
                                            <li className="flex items-start gap-2">
                                                <svg className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Our Dispo team will review your questions</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>You'll receive detailed answers within 12-24 hours</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Check your email for our response</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={onClose}
                                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
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
