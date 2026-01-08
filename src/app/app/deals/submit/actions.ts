"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRoles, hasRole } from "@/lib/roles";
import { estimateInsurance, insuranceEstimateInputSchema } from "@/lib/insurance/estimateInsurance";

type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
  redirectTo?: string;
};

const STORAGE_BUCKET = "forum-media"; // Reuse existing bucket; files go under deals/ prefix

const toNumber = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mapDealType = (dealType: string | null) => {
  switch (dealType) {
    case "Cash Deal":
      return "cash_deal";
    case "Seller Finance":
      return "seller_finance";
    case "Mortgage Takeover":
      return "mortgage_takeover";
    case "Trust Acquisition":
      return "trust_acquisition";
    default:
      return null;
  }
};

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  file: File,
  folder: string
) {
  const arrayBuffer = await file.arrayBuffer();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${folder}/${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function submitDeal(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { status: "error", error: "You must be signed in to submit a deal." };
  }

  const userId = authData.user.id;
  const intent = (formData.get("intent") as string) || "submit";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  const roles = await getUserRoles(supabase, userId, profile?.role || "investor");

  const title = (formData.get("title") as string) || "Untitled Deal";
  const description = (formData.get("description") as string) || "";
  const address = (formData.get("address") as string) || "";
  const city = (formData.get("city") as string) || "";
  const state = (formData.get("state") as string) || "";
  const zip = (formData.get("zip") as string) || null;
  const propertyType = (formData.get("propertyType") as string) || null;
  const dealTypeInput = (formData.get("dealType") as string) || null;
  const askingPrice = toNumber(formData.get("askingPrice"));
  const entryCost = toNumber(formData.get("entryCost"));
  const arv = toNumber(formData.get("arv"));
  const repairs = toNumber(formData.get("repairs"));
  const squareFeet = toNumber(formData.get("squareFeet"));
  const beds = toNumber(formData.get("beds"));
  const baths = toNumber(formData.get("baths"));
  const lotSize = toNumber(formData.get("lotSize"));
  const yearBuilt = toNumber(formData.get("yearBuilt"));
  const estimatedRent = toNumber(formData.get("estimatedRent"));
  const estimatedTaxes = toNumber(formData.get("estimatedTaxes"));
  const imageUrl = (formData.get("image") as string) || null;

  const purchasePrice = toNumber(formData.get("purchasePrice"));
  const downPayment = toNumber(formData.get("downPayment"));
  const monthlyPayment = toNumber(formData.get("monthlyPayment"));
  const balloonLength = toNumber(formData.get("balloonLength"));
  const remainingBalance = toNumber(formData.get("remainingBalance"));
  const interestRate = toNumber(formData.get("interestRate"));
  const existingMonthlyPayment = toNumber(formData.get("existingMonthlyPayment"));
  const contactEmail = (formData.get("contactEmail") as string) || null;
  const contactPhone = (formData.get("contactPhone") as string) || null;
  const occupancy = (formData.get("occupancy") as string) || "rental";
  const roofAgeYears = toNumber(formData.get("roofAgeYears"));
  const construction = (formData.get("construction") as string) || "unknown";
  const deductible = toNumber(formData.get("deductible"));
  const replacementCostOverride = toNumber(formData.get("replacementCostOverride"));
  const riskFlags = {
    flood: Boolean(formData.get("riskFlood")),
    wildfire: Boolean(formData.get("riskWildfire")),
    hurricane: Boolean(formData.get("riskHurricane")),
    hail: Boolean(formData.get("riskHail")),
  };

  const photos = formData.getAll("photos") as File[];
  const contract = formData.get("contract") as File | null;

  try {
    const uploadedPhotoUrls: string[] = [];
    for (const file of photos) {
      if (file && file.size > 0) {
        const url = await uploadFile(supabase, userId, file, "deals/photos");
        uploadedPhotoUrls.push(url);
      }
    }

    let contractUrl: string | null = null;
    if (contract && contract.size > 0) {
      contractUrl = await uploadFile(supabase, userId, contract, "deals/contracts");
    }

    const dealType = mapDealType(dealTypeInput) || "cash_deal";
    const submissionStatus = intent === "draft" ? "draft" : "pending";

    const extraDetails: string[] = [];
    if (estimatedRent !== null) extraDetails.push(`Estimated Rent: ${estimatedRent}`);
    if (estimatedTaxes !== null) extraDetails.push(`Estimated Taxes: ${estimatedTaxes}`);
    if (purchasePrice !== null) extraDetails.push(`Purchase Price: ${purchasePrice}`);
    if (downPayment !== null) extraDetails.push(`Down Payment: ${downPayment}`);
    if (monthlyPayment !== null) extraDetails.push(`Monthly Payment: ${monthlyPayment}`);
    if (balloonLength !== null) extraDetails.push(`Balloon Length: ${balloonLength}`);
    if (remainingBalance !== null) extraDetails.push(`Remaining Balance: ${remainingBalance}`);
    if (interestRate !== null) extraDetails.push(`Interest Rate: ${interestRate}%`);
    if (existingMonthlyPayment !== null) extraDetails.push(`Existing Monthly Payment: ${existingMonthlyPayment}`);
    if (contactEmail) extraDetails.push(`Contact Email: ${contactEmail}`);
    if (contactPhone) extraDetails.push(`Contact Phone: ${contactPhone}`);
    if (contractUrl) extraDetails.push(`Contract: ${contractUrl}`);
    if (uploadedPhotoUrls.length > 0) extraDetails.push(`Photo URLs: ${uploadedPhotoUrls.join(", ")}`);

    const combinedDescription = [
      description,
      extraDetails.length > 0
        ? `\n\nAdditional submission details:\n- ${extraDetails.join("\n- ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const insuranceInput = {
      sqft: squareFeet ?? undefined,
      yearBuilt: yearBuilt ?? undefined,
      occupancy: occupancy as "owner" | "rental" | "vacant",
      roofAgeYears: roofAgeYears ?? undefined,
      construction: construction as "frame" | "masonry" | "unknown",
      deductible: deductible === 1000 || deductible === 2500 || deductible === 5000 ? deductible : undefined,
      riskFlags,
      replacementCostOverride: replacementCostOverride ?? undefined,
    };

    const insuranceParsed = squareFeet ? insuranceEstimateInputSchema.safeParse(insuranceInput) : null;
    const insuranceEstimate = insuranceParsed?.success ? estimateInsurance(insuranceParsed.data) : null;

    const { error: insertError } = await supabase.from("deals").insert({
      wholesaler_id: userId,
      title,
      description: combinedDescription,
      property_address: address,
      property_city: city,
      property_state: state,
      property_zip: zip,
      property_type: propertyType,
      asking_price: askingPrice ?? 0,
      buyer_entry_cost: entryCost,
      deal_type: dealType,
      arv,
      repair_estimate: repairs,
      square_feet: squareFeet,
      bedrooms: beds,
      bathrooms: baths,
      lot_size_acres: lotSize,
      year_built: yearBuilt,
      property_image_url: imageUrl || uploadedPhotoUrls[0] || null,
      status: submissionStatus,
      replacement_cost_override: replacementCostOverride,
      insurance_estimate_annual: insuranceEstimate?.annual ?? null,
      insurance_estimate_monthly: insuranceEstimate?.monthly ?? null,
      insurance_estimate_inputs: insuranceEstimate ? insuranceParsed?.data ?? null : null,
      insurance_estimate_updated_at: insuranceEstimate ? new Date().toISOString() : null,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    revalidatePath("/app/deals");
    revalidatePath("/app/deals/submit");

    return {
      status: "success",
      message:
        submissionStatus === "draft"
          ? "Draft saved. You can submit when ready."
          : "Thank you, your deal is now under review and will be listed once approved.",
      redirectTo:
        submissionStatus !== "draft" && hasRole(roles, "wholesaler")
          ? "/app/admin"
          : undefined,
    };
  } catch (error: any) {
    return {
      status: "error",
      error: error?.message || "Unable to submit deal right now.",
    };
  }
}
