import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import ContractorLeadForm from "./ContractorLeadForm";
import { getUserRoles, hasRole } from "@/lib/roles";
import { exampleVendors } from "../sampleVendors";
import { VendorListing } from "../types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ContractorProfile = {
  id: string;
  business_name: string;
  business_phone: string | null;
  business_email: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  license_number: string | null;
  insurance_info: string | null;
  years_experience: number | null;
  service_areas: string[] | null;
  bio: string | null;
  verification_status: "pending" | "verified" | "rejected";
  profiles: {
    id: string;
    display_name: string | null;
  } | null;
  contractor_services: {
    id: string;
    service_name: string;
    service_description: string | null;
    hourly_rate: number | null;
    minimum_project_cost: number | null;
    is_active: boolean;
  }[];
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
};

export default async function ContractorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");

  // Check if this is a sample vendor
  const isSampleVendor = resolvedParams.id.startsWith("sample-");

  if (isSampleVendor) {
    // Handle sample vendor
    const sampleVendor = exampleVendors.find(v => v.id === resolvedParams.id);

    if (!sampleVendor) {
      notFound();
    }

    // Render sample vendor profile
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/app/contractors"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← Back to Contractors
            </Link>
          </div>

          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {sampleVendor.name}
                </h1>
                {sampleVendor.verificationStatus === "verified" && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    ✓ Verified
                  </span>
                )}
              </div>
              {sampleVendor.location && (
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  {sampleVendor.location}
                </p>
              )}
              {sampleVendor.tagline && (
                <p className="mt-2 text-sm italic text-zinc-500 dark:text-zinc-400">
                  {sampleVendor.tagline}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              {sampleVendor.description && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">About</h2>
                  <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{sampleVendor.description}</p>
                </div>
              )}

              {/* Services */}
              {sampleVendor.workTypes.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {sampleVendor.workTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 ring-1 ring-inset ring-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-900/40"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Projects */}
              {sampleVendor.pastProjects.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Past Projects & References</h2>
                  <div className="space-y-4">
                    {sampleVendor.pastProjects.map((project, idx) => (
                      <div key={idx} className="border-b border-zinc-200 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{project.title}</h3>
                          {project.budget && (
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              {project.budget}
                            </span>
                          )}
                        </div>
                        {project.location && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.location}</p>
                        )}
                        {project.description && (
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
                        )}
                        {project.referenceName && (
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            Reference: {project.referenceName}
                            {project.referenceContact && ` (${project.referenceContact})`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Areas */}
              {sampleVendor.marketAreas.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Service Areas</h2>
                  <div className="flex flex-wrap gap-2">
                    {sampleVendor.marketAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Contact Information</h2>
                <dl className="space-y-3">
                  {sampleVendor.contact.name && (
                    <>
                      <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Contact</dt>
                      <dd className="text-sm text-zinc-900 dark:text-zinc-50">{sampleVendor.contact.name}</dd>
                    </>
                  )}
                  {sampleVendor.contact.phone && (
                    <>
                      <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Phone</dt>
                      <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                        <a href={`tel:${sampleVendor.contact.phone}`} className="hover:underline">
                          {sampleVendor.contact.phone}
                        </a>
                      </dd>
                    </>
                  )}
                  {sampleVendor.contact.email && (
                    <>
                      <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</dt>
                      <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                        <a href={`mailto:${sampleVendor.contact.email}`} className="hover:underline">
                          {sampleVendor.contact.email}
                        </a>
                      </dd>
                    </>
                  )}
                  {sampleVendor.contact.website && (
                    <>
                      <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Website</dt>
                      <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                        <a
                          href={sampleVendor.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Visit Website →
                        </a>
                      </dd>
                    </>
                  )}
                </dl>
              </div>

              {/* Request Quote (for investors) */}
              {hasRole(roles, "investor") && sampleVendor.verificationStatus === "verified" && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Request a Quote</h2>
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                    This is a sample vendor profile. In production, you would be able to request a quote here.
                  </p>
                  <button
                    disabled
                    className="w-full rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    Contact Vendor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch contractor profile from database
  const { data: contractor, error } = await supabase
    .from("contractor_profiles")
    .select(`
      *,
      profiles:id (
        id,
        display_name
      ),
      contractor_services (
        id,
        service_name,
        service_description,
        hourly_rate,
        minimum_project_cost,
        is_active
      )
    `)
    .eq("id", resolvedParams.id)
    .single();

  if (error || !contractor) {
    notFound();
  }

  const contractorData = contractor as ContractorProfile;

  // Check access permissions
  const isOwner = contractorData.id === authData.user.id;
  const isAdmin = hasRole(roles, "admin");
  const canView =
    isAdmin ||
    (hasRole(roles, "investor") && contractorData.verification_status === "verified") ||
    (hasRole(roles, "contractor") && isOwner);

  if (!canView) {
    notFound();
  }

  const activeServices = contractorData.contractor_services.filter((s) => s.is_active);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/app/contractors"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Contractors
          </Link>
        </div>

        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {contractorData.business_name}
              </h1>
              {contractorData.verification_status === "verified" && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  ✓ Verified
                </span>
              )}
            </div>
            {contractorData.business_city && contractorData.business_state && (
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {contractorData.business_city}, {contractorData.business_state}
              </p>
            )}
          </div>
          {isOwner && (
            <Link
              href={`/app/contractors/profile`}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Edit Profile
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {contractorData.bio && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">About</h2>
                <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{contractorData.bio}</p>
              </div>
            )}

            {/* Services */}
            {activeServices.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Services Offered</h2>
                <div className="space-y-4">
                  {activeServices.map((service) => (
                    <div key={service.id} className="border-b border-zinc-200 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{service.service_name}</h3>
                        <div className="text-right">
                          {service.hourly_rate && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              ${service.hourly_rate}/hr
                            </p>
                          )}
                          {service.minimum_project_cost && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Min: ${service.minimum_project_cost.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {service.service_description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{service.service_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Details */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Business Information</h2>
              <dl className="grid grid-cols-2 gap-4">
                {contractorData.business_address && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Address</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                      {contractorData.business_address}
                      {contractorData.business_city && `, ${contractorData.business_city}`}
                      {contractorData.business_state && `, ${contractorData.business_state}`}
                      {contractorData.business_zip && ` ${contractorData.business_zip}`}
                    </dd>
                  </>
                )}
                {contractorData.business_phone && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Phone</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                      <a href={`tel:${contractorData.business_phone}`} className="hover:underline">
                        {contractorData.business_phone}
                      </a>
                    </dd>
                  </>
                )}
                {contractorData.business_email && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                      <a href={`mailto:${contractorData.business_email}`} className="hover:underline">
                        {contractorData.business_email}
                      </a>
                    </dd>
                  </>
                )}
                {contractorData.years_experience && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Experience</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                      {contractorData.years_experience} years
                    </dd>
                  </>
                )}
                {contractorData.license_number && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">License #</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">{contractorData.license_number}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Service Areas */}
            {contractorData.service_areas && contractorData.service_areas.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Service Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {contractorData.service_areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact/Lead Form */}
            {hasRole(roles, "investor") && contractorData.verification_status === "verified" && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Request a Quote</h2>
                <ContractorLeadForm contractorId={contractorData.id} />
              </div>
            )}

            {/* Verification Info (for admins/owners) */}
            {(isAdmin || isOwner) && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Verification Status</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Status: <span className="font-medium capitalize">{contractorData.verification_status}</span>
                </p>
                {contractorData.verification_status === "pending" && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Your profile is pending admin verification.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
