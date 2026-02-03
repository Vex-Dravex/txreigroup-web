"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const SCROLL_POSITION_KEY = "deals-scroll-position";

type DealLinkProps = {
    dealId: string;
    children: React.ReactNode;
    className?: string;
    id?: string;
};

export default function DealLink({ dealId, children, className, id }: DealLinkProps) {
    const pathname = usePathname();

    const handleClick = () => {
        // Save scroll position before navigating
        if (pathname === "/app/deals") {
            sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1] as any
            }
        },
    };

    return (
        <motion.div variants={item}>
            <Link
                href={`/app/deals/demo/${dealId}`}
                id={id}
                className={className}
                onClick={handleClick}
            >
                {children}
            </Link>
        </motion.div>
    );
}

