"use client";

import { useState } from "react";
import { verifyContractor, rejectContractor } from "../actions";
import { useRouter } from "next/navigation";

export default function ContractorVerificationForm({ contractorId }: { contractorId: string }) {
  const router = useRouter();
  const [action, setAction] = useState<"verify" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setLoading(true);
    setError(null);

    try {
      await verifyContractor(contractorId, notes || undefined);
      router.refresh();
      setAction(null);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to verify contractor");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!notes.trim()) {
      setError("Admin notes are required when rejecting a contractor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await rejectContractor(contractorId, notes);
      router.refresh();
      setAction(null);
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to reject contractor");
    } finally {
      setLoading(false);
    }
  }

  if (action === null) {
    return (
      <div className="flex gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          onClick={() => setAction("verify")}
          className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          Verify Contractor
        </button>
        <button
          onClick={() => setAction("reject")}
          className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Reject Contractor
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {action === "verify" ? "Admin Notes (Optional)" : "Admin Notes (Required)"}
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            action === "verify"
              ? "Add any notes about this verification..."
              : "Explain why this contractor is being rejected..."
          }
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          required={action === "reject"}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            setAction(null);
            setNotes("");
            setError(null);
          }}
          disabled={loading}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        {action === "verify" ? (
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Confirm Verification"}
          </button>
        ) : (
          <button
            onClick={handleReject}
            disabled={loading || !notes.trim()}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        )}
      </div>
    </div>
  );
}

