"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { submitDeal } from "./actions";
import { estimateInsurance, insuranceEstimateInputSchema } from "@/lib/insurance/estimateInsurance";

type DealType = "Cash Deal" | "Seller Finance" | "Mortgage Takeover" | "Trust Acquisition";

const dealTypeOptions: DealType[] = [
  "Cash Deal",
  "Seller Finance",
  "Mortgage Takeover",
  "Trust Acquisition",
];

const initialState = {
  status: "idle" as const,
  message: "",
  error: "",
};

export default function DealForm() {
  const [dealType, setDealType] = useState<DealType>("Cash Deal");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isContractDragActive, setIsContractDragActive] = useState(false);
  const contractInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(submitDeal, initialState);
  const router = useRouter();
  const isMortgageBased = dealType === "Mortgage Takeover" || dealType === "Trust Acquisition";
  const [insuranceInputs, setInsuranceInputs] = useState({
    sqft: "",
    yearBuilt: "",
    occupancy: "rental",
    roofAgeYears: "",
    construction: "unknown",
    deductible: "2500",
    replacementCostOverride: "",
    riskFlood: false,
    riskWildfire: false,
    riskHurricane: false,
    riskHail: false,
  });

  useEffect(() => {
    if (state.status === "success") {
      if (state.redirectTo) {
        router.push(state.redirectTo);
        return;
      }
      formRef.current?.reset();
      setSelectedFiles([]);
      setContractFile(null);
      setInsuranceInputs({
        sqft: "",
        yearBuilt: "",
        occupancy: "rental",
        roofAgeYears: "",
        construction: "unknown",
        deductible: "2500",
        replacementCostOverride: "",
        riskFlood: false,
        riskWildfire: false,
        riskHurricane: false,
        riskHail: false,
      });
    }
  }, [state, router]);

  const toNumber = (value: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const insuranceEstimate = useMemo(() => {
    const sqft = toNumber(insuranceInputs.sqft);
    if (!sqft) return null;
    const yearBuilt = toNumber(insuranceInputs.yearBuilt);
    const roofAgeYears = toNumber(insuranceInputs.roofAgeYears);
    const deductible = toNumber(insuranceInputs.deductible);
    const replacementCostOverride = toNumber(insuranceInputs.replacementCostOverride);

    const parsed = insuranceEstimateInputSchema.safeParse({
      sqft,
      yearBuilt,
      occupancy: insuranceInputs.occupancy as "owner" | "rental" | "vacant",
      roofAgeYears,
      construction: insuranceInputs.construction as "frame" | "masonry" | "unknown",
      deductible: deductible === 1000 || deductible === 2500 || deductible === 5000 ? deductible : undefined,
      replacementCostOverride,
      riskFlags: {
        flood: insuranceInputs.riskFlood,
        wildfire: insuranceInputs.riskWildfire,
        hurricane: insuranceInputs.riskHurricane,
        hail: insuranceInputs.riskHail,
      },
    });

    if (!parsed.success) return null;
    return estimateInsurance(parsed.data);
  }, [insuranceInputs]);

  const handleFiles = (files: FileList) => {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    setSelectedFiles(images);

    const dataTransfer = new DataTransfer();
    images.forEach((file) => dataTransfer.items.add(file));
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (event.dataTransfer.files?.length) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleContractFile = (file?: File) => {
    if (!file) return;
    const selected = file.type === "application/pdf" ? file : null;
    setContractFile(selected);

    const dataTransfer = new DataTransfer();
    if (selected) dataTransfer.items.add(selected);
    if (contractInputRef.current) {
      contractInputRef.current.files = dataTransfer.files;
    }
  };

  const handleContractDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsContractDragActive(false);
    if (event.dataTransfer.files?.length) {
      handleContractFile(event.dataTransfer.files[0]);
    }
  };

  const handleContractDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsContractDragActive(true);
  };

  const handleContractDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsContractDragActive(false);
  };

  const handleContractChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      handleContractFile(event.target.files[0]);
    }
  };

  return (
    <form ref={formRef} className="space-y-6" action={formAction}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="title">
            Deal Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g., Off-Market SFH in Dallas"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="propertyType">
            Property Type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option>Single Family</option>
            <option>Townhome</option>
            <option>Condo</option>
            <option>Multi-Family</option>
            <option>Land</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="address">
            Property Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="Street address"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="state">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              maxLength={2}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="zip">
              ZIP
            </label>
            <input
              id="zip"
              name="zip"
              type="text"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="dealType">
            Deal Type
          </label>
          <select
            id="dealType"
            name="dealType"
            value={dealType}
            onChange={(event) => setDealType(event.target.value as DealType)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {dealTypeOptions.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="entryCost">
            Buyer Entry Cost
          </label>
          <input
            id="entryCost"
            name="entryCost"
            type="number"
            min="0"
            step="1000"
            placeholder="Down payment / cash to close"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="estimatedRent">
            Estimated Rent
          </label>
          <input
            id="estimatedRent"
            name="estimatedRent"
            type="number"
            min="0"
            step="50"
            placeholder="e.g., 2000"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="estimatedTaxes">
            Estimated Taxes (monthly)
          </label>
          <input
            id="estimatedTaxes"
            name="estimatedTaxes"
            type="number"
            min="0"
            step="50"
            placeholder="e.g., 250"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/40">
        <div className="mb-3 text-sm font-semibold text-indigo-900 dark:text-indigo-200">Insurance Estimate Inputs</div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="occupancy">
              Occupancy
            </label>
            <select
              id="occupancy"
              name="occupancy"
              value={insuranceInputs.occupancy}
              onChange={(event) =>
                setInsuranceInputs((prev) => ({ ...prev, occupancy: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="owner">Owner Occupied</option>
              <option value="rental">Rental</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="construction">
              Construction
            </label>
            <select
              id="construction"
              name="construction"
              value={insuranceInputs.construction}
              onChange={(event) =>
                setInsuranceInputs((prev) => ({ ...prev, construction: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="unknown">Unknown</option>
              <option value="frame">Frame</option>
              <option value="masonry">Masonry</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="deductible">
              Deductible
            </label>
            <select
              id="deductible"
              name="deductible"
              value={insuranceInputs.deductible}
              onChange={(event) =>
                setInsuranceInputs((prev) => ({ ...prev, deductible: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="1000">$1,000</option>
              <option value="2500">$2,500</option>
              <option value="5000">$5,000</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="roofAgeYears">
              Roof Age (years)
            </label>
            <input
              id="roofAgeYears"
              name="roofAgeYears"
              type="number"
              min="0"
              step="1"
              placeholder="e.g., 12"
              value={insuranceInputs.roofAgeYears}
              onChange={(event) =>
                setInsuranceInputs((prev) => ({ ...prev, roofAgeYears: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="replacementCostOverride">
              Replacement Cost Override
            </label>
            <input
              id="replacementCostOverride"
              name="replacementCostOverride"
              type="number"
              min="0"
              step="1000"
              placeholder="Optional override"
              value={insuranceInputs.replacementCostOverride}
              onChange={(event) =>
                setInsuranceInputs((prev) => ({ ...prev, replacementCostOverride: event.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Risk Flags</span>
            <div className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="riskFlood"
                  checked={insuranceInputs.riskFlood}
                  onChange={(event) =>
                    setInsuranceInputs((prev) => ({ ...prev, riskFlood: event.target.checked }))
                  }
                />
                Flood zone
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="riskWildfire"
                  checked={insuranceInputs.riskWildfire}
                  onChange={(event) =>
                    setInsuranceInputs((prev) => ({ ...prev, riskWildfire: event.target.checked }))
                  }
                />
                Wildfire risk
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="riskHurricane"
                  checked={insuranceInputs.riskHurricane}
                  onChange={(event) =>
                    setInsuranceInputs((prev) => ({ ...prev, riskHurricane: event.target.checked }))
                  }
                />
                Hurricane exposure
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="riskHail"
                  checked={insuranceInputs.riskHail}
                  onChange={(event) =>
                    setInsuranceInputs((prev) => ({ ...prev, riskHail: event.target.checked }))
                  }
                />
                Hail exposure
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-md border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900/60 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Estimated Insurance</div>
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Estimate only
            </span>
          </div>
          {insuranceEstimate ? (
            <>
              <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(insuranceEstimate.monthly)} / mo
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatCurrency(insuranceEstimate.annual)} / yr
              </div>
              <details className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">How we calculate</summary>
                <div className="mt-2 space-y-1">
                  <div>Replacement cost: {formatCurrency(insuranceEstimate.breakdown.replacementCost)}</div>
                  <div>Cost per sqft: {formatCurrency(insuranceEstimate.breakdown.costPerSqft)}</div>
                  <div>Base rate: {(insuranceEstimate.breakdown.baseRate * 100).toFixed(2)}%</div>
                  {insuranceEstimate.breakdown.baseRateAdjustments.length > 0 && (
                    <div>Adjustments: {insuranceEstimate.breakdown.baseRateAdjustments.join(", ")}</div>
                  )}
                  <div>Occupancy multiplier: {insuranceEstimate.breakdown.occupancyMultiplier.toFixed(2)}x</div>
                  <div>Deductible multiplier: {insuranceEstimate.breakdown.deductibleMultiplier.toFixed(2)}x</div>
                  <div>Risk multiplier: {insuranceEstimate.breakdown.riskMultiplier.toFixed(2)}x</div>
                </div>
              </details>
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Add square feet below to preview the estimate.
            </p>
          )}
        </div>
      </div>

      {dealType === "Cash Deal" && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
          <div className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-200">Cash Deal Details</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="askingPrice">
                Asking Price
              </label>
              <input
                id="askingPrice"
                name="askingPrice"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 185000"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="arv">
                ARV (After Repair Value)
              </label>
              <input
                id="arv"
                name="arv"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 280000"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="repairs">
                Estimated Repairs
              </label>
              <input
                id="repairs"
                name="repairs"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 45000"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
          </div>
        </div>
      )}

      {dealType === "Seller Finance" && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
          <div className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">Seller Finance Terms</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="purchasePrice">
                Purchase Price
              </label>
              <input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 250000"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="downPayment">
                Down Payment
              </label>
              <input
                id="downPayment"
                name="downPayment"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 25000"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="monthlyPayment">
                Monthly Payment
              </label>
              <input
                id="monthlyPayment"
                name="monthlyPayment"
                type="number"
                min="0"
                step="100"
                placeholder="e.g., 1500"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="balloonLength">
                Balloon Length (months)
              </label>
              <input
                id="balloonLength"
                name="balloonLength"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 60"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
          </div>
        </div>
      )}

      {isMortgageBased && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
          <div className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">Existing Mortgage Snapshot</div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="remainingBalance">
                Remaining Balance
              </label>
              <input
                id="remainingBalance"
                name="remainingBalance"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 275000"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="interestRate">
                Interest Rate (%)
              </label>
              <input
                id="interestRate"
                name="interestRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 4.25"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="existingMonthlyPayment">
                Existing Monthly Payment
              </label>
              <input
                id="existingMonthlyPayment"
                name="existingMonthlyPayment"
                type="number"
                min="0"
                step="100"
                placeholder="e.g., 1800"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="squareFeet">
            Square Feet
          </label>
          <input
            id="squareFeet"
            name="squareFeet"
            type="number"
            min="0"
            step="50"
            placeholder="e.g., 1850"
            onChange={(event) =>
              setInsuranceInputs((prev) => ({ ...prev, sqft: event.target.value }))
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="yearBuilt">
            Year Built
          </label>
          <input
            id="yearBuilt"
            name="yearBuilt"
            type="number"
            min="1800"
            step="1"
            placeholder="e.g., 1995"
            onChange={(event) =>
              setInsuranceInputs((prev) => ({ ...prev, yearBuilt: event.target.value }))
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="beds">
            Beds
          </label>
          <input
            id="beds"
            name="beds"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="baths">
            Baths
          </label>
          <input
            id="baths"
            name="baths"
            type="number"
            min="0"
            step="0.5"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="lotSize">
            Lot Size (acres)
          </label>
          <input
            id="lotSize"
            name="lotSize"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="image">
            Primary Photo URL
          </label>
          <input
            id="image"
            name="image"
            type="url"
            placeholder="https://..."
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="description">
          Deal Summary
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="High-level notes, access instructions, rehab scope, comps, etc."
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="photos">
            Upload Property Photos
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors md:h-56 md:max-h-64 ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:border-blue-500/70 dark:bg-blue-950/30"
                : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
            }`}
          >
            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Drag and drop photos or <span className="text-blue-600 dark:text-blue-400">browse files</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">PNG or JPG preferred; multiple files supported.</p>
          </div>
          <input
            ref={fileInputRef}
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="contract">
            Purchase & Sale Agreement (PDF)
          </label>
          <div
            onClick={() => contractInputRef.current?.click()}
            onDrop={handleContractDrop}
            onDragOver={handleContractDragOver}
            onDragEnter={handleContractDragOver}
            onDragLeave={handleContractDragLeave}
            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors md:h-56 md:max-h-64 ${
              isContractDragActive
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-950/30"
                : "border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
            }`}
          >
            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Drag and drop the signed agreement or <span className="text-blue-600 dark:text-blue-400">browse files</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">PDF only; one file.</p>
          </div>
          <input
            ref={contractInputRef}
            id="contract"
            name="contract"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleContractChange}
          />
        </div>
      </div>

      {(selectedFiles.length > 0 || contractFile) && (
        <div className="space-y-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {selectedFiles.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wide">Photos uploaded</div>
              <ul className="mt-1 space-y-1">
                {selectedFiles.map((file) => (
                  <li key={file.name} className="truncate">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {contractFile && (
            <div>
              <div className="text-[11px] uppercase tracking-wide">Agreement uploaded</div>
              <div className="truncate">{contractFile.name}</div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="contactEmail">
            Contact Email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="contactPhone">
            Contact Phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            placeholder="(555) 123-4567"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {state.status === "success" && state.message && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100">
            {state.message}
          </div>
        )}
        {state.status === "error" && state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100">
            {state.error}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Submissions save to your account; pending deals are reviewed by an admin before they go live.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              name="intent"
              value="draft"
              formNoValidate
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-600"
            >
              Save Draft
            </button>
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="intent"
      value="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
    >
      {pending ? "Submitting..." : "Submit Deal"}
    </button>
  );
}
