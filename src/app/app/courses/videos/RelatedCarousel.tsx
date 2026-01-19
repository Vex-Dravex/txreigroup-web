"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

interface RelatedCarouselProps {
    relatedVideos: any[];
    relatedSamples: any[];
}

export default function RelatedCarousel({
    relatedVideos,
    relatedSamples,
}: RelatedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTheater, setIsTheater] = useState(false);

    useEffect(() => {
        const checkTheater = () => {
            setIsTheater(document.documentElement.classList.contains("player-theater"));
        };

        // Initial check
        checkTheater();

        // Create an observer to watch for class changes on <html>
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    checkTheater();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 320; // Width of card + gap
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const hasVideos = relatedVideos.length > 0 || relatedSamples.length > 0;

    return (
        <div className={`education-related py-4 ${isTheater ? "theater-mode" : "sidebar-mode"}`}>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    Related Videos
                </h2>
                {hasVideos && isTheater && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            aria-label="Scroll left"
                        >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            aria-label="Scroll right"
                        >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={scrollRef}
                className={`related-list flex pb-4 scrollbar-hide scroll-smooth ${isTheater ? "flex-row gap-4 overflow-x-auto" : "flex-col gap-3"}`}
            >
                {!hasVideos ? (
                    <div className="w-full py-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500">No related videos found</p>
                    </div>
                ) : (
                    <>
                        {relatedVideos.map((video) => (
                            <Link
                                key={video.id}
                                href={`/app/courses/videos/${video.id}`}
                                className={`group flex items-start gap-3 rounded-xl transition-all ${isTheater ? "flex-none w-72 flex-col space-y-3" : "w-full"}`}
                            >
                                <div className={`relative shrink-0 overflow-hidden rounded-xl bg-zinc-900 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/5 transition-transform group-hover:scale-[1.02] ${isTheater ? "aspect-video w-full" : "h-20 w-32"}`}>
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-white/20">
                                            <svg viewBox="0 0 24 24" className="h-8 w-8">
                                                <path fill="currentColor" d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {video.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {video.topics?.slice(0, 1).map((topic: string) => (
                                            <span key={topic} className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {relatedSamples.map((video) => (
                            <Link
                                key={video.id}
                                href={video.href}
                                className={`group flex items-start gap-3 rounded-xl transition-all ${isTheater ? "flex-none w-72 flex-col space-y-3" : "w-full"}`}
                            >
                                <div className={`relative shrink-0 overflow-hidden rounded-xl bg-zinc-900 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/5 transition-transform group-hover:scale-[1.02] ${isTheater ? "aspect-video w-full" : "h-20 w-32"}`}>
                                    <div className="flex h-full w-full items-center justify-center text-white/20">
                                        <svg viewBox="0 0 24 24" className="h-8 w-8">
                                            <path fill="currentColor" d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {video.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {video.topics?.slice(0, 1).map((topic: string) => (
                                            <span key={topic} className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
