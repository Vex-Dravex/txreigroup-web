"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Creates scroll restoration hooks for a specific page
 * @param pageRoute - The route to restore scroll for (e.g., "/app/forum")
 * @param storageKey - Unique key for sessionStorage
 */
export function createScrollRestoration(pageRoute: string, storageKey: string) {
    function useScrollRestoration() {
        const pathname = usePathname();
        const searchParams = useSearchParams();

        useEffect(() => {
            // Only restore scroll on the specified page
            if (pathname === pageRoute) {
                const savedPosition = sessionStorage.getItem(storageKey);
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
                    sessionStorage.removeItem(storageKey);
                }
            }
        }, [pathname, searchParams]);

        const saveScrollPosition = () => {
            if (pathname === pageRoute) {
                sessionStorage.setItem(storageKey, window.scrollY.toString());
            }
        };

        return { saveScrollPosition };
    }

    function ScrollRestorationProvider({ children }: { children: React.ReactNode }) {
        useScrollRestoration();
        return <>{children}</>;
    }

    return { useScrollRestoration, ScrollRestorationProvider };
}

// Export specific instances for each page
export const {
    ScrollRestorationProvider: ForumScrollRestorationProvider,
} = createScrollRestoration("/app/forum", "forum-scroll-position");

export const {
    ScrollRestorationProvider: CoursesScrollRestorationProvider,
} = createScrollRestoration("/app/courses", "courses-scroll-position");
