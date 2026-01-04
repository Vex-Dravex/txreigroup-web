export type PastProject = {
  title: string;
  location?: string | null;
  budget?: string | null;
  referenceName?: string | null;
  referenceContact?: string | null;
  description?: string | null;
};

export type VendorListing = {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  location?: string | null;
  marketAreas: string[];
  workTypes: string[];
  verificationStatus: "verified" | "pending" | "rejected";
  contact: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  };
  logoUrl?: string | null;
  serviceAreasNote?: string | null;
  pastProjects: PastProject[];
};
