"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type TutorialStep = {
    targetId: string;
    title: string;
    content: string;
    position: "center" | "bottom" | "top" | "left" | "right";
};

export default function TransactionServiceDetailTutorial() {
    const [step, setStep] = useState(-1);
    const [isVisible, setIsVisible] = useState(false);
    const [spotlightRect, setSpotlightRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const router = useRouter();

    // Use useMemo to ensure steps array is stable and doesn't cause re-renders
    const steps: TutorialStep[] = useMemo(() => [
        {
            // Placeholder 0
            targetId: "", title: "", content: "", position: "center"
        },
        {
            // Placeholder 1
            targetId: "", title: "", content: "", position: "center"
        },
        {
            // Placeholder 2
            targetId: "", title: "", content: "", position: "center"
        },
        {
            // Placeholder 3
            targetId: "", title: "", content: "", position: "center"
        },
        {
            targetId: "vendor-profile-overview",
            title: "Partner Overview",
            content: "Learn about the company's specific expertise with investors. Bayou Title specializes in quick assignments and double closings.",
            position: "bottom"
        },
        {
            targetId: "vendor-showcase-section",
            title: "Proven Track Record",
            content: "Review their past portfolio closings. See proof of their volume and complexity handling before you engage.",
            position: "right"
        },
        {
            targetId: "vendor-reviews-section",
            title: "Investor Reviews",
            content: "Check verified feedback from other real estate investors who have closed deals with this partner.",
            position: "right"
        },
        {
            targetId: "vendor-message-button",
            title: "Direct Messaging",
            content: "Have questions? Chat directly with partners to discuss your specific deal needs before opening an official order.",
            position: "top"
        },
        {
            targetId: "vendor-connect-button",
            title: "Start Closing",
            content: "Ready to work together? Connect directly to start your order or request a fee sheet.",
            position: "top"
        }
    ], []);

    useEffect(() => {
        const currentStoredStep = localStorage.getItem("active-transaction-service-tutorial-step");
        if (currentStoredStep) {
            const stepNum = parseInt(currentStoredStep);
            if (stepNum >= 4 && stepNum < steps.length) {
                setStep(stepNum);
                setIsVisible(true);
            }
        }
    }, [steps.length]);

    const updateSpotlight = useCallback(() => {
        if (step >= 4 && step < steps.length && steps[step].targetId) {
            const el = document.getElementById(steps[step].targetId);
            if (el) {
                const rect = el.getBoundingClientRect();

                // Only update state if values actually changed to prevent infinite loops
                setSpotlightRect(prev => {
                    if (prev &&
                        Math.abs(prev.x - rect.left) < 1 &&
                        Math.abs(prev.y - rect.top) < 1 &&
                        Math.abs(prev.width - rect.width) < 1 &&
                        Math.abs(prev.height - rect.height) < 1
                    ) {
                        return prev;
                    }
                    return {
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height
                    };
                });

                // Scroll into view logic - wrapped in requestAnimationFrame to avoid layout thrashing
                requestAnimationFrame(() => {
                    const isInViewport = (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );

                    if (!isInViewport) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }
        } else {
            setSpotlightRect(null);
        }
    }, [step, steps]);

    useEffect(() => {
        updateSpotlight();
        const handleResize = () => updateSpotlight();
        const handleScroll = () => updateSpotlight();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        // Polling for dynamic content load
        const interval = setInterval(updateSpotlight, 500);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, [updateSpotlight]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            const nextStep = step + 1;
            setStep(nextStep);
            localStorage.setItem("active-transaction-service-tutorial-step", nextStep.toString());
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem("transaction-service-tutorial-seen", "true");
        localStorage.removeItem("active-transaction-service-tutorial-step");
        router.push("/app/transaction-services");
    };

    if (!isVisible || step < 4) return null;

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="detail-spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {spotlightRect && (
                            <motion.rect
                                initial={false}
                                animate={{
                                    x: spotlightRect.x - 12,
                                    y: spotlightRect.y - 12,
                                    width: spotlightRect.width + 24,
                                    height: spotlightRect.height + 24,
                                    rx: 16
                                }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
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
                    mask="url(#detail-spotlight-mask)"
                    onClick={handleComplete}
                    className="transition-colors duration-500"
                />
            </svg>

            {spotlightRect && (
                <motion.div
                    initial={false}
                    animate={{
                        x: spotlightRect.x - 12,
                        y: spotlightRect.y - 12,
                        width: spotlightRect.width + 24,
                        height: spotlightRect.height + 24,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="absolute top-0 left-0 border-2 border-blue-500/50 rounded-[18px] shadow-[0_0_30px_rgba(59,130,246,0.5)] z-[101] pointer-events-none"
                />
            )}

            <div className="relative w-full h-full flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`pointer-events-auto max-w-sm w-full glass p-8 rounded-[2rem] border border-white/20 shadow-2xl z-[105] ${spotlightRect ? "absolute" : "relative"} transition-all duration-500`}
                        style={spotlightRect ? {
                            top: (() => {
                                const boxHeight = 300;
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
                                return Math.max(padding, Math.min(screenHeight - boxHeight - padding, targetTop));
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
                                return Math.max(padding, Math.min(screenWidth - boxWidth - padding, targetLeft));
                            })(),
                        } : {}}
                    >
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

                        <div className="flex gap-2 mb-6">
                            {steps.slice(4).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        width: i === (step - 4) ? 24 : 6,
                                        backgroundColor: i <= (step - 4) ? "rgba(59, 130, 246, 1)" : "rgba(255, 255, 255, 0.1)"
                                    }}
                                    className="h-1 rounded-full transition-colors duration-500"
                                />
                            ))}
                        </div>

                        <h3 className="text-2xl font-black text-white font-syne italic mb-3 tracking-tighter">
                            {currentStep.title}
                        </h3>

                        <p className="text-zinc-300 font-medium leading-relaxed mb-8">
                            {currentStep.content}
                        </p>

                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-widest text-zinc-500">
                                Step {step - 3} of {steps.length - 4}
                            </span>
                            <button
                                onClick={handleNext}
                                className="bg-blue-600 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                            >
                                {step === steps.length - 1 ? "Finish" : "Next"}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
