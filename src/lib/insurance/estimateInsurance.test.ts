import { describe, expect, it } from "vitest";
import { estimateInsurance } from "./estimateInsurance";

describe("estimateInsurance", () => {
  it("calculates baseline annual and monthly estimates", () => {
    const result = estimateInsurance({
      sqft: 2000,
      yearBuilt: 2005,
      occupancy: "owner",
      construction: "unknown",
    });

    expect(result.replacementCost).toBe(2000 * 200);
    expect(result.annual).toBeCloseTo(2000 * 200 * 0.005, 2);
    expect(result.monthly).toBeCloseTo(result.annual / 12, 2);
  });

  it("applies year built, roof age, and construction adjustments", () => {
    const result = estimateInsurance({
      sqft: 1500,
      yearBuilt: 1940,
      roofAgeYears: 20,
      occupancy: "owner",
      construction: "frame",
    });

    expect(result.breakdown.costPerSqft).toBe(240);
    expect(result.breakdown.baseRate).toBeCloseTo(0.0065, 6);
  });

  it("applies occupancy, deductible, and risk multipliers", () => {
    const result = estimateInsurance({
      sqft: 1800,
      yearBuilt: 2010,
      occupancy: "rental",
      deductible: 1000,
      riskFlags: {
        flood: true,
        hail: true,
      },
      construction: "masonry",
    });

    const replacementCost = 1800 * 190;
    const baseRate = 0.005;
    const expectedAnnual = replacementCost * baseRate * 1.15 * 1.1 * 1.32;
    expect(result.annual).toBeCloseTo(expectedAnnual, 2);
  });
});
