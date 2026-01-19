"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    duration?: number;
    className?: string;
}

export default function FadeIn({
    children,
    delay = 0,
    direction = "up",
    duration = 0.8,
    className = "",
}: FadeInProps) {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction],
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
            }}
            viewport={{ once: true }}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1], // easeOutExpo
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function FadeInStagger({
    children,
    delay = 0,
    stagger = 0.1,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    stagger?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
