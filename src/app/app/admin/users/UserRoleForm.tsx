"use client";

import { useState } from "react";
import { updateUserRole } from "../actions";
import { useRouter } from "next/navigation";

export default function UserRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: "admin" | "investor" | "wholesaler" | "contractor";
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleChange(newRole: "admin" | "investor" | "wholesaler" | "contractor") {
    if (newRole === role) return;

    setLoading(true);
    setError(null);

    try {
      await updateUserRole(userId, newRole);
      setRole(newRole);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value as typeof role)}
        disabled={loading}
        className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
      >
        <option value="investor">Investor</option>
        <option value="wholesaler">Wholesaler</option>
        <option value="contractor">Contractor</option>
        <option value="admin">Admin</option>
      </select>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

