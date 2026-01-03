import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ContractorProfile = {
  id: string;
  business_name: string;
  business_city: string | null;
  business_state: string | null;
  service_areas: string[] | null;
  bio: string | null;
  verification_status: "pending" | "verified" | "rejected";
  profiles: {
    display_name: string | null;
  } | null;
  contractor_services: {
    service_name: string;
  }[];
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function ContractorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const userRole = profileData?.role || "investor";

  // Fetch verified contractors (or all for admins)
  let contractorsQuery = supabase
    .from("contractor_profiles")
    .select(`
      *,
      profiles:id (
        display_name
      ),
      contractor_services (
        service_name
      )
    `)
    .order("created_at", { ascending: false });

  // Investors only see verified contractors
  if (userRole === "investor") {
    contractorsQuery = contractorsQuery.eq("verification_status", "verified");
  }
  // Admins see all
  // Contractors see all (for now, they can see others)

  const { data: contractors, error } = await contractorsQuery;

  if (error) {
    console.error("Error fetching contractors:", error);
  }

  const contractorsData = (contractors as ContractorProfile[]) || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader userRole={userRole} currentPage="contractors" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Contractor Marketplace</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Find verified contractors for your investment projects
          </p>
          {userRole === "contractor" && (
            <div className="mt-4">
              <Link
                href="/app/contractors/profile"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                My Profile
              </Link>
            </div>
          )}
        </div>

        {contractorsData.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">
              {userRole === "investor"
                ? "No verified contractors available at this time."
                : "No contractors found."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contractorsData.map((contractor) => (
              <Link
                key={contractor.id}
                href={`/app/contractors/${contractor.id}`}
                className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
                    {contractor.business_name}
                  </h2>
                  {contractor.verification_status === "verified" && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {(contractor.business_city || contractor.business_state) && (
                  <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {contractor.business_city}
                    {contractor.business_city && contractor.business_state && ", "}
                    {contractor.business_state}
                  </p>
                )}

                {contractor.service_areas && contractor.service_areas.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Service Areas:</p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50">
                      {contractor.service_areas.slice(0, 3).join(", ")}
                      {contractor.service_areas.length > 3 && "..."}
                    </p>
                  </div>
                )}

                {contractor.contractor_services && contractor.contractor_services.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Services:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {contractor.contractor_services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {service.service_name}
                        </span>
                      ))}
                      {contractor.contractor_services.length > 3 && (
                        <span className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                          +{contractor.contractor_services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {contractor.bio && (
                  <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{contractor.bio}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

