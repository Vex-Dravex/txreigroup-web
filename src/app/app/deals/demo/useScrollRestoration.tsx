"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SCROLL_POSITION_KEY = "deals-scroll-position";

export function useScrollRestoration() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Only restore scroll on the deals page
        if (pathname === "/app/deals") {
            const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
            if (savedPosition) {
                const position = parseInt(savedPosition, 10);
                // Use setTimeout to ensure DOM is fully rendered
                setTimeout(() => {
                    window.scrollTo({
                        top: position,
                        behavior: "instant",
                    });
                }, 0);
                // Clear the saved position after restoring
                sessionStorage.removeItem(SCROLL_POSITION_KEY);
            }
        }
    }, [pathname, searchParams]);

    const saveScrollPosition = () => {
        if (pathname === "/app/deals") {
            sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
        }
    };

    return { saveScrollPosition };
}

export function ScrollRestorationProvider({ children }: { children: React.ReactNode }) {
    useScrollRestoration();
    return <>{children}</>;
}
