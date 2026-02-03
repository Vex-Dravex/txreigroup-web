"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContractorTutorialRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check if user has seen the tutorial
        const hasSeenTutorial = localStorage.getItem("contractor-tutorial-seen");

        // If they haven't seen it, redirect to demo
        if (!hasSeenTutorial) {
            router.push("/app/contractors/demo");
        }
    }, [router]);

    return null;
}
