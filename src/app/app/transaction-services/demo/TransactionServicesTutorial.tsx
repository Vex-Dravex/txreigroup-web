"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type TutorialStep = {
    targetId?: string;
    title: string;
    content: string;
    position: "center" | "bottom" | "top" | "left" | "right";
    action?: () => void;
};

export default function TransactionServicesTutorial() {
    const [step, setStep] = useState(-1); // -1 means checking localStorage or waiting to start
    const [isVisible, setIsVisible] = useState(false);
    const [spotlightRect, setSpotlightRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const router = useRouter();

    const steps: TutorialStep[] = [
        {
            title: "Partner Network",
            content: "Connect with verified Title Companies, Lenders, Escrow Officers, and Transaction Coordinators who specialize in creative finance.",
            position: "center"
        },
        {
            targetId: "service-search-bar",
            title: "Find Specific Services",
            content: "Looking for a Title Company or a Hard Money Lender? Search by service type or company name here.",
            position: "bottom"
        },
        {
            targetId: "service-filters-button",
            title: "Filter by Market",
            content: "Narrow your search to specific markets like Houston or DFW to find local experts.",
            position: "bottom"
        },
        {
            targetId: "vendor-card-d8224455-1f93-4173-9622-89012345f6f1", // Bayou Title ID
            title: "Verified Partners",
            content: "Every partner is vetted for reliability. Let's explore Bayou Title Partners to see how they can handle your next closing.",
            position: "top"
        },
        // Placeholder steps for the detail page
        { title: "", content: "", position: "center" },
        { title: "", content: "", position: "center" },
        { title: "", content: "", position: "center" },
        { title: "", content: "", position: "center" }
    ];

    useEffect(() => {
        // Check if tutorial is in progress or has been seen
        const currentStoredStep = localStorage.getItem("active-transaction-service-tutorial-step");
        const hasSeenTutorial = localStorage.getItem("transaction-service-tutorial-seen");

        if (currentStoredStep !== null) {
            const stepNum = parseInt(currentStoredStep);
            if (stepNum < 4) {
                setStep(stepNum);
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        } else if (!hasSeenTutorial) {
            setStep(0);
            setIsVisible(true);
            localStorage.setItem("active-transaction-service-tutorial-step", "0");
        }
    }, []);

    const updateSpotlight = useCallback(() => {
        if (step >= 0 && step < 4 && steps[step].targetId) {
            const el = document.getElementById(steps[step].targetId!);
            if (el) {
                const rect = el.getBoundingClientRect();
                setSpotlightRect({
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                });

                // Only scroll for the first few steps, or if the element is way off screen
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (!isInViewport) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } else {
            setSpotlightRect(null);
        }
    }, [step]);

    useEffect(() => {
        updateSpotlight();
        window.addEventListener('resize', updateSpotlight);
        window.addEventListener('scroll', updateSpotlight);
        return () => {
            window.removeEventListener('resize', updateSpotlight);
            window.removeEventListener('scroll', updateSpotlight);
        };
    }, [updateSpotlight]);

    const handleNext = () => {
        if (step < 3) {
            const nextStep = step + 1;
            setStep(nextStep);
            localStorage.setItem("active-transaction-service-tutorial-step", nextStep.toString());
        } else if (step === 3) {
            handleTransitionToDetail();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            const prevStep = step - 1;
            setStep(prevStep);
            localStorage.setItem("active-transaction-service-tutorial-step", prevStep.toString());
        }
    };

    const handleTransitionToDetail = () => {
        setIsVisible(false);
        localStorage.setItem("active-transaction-service-tutorial-step", "4");
        // Navigate to the Bayou Title listing
        const bayouCard = document.getElementById("vendor-card-d8224455-1f93-4173-9622-89012345f6f1");
        if (bayouCard) {
            // Find the link inside
            const link = bayouCard.querySelector('a');
            if (link) link.click();
        } else {
            // Fallback
            router.push("/app/profile/d8224455-1f93-4173-9622-89012345f6f1");
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem("transaction-service-tutorial-seen", "true");
        localStorage.removeItem("active-transaction-service-tutorial-step");
        // Redirect to live page
        router.push("/app/transaction-services");
    };

    if (!isVisible || step < 0) return null;

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {/* Dark Overlay with Hole */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="service-spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {spotlightRect && (
                            <motion.rect
                                initial={false}
                                animate={{
                                    x: spotlightRect.x - 12,
                                    y: spotlightRect.y - 12,
                                    width: spotlightRect.width + 24,
                                    height: spotlightRect.height + 24,
                                    rx: 20
                                }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.85)"
                    mask="url(#service-spotlight-mask)"
                    onClick={handleSkip}
                    className="transition-colors duration-500"
                />
            </svg>

            {/* Glowing Accent for Spotlight */}
            {spotlightRect && (
                <motion.div
                    initial={false}
                    animate={{
                        x: spotlightRect.x - 12,
                        y: spotlightRect.y - 12,
                        width: spotlightRect.width + 24,
                        height: spotlightRect.height + 24,
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-0 left-0 border-2 border-blue-500/50 rounded-[22px] shadow-[0_0_30px_rgba(59,130,246,0.5)] z-[101] pointer-events-none"
                />
            )}

            {/* Content Box Container */}
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20, rotateX: -10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`pointer-events-auto max-w-sm w-full glass p-10 rounded-[2.5rem] border border-white/20 shadow-2xl z-[105] ${spotlightRect ? "absolute" : "relative"}`}
                        style={spotlightRect ? {
                            top: (() => {
                                const boxHeight = 400;
                                const padding = 40;
                                const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

                                let targetTop: number;

                                if (currentStep.position === 'bottom') {
                                    targetTop = spotlightRect.y + spotlightRect.height + 40;
                                } else if (currentStep.position === 'top') {
                                    targetTop = spotlightRect.y - boxHeight - 40;
                                } else if (currentStep.position === 'left' || currentStep.position === 'right') {
                                    targetTop = spotlightRect.y + spotlightRect.height / 2 - boxHeight / 2;
                                } else {
                                    return 'auto';
                                }

                                const minTop = padding;
                                const maxTop = screenHeight - boxHeight - padding;

                                return Math.max(minTop, Math.min(maxTop, targetTop));
                            })(),
                            left: (() => {
                                const boxWidth = 384;
                                const padding = 20;
                                const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

                                let targetLeft: number;

                                if (currentStep.position === 'left') {
                                    targetLeft = spotlightRect.x - boxWidth - 40;
                                } else if (currentStep.position === 'right') {
                                    targetLeft = spotlightRect.x + spotlightRect.width + 40;
                                } else {
                                    targetLeft = spotlightRect.x + spotlightRect.width / 2 - boxWidth / 2;
                                }

                                const minLeft = padding;
                                const maxLeft = screenWidth - boxWidth - padding;

                                return Math.max(minLeft, Math.min(maxLeft, targetLeft));
                            })(),
                            transition: 'top 0.5s cubic-bezier(0.16, 1, 0.3, 1), left 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                        } : {}}
                    >
                        {/* Interactive Elements Decoration */}
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

                        {/* Progress Dots */}
                        <div className="flex gap-2 mb-8">
                            {steps.map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        width: i === step ? 32 : 8,
                                        backgroundColor: i <= step ? "rgba(59, 130, 246, 1)" : "rgba(255, 255, 255, 0.1)"
                                    }}
                                    className="h-1.5 rounded-full transition-colors duration-500"
                                />
                            ))}
                        </div>

                        <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-black text-white font-syne italic mb-4 tracking-tighter leading-none"
                        >
                            {currentStep.title}
                        </motion.h3>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-zinc-300 font-medium leading-relaxed mb-10 text-lg"
                        >
                            {currentStep.content}
                        </motion.p>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-4">
                                {step > 0 ? (
                                    <button
                                        onClick={handleBack}
                                        className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Back
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSkip}
                                        className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                    >
                                        Skip
                                    </button>
                                )}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="bg-blue-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs border border-blue-400/30"
                            >
                                {step === steps.length - 1 ? "Start Tour" : "Next Step"}
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Simulated Cursor Animation */}
            {spotlightRect && (
                <motion.div
                    animate={{
                        x: spotlightRect.x + spotlightRect.width / 2,
                        y: spotlightRect.y + spotlightRect.height / 2,
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        x: { type: "spring", damping: 25, stiffness: 150 },
                        y: { type: "spring", damping: 25, stiffness: 150 },
                        scale: { duration: 2, repeat: Infinity },
                        opacity: { duration: 2, repeat: Infinity }
                    }}
                    className="absolute top-0 left-0 w-12 h-12 -ml-6 -mt-6 rounded-full bg-blue-500/30 border border-blue-400/50 backdrop-blur-md z-[110] pointer-events-none flex items-center justify-center"
                >
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                </motion.div>
            )}
        </div>
    );
}
