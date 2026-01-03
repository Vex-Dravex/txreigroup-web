import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { verifyContractor, rejectContractor } from "../actions";
import ContractorVerificationForm from "./ContractorVerificationForm";

type ContractorProfile = {
  id: string;
  business_name: string;
  business_phone: string | null;
  business_email: string | null;
  business_city: string | null;
  business_state: string | null;
  license_number: string | null;
  years_experience: number | null;
  verification_status: "pending" | "verified" | "rejected";
  admin_notes: string | null;
  created_at: string;
  profiles: {
    id: string;
    display_name: string | null;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function AdminContractorsPage() {
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
  if (profileData?.role !== "admin") {
    redirect("/app");
  }

  // Fetch pending contractors
  const { data: pendingContractors } = await supabase
    .from("contractor_profiles")
    .select(`
      *,
      profiles:id (
        id,
        display_name
      )
    `)
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  // Fetch all contractors
  const { data: allContractors } = await supabase
    .from("contractor_profiles")
    .select(`
      *,
      profiles:id (
        id,
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Contractor Verification</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Review and verify contractor profiles
          </p>
        </div>

        {/* Pending Contractors Section */}
        {pendingContractors && pendingContractors.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Pending Verification ({pendingContractors.length})
            </h2>
            <div className="space-y-6">
              {(pendingContractors as ContractorProfile[]).map((contractor) => (
                <div
                  key={contractor.id}
                  className="rounded-lg border border-yellow-200 bg-white p-6 shadow-sm dark:border-yellow-800 dark:bg-zinc-950"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                          {contractor.business_name}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(contractor.verification_status)}`}
                        >
                          {contractor.verification_status}
                        </span>
                      </div>
                      {contractor.business_city && contractor.business_state && (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {contractor.business_city}, {contractor.business_state}
                        </p>
                      )}
                      {contractor.profiles?.display_name && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          Owner: {contractor.profiles.display_name}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/app/contractors/${contractor.id}`}
                      className="ml-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      View Profile →
                    </Link>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {contractor.business_phone && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Phone</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {contractor.business_phone}
                        </p>
                      </div>
                    )}
                    {contractor.business_email && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Email</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {contractor.business_email}
                        </p>
                      </div>
                    )}
                    {contractor.license_number && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">License #</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {contractor.license_number}
                        </p>
                      </div>
                    )}
                    {contractor.years_experience && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Experience</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {contractor.years_experience} years
                        </p>
                      </div>
                    )}
                  </div>

                  <ContractorVerificationForm contractorId={contractor.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Contractors Overview */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">All Contractors</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Business Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allContractors && allContractors.length > 0 ? (
                  (allContractors as ContractorProfile[]).map((contractor) => (
                    <tr
                      key={contractor.id}
                      className="border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {contractor.business_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {contractor.business_city}, {contractor.business_state}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(contractor.verification_status)}`}
                        >
                          {contractor.verification_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(contractor.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/contractors/${contractor.id}`}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                      No contractors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

