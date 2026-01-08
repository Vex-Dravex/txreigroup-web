"use client";

import { useState } from "react";
import { updateUserRoles } from "../actions";
import { useRouter } from "next/navigation";
import { roleDisplayNames, type Role } from "@/lib/roles";

const AVAILABLE_ROLES: Role[] = ["admin", "investor", "wholesaler", "contractor", "vendor"];

export default function UserRoleForm({
  userId,
  currentRoles,
}: {
  userId: string;
  currentRoles: Role[];
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(currentRoles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (role: Role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  async function handleSave() {
    setLoading(true);
    setError(null);

    try {
      await updateUserRoles(userId, roles);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update user roles");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_ROLES.map((role) => (
          <label
            key={role}
            className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-200"
          >
            <input
              type="checkbox"
              checked={roles.includes(role)}
              onChange={() => toggleRole(role)}
              disabled={loading}
              className="h-3 w-3 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {roleDisplayNames[role]}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        {loading ? "Saving..." : "Save Roles"}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
