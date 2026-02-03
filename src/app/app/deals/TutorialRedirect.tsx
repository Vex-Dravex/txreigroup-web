"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorialRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check if user has seen the tutorial
        const hasSeenTutorial = localStorage.getItem("marketplace-tutorial-seen-v2");

        // If they haven't seen it, redirect to demo
        if (!hasSeenTutorial) {
            router.push("/app/deals/demo");
        }
    }, [router]);

    return null;
}
