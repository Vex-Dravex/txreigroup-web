"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TransactionServiceTutorialRedirect() {
    const router = useRouter();

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem("transaction-service-tutorial-seen");
        const isTutorialInProgress = localStorage.getItem("active-transaction-service-tutorial-step") !== null;

        if (!hasSeenTutorial && !isTutorialInProgress) {
            router.push("/app/transaction-services/demo");
        }
    }, [router]);

    return null;
}
