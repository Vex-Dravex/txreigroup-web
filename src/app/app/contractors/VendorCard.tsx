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
      <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white/60 p-5 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur transition-all duration-200 hover:scale-[1.02] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/60 dark:ring-black/40">
        <Link
          href={`/app/profile/${vendor.id}`}
          className="absolute inset-0 z-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="sr-only">View profile for {vendor.name}</span>
        </Link>
        <div className="relative z-10 flex items-start gap-4 pointer-events-none">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-emerald-50 text-lg font-semibold text-zinc-900 dark:border-zinc-800 dark:from-blue-900/40 dark:to-emerald-900/40 dark:text-zinc-50">
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt={vendor.name} className="h-full w-full object-cover" />
            ) : (
              initialsFromName(vendor.name)
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{vendor.name}</h3>
              {vendor.verificationStatus === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
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
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{vendor.tagline}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {vendor.workTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-900/40"
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              {vendor.location && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 0 0-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 0 0-6-6Zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                  </svg>
                  {vendor.location}
                </span>
              )}
              {vendor.marketAreas.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 .894 1.447l-2 4A1 1 0 0 1 14 9H6a1 1 0 0 1-.894-.553l-2-4A1 1 0 0 1 3 4Z" />
                    <path d="M2 15a1 1 0 0 0 1 1h14a1 1 0 0 0 .912-1.408l-2.5-6A1 1 0 0 0 14.5 8h-9a1 1 0 0 0-.912.592l-2.5 6A1 1 0 0 0 2 15Z" />
                  </svg>
                  {vendor.marketAreas.slice(0, 2).join(", ")}
                  {vendor.marketAreas.length > 2 && ` +${vendor.marketAreas.length - 2} more`}
                </span>
              )}
            </div>
          </div>
        </div>

        {vendor.description && (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 pointer-events-none">{vendor.description}</p>
        )}

        <div className="mt-4 grid gap-3 rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950/60 pointer-events-auto relative z-20">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">Contact</p>
          <div className="flex flex-wrap gap-3 text-zinc-600 dark:text-zinc-400">
            {vendor.contact.name && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 9a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-7 6a6 6 0 1 1 14 0v1H3Z" />
                </svg>
                {vendor.contact.name}
              </span>
            )}
            {vendor.contact.phone && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.654 2.328a.75.75 0 0 1 .722-.073l3.25 1.3a.75.75 0 0 1 .456.693v2.25a.75.75 0 0 1-.586.73l-1.81.403a.75.75 0 0 0-.562.557 7.49 7.49 0 0 0 4.113 4.113.75.75 0 0 0 .557-.562l.403-1.81a.75.75 0 0 1 .73-.586h2.25a.75.75 0 0 1 .693.456l1.3 3.25a.75.75 0 0 1-.073.722l-1.5 2.25a.75.75 0 0 1-.75.32C6.73 15.89 4.11 13.27 2.484 9.997a.75.75 0 0 1 .32-.75Z" />
                </svg>
                {vendor.contact.phone}
              </span>
            )}
            {vendor.contact.email && (
              <span className="inline-flex items-center gap-1 break-all">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.5 4h13a.5.5 0 0 1 .5.5v.558l-7 3.889-7-3.889V4.5a.5.5 0 0 1 .5-.5Zm13.5 3.237-6.685 3.715a.5.5 0 0 1-.63 0L3 7.236V13.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V7.237Z" />
                </svg>
                {vendor.contact.email}
              </span>
            )}
            {vendor.contact.website && (
              <span className="inline-flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm4.657-9.042a6 6 0 0 0-9.314 0 6.06 6.06 0 0 0 0 2.084 6 6 0 0 0 9.314 0 6.06 6.06 0 0 0 0-2.084Z"
                    clipRule="evenodd"
                  />
                </svg>
                <a
                  href={vendor.contact.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-300 relative z-30"
                >
                  Website
                </a>
              </span>
            )}
            {!vendor.contact.name && !vendor.contact.phone && !vendor.contact.email && (
              <span className="text-zinc-500 dark:text-zinc-500">
                Contact shared after intro with the vendor.
              </span>
            )}
          </div>
        </div>

        {pastProjects.length > 0 && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800 pointer-events-none">
            <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent work & references</p>
            <div className="space-y-3">
              {pastProjects.map((project, idx) => (
                <div key={`${project.title}-${idx}`} className="rounded-md bg-white/70 p-3 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-950/60 dark:ring-zinc-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{project.title}</p>
                    {project.location && <span className="text-xs text-zinc-500 dark:text-zinc-400">{project.location}</span>}
                  </div>
                  {project.description && (
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{project.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {project.budget && <span>Budget: {project.budget}</span>}
                    {project.referenceName && (
                      <span>
                        Reference: {project.referenceName}
                        {project.referenceContact ? ` (${project.referenceContact})` : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
