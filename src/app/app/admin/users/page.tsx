import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateUserStatus } from "../actions";
import UserRoleForm from "./UserRoleForm";
import UserStatusForm from "./UserStatusForm";
import { getUserRoles, hasRole, roleDisplayNames, type Role } from "@/lib/roles";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type User = {
  id: string;
  display_name: string | null;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  status: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  memberships: {
    tier: string;
    status: string;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
};

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  if (!hasRole(roles, "admin")) {
    redirect("/app");
  }

  // Fetch all users with their membership
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      memberships:user_id (
        tier,
        status
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  const usersData = (users as User[]) || [];

  const userIds = usersData.map((user) => user.id);
  const roleRows = userIds.length
    ? (
        await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds)
      ).data
    : [];

  const rolesByUser = new Map<string, Role[]>();
  (roleRows || []).forEach((row: { user_id: string; role: Role }) => {
    if (!rolesByUser.has(row.user_id)) {
      rolesByUser.set(row.user_id, []);
    }
    rolesByUser.get(row.user_id)?.push(row.role);
  });

  usersData.forEach((user) => {
    user.roles = rolesByUser.get(user.id) || [user.role];
  });

  // Group by role
  const admins = usersData.filter((u) => u.roles?.includes("admin"));
  const investors = usersData.filter((u) => u.roles?.includes("investor"));
  const wholesalers = usersData.filter((u) => u.roles?.includes("wholesaler"));
  const contractors = usersData.filter((u) => u.roles?.includes("contractor") || u.roles?.includes("vendor"));

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "investor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "wholesaler":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "contractor":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "vendor":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const UserRow = ({ user }: { user: User }) => (
    <tr className="border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            {user.display_name || `User ${user.id.slice(0, 8)}`}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">ID: {user.id.slice(0, 8)}...</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {(user.roles || [user.role]).map((role) => (
            <span
              key={role}
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRoleBadgeClass(role)}`}
            >
              {roleDisplayNames[role]}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(user.status)}`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {user.memberships?.tier ? (
          <span className="capitalize">{user.memberships.tier.replace("_", " ")}</span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <UserRoleForm userId={user.id} currentRoles={user.roles || [user.role]} />
          <UserStatusForm userId={user.id} currentStatus={user.status} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/app/admin"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">User Management</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage user roles and status</p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{usersData.length}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Admins</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{admins.length}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Investors</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{investors.length}</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Wholesalers</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{wholesalers.length}</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                  Membership
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {usersData.length > 0 ? (
                usersData.map((user) => <UserRow key={user.id} user={user} />)
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
