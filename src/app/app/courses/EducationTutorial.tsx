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

const steps: TutorialStep[] = [
    {
        title: "Welcome to the Education Center",
        content: "Your hub for real estate mastery. From wholesale contracts to creative finance strategies, everything you need is right here.",
        position: "center"
    },
    {
        targetId: "education-filters-sidebar",
        title: "Smart Filtering",
        content: "Quickly find content by topic (contracts, funding, disposition) or toggle to 'Watch Later' to see your saved videos.",
        position: "right"
    },
    {
        targetId: "education-search-bar",
        title: "Instant Search",
        content: "Looking for something specific? Search by title, keyword, or strategy to find the exact playbook you need.",
        position: "bottom"
    },
    {
        targetId: "education-video-card-sample-1",
        title: "Video Lessons",
        content: "Each card shows the difficulty level, duration, and key topics. Let's dive into 'Wholesale Foundations' to see the video player.",
        position: "top"
    }
];

export default function EducationTutorial() {
    const [step, setStep] = useState(-1);
    const [isVisible, setIsVisible] = useState(false);
    const [spotlightRect, setSpotlightRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if tutorial is in progress or has been seen
        const currentStoredStep = localStorage.getItem("active-education-tutorial-step-v2");
        const hasSeenTutorial = localStorage.getItem("education-tutorial-seen-v2");

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
            localStorage.setItem("active-education-tutorial-step-v2", "0");
        }
    }, []);

    const updateSpotlight = useCallback(() => {
        if (step >= 0 && step < steps.length && steps[step].targetId) {
            const el = document.getElementById(steps[step].targetId!);
            if (el) {
                const rect = el.getBoundingClientRect();
                setSpotlightRect(prev => {
                    if (prev &&
                        prev.x === rect.left &&
                        prev.y === rect.top &&
                        prev.width === rect.width &&
                        prev.height === rect.height) {
                        return prev;
                    }
                    return {
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height
                    };
                });

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
        if (step < steps.length - 1) {
            const nextStep = step + 1;
            setStep(nextStep);
            localStorage.setItem("active-education-tutorial-step-v2", nextStep.toString());
        } else {
            handleTransitionToDetail();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            const prevStep = step - 1;
            setStep(prevStep);
            localStorage.setItem("active-education-tutorial-step-v2", prevStep.toString());
        }
    };

    const handleTransitionToDetail = () => {
        localStorage.setItem("active-education-tutorial-step-v2", steps.length.toString());
        window.location.assign("/app/courses/demo/videos/sample-1");
    };

    const handleSkip = () => {
        setIsVisible(false);
        localStorage.setItem("education-tutorial-seen-v2", "true");
        localStorage.removeItem("active-education-tutorial-step-v2");
        router.push("/app/courses");
    };

    if (!isVisible || step < 0) return null;

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                <defs>
                    <mask id="education-spotlight-mask">
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
                    mask="url(#education-spotlight-mask)"
                    onClick={handleSkip}
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
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-0 left-0 border-2 border-amber-500/50 rounded-[22px] shadow-[0_0_30px_rgba(245,158,11,0.5)] z-[101] pointer-events-none"
                />
            )}

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
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />

                        <div className="flex gap-2 mb-8">
                            {steps.map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        width: i === step ? 32 : 8,
                                        backgroundColor: i <= step ? "rgba(245, 158, 11, 1)" : "rgba(255, 255, 255, 0.1)"
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
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="bg-amber-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-amber-500/20 transition-all uppercase tracking-widest text-xs border border-amber-400/30"
                            >
                                {step === steps.length - 1 ? "Start Learning" : "Next Step"}
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

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
                    className="absolute top-0 left-0 w-12 h-12 -ml-6 -mt-6 rounded-full bg-amber-500/30 border border-amber-400/50 backdrop-blur-md z-[110] pointer-events-none flex items-center justify-center"
                >
                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                </motion.div>
            )}
        </div>
    );
}
