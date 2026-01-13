"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SCROLL_POSITION_KEY = "deals-scroll-position";

type DealLinkProps = {
    dealId: string;
    children: React.ReactNode;
    className?: string;
};

export default function DealLink({ dealId, children, className }: DealLinkProps) {
    const pathname = usePathname();

    const handleClick = () => {
        // Save scroll position before navigating
        if (pathname === "/app/deals") {
            sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
        }
    };

    return (
        <Link
            href={`/app/deals/${dealId}`}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Link>
    );
}
