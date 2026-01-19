"use client";

import Link from "next/link";
import { VendorListing } from "./types";

type VendorCardProps = {
  vendor: VendorListing;
  verifiedLabel?: string;
};

function initialsFromName(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "V";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function VendorCard({ vendor, verifiedLabel = "Verified Vendor" }: VendorCardProps) {
  const pastProjects = vendor.pastProjects.slice(0, 3);

  return (
    <div className="group relative block h-full">
      <div className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/40 p-5 shadow-lg shadow-zinc-200/40 backdrop-blur-md ring-1 ring-white/60 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 hover:bg-white/60 dark:border-white/5 dark:bg-zinc-900/40 dark:shadow-black/40 dark:ring-white/5 dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] dark:hover:bg-zinc-900/60">
        <Link
          href={`/app/profile/${vendor.id}`}
          className="absolute inset-0 z-0 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="sr-only">View profile for {vendor.name}</span>
        </Link>

        <div className="relative z-10 flex items-start gap-4 pointer-events-none mb-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-blue-50 to-indigo-50 text-xl font-bold text-blue-900 shadow-sm dark:border-white/10 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-100">
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt={vendor.name} className="h-full w-full object-cover" />
            ) : (
              initialsFromName(vendor.name)
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display leading-tight">{vendor.name}</h3>
              {vendor.verificationStatus === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-6.3 6.4a1 1 0 0 1-1.424.012l-3.4-3.3a1 1 0 0 1 1.406-1.42l2.696 2.617 5.594-5.68a1 1 0 0 1 1.422-.043Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {verifiedLabel}
                </span>
              )}
            </div>
            {vendor.tagline && (
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-1">{vendor.tagline}</p>
            )}

            <div className="mt-1 flex flex-wrap gap-2">
              {vendor.workTypes.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center rounded-lg bg-zinc-100/80 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300"
                >
                  {type}
                </span>
              ))}
              {vendor.workTypes.length > 3 && (
                <span className="inline-flex items-center rounded-lg bg-zinc-100/80 px-2 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400">+{vendor.workTypes.length - 3}</span>
              )}
            </div>
          </div>
        </div>

        {vendor.description && (
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 pointer-events-none">{vendor.description}</p>
        )}

        <div className="mt-auto pointer-events-auto relative z-20 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-500">
            <span>{vendor.location || "Location not specified"}</span>
            <span>{vendor.marketAreas.length > 0 ? `${vendor.marketAreas.length} markets` : "Texas"}</span>
          </div>

          <div className="grid gap-2 rounded-xl bg-white/50 p-3 ring-1 ring-zinc-200/50 dark:bg-black/20 dark:ring-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">Contact Info</p>
            <div className="flex flex-wrap gap-3 text-sm text-zinc-700 dark:text-zinc-300">
              {vendor.contact.name && (
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 9a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-7 6a6 6 0 1 1 14 0v1H3Z" />
                    </svg>
                  </div>
                  <span className="truncate max-w-[120px]">{vendor.contact.name}</span>
                </div>
              )}
              {vendor.contact.phone && (
                <a href={`tel:${vendor.contact.phone}`} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3.654 2.328a.75.75 0 0 1 .722-.073l3.25 1.3a.75.75 0 0 1 .456.693v2.25a.75.75 0 0 1-.586.73l-1.81.403a.75.75 0 0 0-.562.557 7.49 7.49 0 0 0 4.113 4.113.75.75 0 0 0 .557-.562l.403-1.81a.75.75 0 0 1 .73-.586h2.25a.75.75 0 0 1 .693.456l1.3 3.25a.75.75 0 0 1-.073.722l-1.5 2.25a.75.75 0 0 1-.75.32C6.73 15.89 4.11 13.27 2.484 9.997a.75.75 0 0 1 .32-.75Z" />
                    </svg>
                  </div>
                  <span>{vendor.contact.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
