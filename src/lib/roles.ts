import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "admin" | "investor" | "wholesaler" | "contractor" | "vendor" | "service";

const ROLE_PRIORITY: Role[] = ["admin", "wholesaler", "investor", "contractor", "vendor", "service"];

export const roleDisplayNames: Record<Role, string> = {
  admin: "Administrator",
  investor: "Investor",
  wholesaler: "Wholesaler",
  contractor: "Contractor",
  vendor: "Vendor",
  service: "Transaction Service",
};

export function hasRole(roles: Role[], target: Role): boolean {
  if (target === "contractor") {
    return roles.includes("contractor") || roles.includes("vendor");
  }
  if (target === "vendor") {
    return roles.includes("vendor") || roles.includes("contractor");
  }
  return roles.includes(target);
}

export function getPrimaryRole(roles: Role[], fallback: Role = "investor"): Role {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return fallback;
}

export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string,
  fallbackRole?: Role
): Promise<Role[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? [])
    .map((row: { role: Role | null }) => row.role)
    .filter((role): role is Role => Boolean(role));

  if (roles.length === 0 && fallbackRole) {
    return [fallbackRole];
  }

  return roles;
}
