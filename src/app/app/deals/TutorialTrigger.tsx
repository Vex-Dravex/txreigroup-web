"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TutorialTrigger() {
    const router = useRouter();

    const handleStartTour = () => {
        localStorage.removeItem("marketplace-tutorial-seen-v2");
        localStorage.removeItem("active-tutorial-step-v2");
        localStorage.removeItem("marketplace-tutorial-clicked-listing");
        // Navigate to demo page to start tutorial
        router.push("/app/deals/demo");
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartTour}
            className="group flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white shadow-sm"
        >
            <svg className="h-4 w-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Take Tour
        </motion.button>
    );
}
