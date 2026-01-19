import { z } from "zod";

export const insuranceEstimateInputSchema = z.object({
  sqft: z.number().positive(),
  yearBuilt: z.number().int().optional(),
  occupancy: z.enum(["owner", "rental", "vacant"]).default("owner"),
  roofAgeYears: z.number().int().nonnegative().optional(),
  construction: z.enum(["frame", "masonry", "unknown"]).default("unknown"),
  deductible: z.union([z.literal(1000), z.literal(2500), z.literal(5000)]).default(2500),
  riskFlags: z
    .object({
      flood: z.boolean().optional(),
      wildfire: z.boolean().optional(),
      hurricane: z.boolean().optional(),
      hail: z.boolean().optional(),
    })
    .optional(),
  replacementCostOverride: z.number().positive().optional(),
  costPerSqftOverride: z.number().positive().optional(),
});

export type InsuranceEstimateInput = z.input<typeof insuranceEstimateInputSchema>;

type InsuranceBreakdown = {
  replacementCost: number;
  costPerSqft: number;
  baseRate: number;
  baseRateAdjustments: string[];
  occupancyMultiplier: number;
  deductibleMultiplier: number;
  riskMultiplier: number;
  annual: number;
  monthly: number;
};

export type InsuranceEstimate = {
  replacementCost: number;
  annual: number;
  monthly: number;
  breakdown: InsuranceBreakdown;
};

export const estimateInsurance = (input: InsuranceEstimateInput): InsuranceEstimate => {
  const {
    sqft,
    yearBuilt,
    occupancy,
    roofAgeYears,
    construction,
    deductible,
    riskFlags,
    replacementCostOverride,
    costPerSqftOverride,
  } = insuranceEstimateInputSchema.parse(input);

  let costPerSqft = 200;
  const baseRateAdjustments: string[] = [];

  if (yearBuilt !== undefined && yearBuilt < 1980) {
    costPerSqft = 215;
  }
  if (yearBuilt !== undefined && yearBuilt < 1950) {
    costPerSqft = 230;
  }

  if (construction === "masonry") {
    costPerSqft -= 10;
  }
  if (construction === "frame") {
    costPerSqft += 10;
  }

  if (costPerSqftOverride) {
    costPerSqft = costPerSqftOverride;
  }

  const replacementCost = replacementCostOverride ?? sqft * costPerSqft;

  let baseRate = 0.005;
  if (yearBuilt !== undefined && yearBuilt < 1980) {
    baseRate += 0.0005;
    baseRateAdjustments.push("yearBuilt<1980:+0.05%");
  }
  if (yearBuilt !== undefined && yearBuilt < 1950) {
    baseRate += 0.001;
    baseRateAdjustments.push("yearBuilt<1950:+0.10%");
  }
  if (roofAgeYears !== undefined && roofAgeYears >= 15) {
    baseRate += 0.0005;
    baseRateAdjustments.push("roofAge>=15:+0.05%");
  }

  const occupancyMultiplier = occupancy === "rental" ? 1.15 : occupancy === "vacant" ? 1.35 : 1;
  const deductibleMultiplier = deductible === 1000 ? 1.1 : deductible === 5000 ? 0.9 : 1;

  let riskMultiplier = 1;
  if (riskFlags?.flood) riskMultiplier *= 1.2;
  if (riskFlags?.wildfire) riskMultiplier *= 1.2;
  if (riskFlags?.hurricane) riskMultiplier *= 1.15;
  if (riskFlags?.hail) riskMultiplier *= 1.1;

  const annual = replacementCost * baseRate * occupancyMultiplier * deductibleMultiplier * riskMultiplier;
  const monthly = annual / 12;

  return {
    replacementCost,
    annual,
    monthly,
    breakdown: {
      replacementCost,
      costPerSqft,
      baseRate,
      baseRateAdjustments,
      occupancyMultiplier,
      deductibleMultiplier,
      riskMultiplier,
      annual,
      monthly,
    },
  };
};
