"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ScrollSavingLinkProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
    storageKey: string;
    currentRoute: string;
};

/**
 * A Link component that saves scroll position before navigating
 */
export default function ScrollSavingLink({
    href,
    children,
    className,
    storageKey,
    currentRoute,
}: ScrollSavingLinkProps) {
    const pathname = usePathname();

    const handleClick = () => {
        // Save scroll position before navigating
        if (pathname === currentRoute) {
            sessionStorage.setItem(storageKey, window.scrollY.toString());
        }
    };

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    );
}

// Pre-configured link components for specific pages
type ForumPostLinkProps = {
    postId: string;
    children: React.ReactNode;
    className?: string;
};

export function ForumPostLink({ postId, children, className }: ForumPostLinkProps) {
    return (
        <ScrollSavingLink
            href={`/app/forum/${postId}`}
            className={className}
            storageKey="forum-scroll-position"
            currentRoute="/app/forum"
        >
            {children}
        </ScrollSavingLink>
    );
}

type CourseVideoLinkProps = {
    courseId: string;
    children: React.ReactNode;
    className?: string;
};

export function CourseVideoLink({ courseId, children, className }: CourseVideoLinkProps) {
    return (
        <ScrollSavingLink
            href={`/app/courses/${courseId}`}
            className={className}
            storageKey="courses-scroll-position"
            currentRoute="/app/courses"
        >
            {children}
        </ScrollSavingLink>
    );
}
