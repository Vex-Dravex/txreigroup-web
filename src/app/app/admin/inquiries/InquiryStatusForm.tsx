"use client";

import { useState } from "react";
import { updateInquiryStatus } from "../actions";
import { useRouter } from "next/navigation";

export default function InquiryStatusForm({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    setError(null);

    try {
      await updateInquiryStatus(inquiryId, newStatus);
      setStatus(newStatus);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update inquiry status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {["new", "contacted", "closed", "declined"].map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={loading || status === s}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              status === s
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {s === "new" ? "Mark as New" : s === "contacted" ? "Mark as Contacted" : s === "closed" ? "Mark as Closed" : "Mark as Declined"}
          </button>
        ))}
      </div>
    </div>
  );
}

