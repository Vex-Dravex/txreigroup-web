import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateInquiryStatus } from "../actions";
import InquiryStatusForm from "./InquiryStatusForm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Inquiry = {
  id: string;
  deal_id: string;
  investor_id: string;
  message: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deals: {
    id: string;
    title: string;
    property_address: string;
    property_city: string;
    property_state: string;
  } | null;
  profiles: {
    id: string;
    display_name: string | null;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function AdminInquiriesPage() {
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

  // Fetch all inquiries with related data
  const { data: inquiries } = await supabase
    .from("deal_inquiries")
    .select(`
      *,
      deals:deal_id (
        id,
        title,
        property_address,
        property_city,
        property_state
      ),
      profiles:investor_id (
        id,
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const inquiriesData = (inquiries as Inquiry[]) || [];

  // Group by status
  const newInquiries = inquiriesData.filter((i) => i.status === "new");
  const contactedInquiries = inquiriesData.filter((i) => i.status === "contacted");
  const closedInquiries = inquiriesData.filter((i) => i.status === "closed");
  const declinedInquiries = inquiriesData.filter((i) => i.status === "declined");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const InquiryCard = ({ inquiry }: { inquiry: Inquiry }) => (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {inquiry.deals?.title || "Deal"}
            </h3>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(inquiry.status)}`}
            >
              {inquiry.status}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {inquiry.deals?.property_address}, {inquiry.deals?.property_city}, {inquiry.deals?.property_state}
          </p>
          {inquiry.profiles?.display_name && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              From: {inquiry.profiles.display_name}
            </p>
          )}
        </div>
        <Link
          href={`/app/deals/${inquiry.deal_id}`}
          className="ml-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View Deal →
        </Link>
      </div>

      <div className="mb-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {inquiry.contact_email && (
          <div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email: </span>
            <a
              href={`mailto:${inquiry.contact_email}`}
              className="text-sm text-zinc-900 hover:underline dark:text-zinc-50"
            >
              {inquiry.contact_email}
            </a>
          </div>
        )}
        {inquiry.contact_phone && (
          <div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone: </span>
            <a
              href={`tel:${inquiry.contact_phone}`}
              className="text-sm text-zinc-900 hover:underline dark:text-zinc-50"
            >
              {inquiry.contact_phone}
            </a>
          </div>
        )}
      </div>

      {inquiry.message && (
        <div className="mb-4 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{inquiry.message}</p>
        </div>
      )}

      <div className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Received: {new Date(inquiry.created_at).toLocaleString()}
      </div>

      <InquiryStatusForm inquiryId={inquiry.id} currentStatus={inquiry.status} />
    </div>
  );

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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Inquiry Management</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Review and manage investor inquiries</p>
        </div>

        {/* New Inquiries */}
        {newInquiries.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              New Inquiries ({newInquiries.length})
            </h2>
            <div className="space-y-4">
              {newInquiries.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          </div>
        )}

        {/* Contacted Inquiries */}
        {contactedInquiries.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Contacted ({contactedInquiries.length})
            </h2>
            <div className="space-y-4">
              {contactedInquiries.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          </div>
        )}

        {/* Closed Inquiries */}
        {closedInquiries.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Closed ({closedInquiries.length})
            </h2>
            <div className="space-y-4">
              {closedInquiries.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          </div>
        )}

        {/* Declined Inquiries */}
        {declinedInquiries.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Declined ({declinedInquiries.length})
            </h2>
            <div className="space-y-4">
              {declinedInquiries.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          </div>
        )}

        {inquiriesData.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">No inquiries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

