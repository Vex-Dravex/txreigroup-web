"use client";

import { useState } from "react";
import { updateUserStatus } from "../actions";
import { useRouter } from "next/navigation";

export default function UserStatusForm({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;

    setLoading(true);
    setError(null);

    try {
      await updateUserStatus(userId, newStatus);
      setStatus(newStatus);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={loading}
        className="w-full rounded-md border border-zinc-300 bg-white/50 backdrop-blur-xl px-2 py-1 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
      >
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

