"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SecureDealButtonProps {
    dealId: string;
    dealTitle: string;
}

export default function SecureDealButton({ dealId, dealTitle }: SecureDealButtonProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSecureDeal = async () => {
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

            // Optional: Show success notification
            alert("Success! Your interest has been submitted. An admin will contact you shortly.");

        } catch (err) {
            console.error("Error:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasExpressedInterest) {
        return (
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
        );
    }

    return (
        <>
            <motion.button
                onClick={handleSecureDeal}
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950 dark:bg-zinc-50 py-5 text-center font-black text-white dark:text-zinc-950 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-2 border-white dark:border-zinc-950 border-t-transparent dark:border-t-transparent rounded-full"
                        />
                        Submitting...
                    </>
                ) : (
                    <>
                        Secure This Deal
                        <span className="text-lg">→</span>
                    </>
                )}
            </motion.button>

            {error && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-2 text-center">
                    {error}
                </p>
            )}
        </>
    );
}
