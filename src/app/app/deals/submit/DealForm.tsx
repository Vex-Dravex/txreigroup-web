"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { submitDeal } from "./actions";
import { FormSection, FormInput, FormSelect } from "./components/FormElements";
import { DealTypeSections } from "./components/DealTypeSections";
import { CompsSection } from "./components/CompsSection";
import { ImageGridSection } from "./components/ImageGridSection";
import { FileSection } from "./components/FileSection";

type DealType = "Cash Deal" | "Seller Finance" | "Mortgage Takeover" | "Trust Acquisition";

const initialState = {
  status: "idle" as const,
  message: "",
  error: "",
};

export default function DealForm() {
  const [dealType, setDealType] = useState<DealType>("Cash Deal");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isContractDragActive, setIsContractDragActive] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(submitDeal, initialState);
  const router = useRouter();
  const isMortgageBased = dealType === "Mortgage Takeover" || dealType === "Trust Acquisition";

  useEffect(() => {
    if (state.status === "success") {
      if (state.redirectTo) {
        router.push(state.redirectTo);
        return;
      }
      formRef.current?.reset();
      setSelectedPhotos([]);
      setContractFile(null);
    }
  }, [state, router]);

  const handlePhotosChange = (files: File[], primaryIndex: number) => {
    setSelectedPhotos(files);
    setPrimaryImageIndex(primaryIndex);
  };

  const handleContractFile = (file?: File) => {
    if (!file) return;
    setContractFile(file.type === "application/pdf" ? file : null);
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-12 pb-20">
      {/* Hidden inputs for multi-photo support if needed beyond formData.getAll('photos') */}
      <input type="hidden" name="primaryImageIndex" value={primaryImageIndex} />
      {selectedPhotos.map((_, i) => (
        <input key={i} type="hidden" name="photo_exists" value="true" />
      ))}

      {/* 1. Basic Info */}
      <FormSection title="Property Basics" description="Identify the property and its core attributes." delay={0.1}>
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput label="Deal Title" id="title" name="title" placeholder="e.g. Off-Market SFH in Dallas" required />
          <FormSelect
            label="Property Type"
            id="propertyType"
            name="propertyType"
            options={[
              { label: "Single Family", value: "Single Family" },
              { label: "Townhome", value: "Townhome" },
              { label: "Condo", value: "Condo" },
              { label: "Multi-Family", value: "Multi-Family" },
              { label: "Land", value: "Land" },
              { label: "Other", value: "Other" },
            ]}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput label="Property Address" id="address" name="address" placeholder="Street address" />
          <div className="grid grid-cols-3 gap-4">
            <FormInput label="City" id="city" name="city" />
            <FormInput label="State" id="state" name="state" maxLength={2} />
            <FormInput label="ZIP" id="zip" name="zip" />
          </div>
        </div>
      </FormSection>

      {/* 2. Financing & Financials */}
      <FormSection title="Financial Framework" description="Configure the deal structure and investment targets." delay={0.2}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FormSelect
            label="Deal Structure"
            id="dealType"
            name="dealType"
            value={dealType}
            onChange={(e) => setDealType(e.target.value as DealType)}
            options={[
              { label: "Cash Deal", value: "Cash Deal" },
              { label: "Seller Finance", value: "Seller Finance" },
              { label: "Mortgage Takeover", value: "Mortgage Takeover" },
              { label: "Trust Acquisition", value: "Trust Acquisition" },
            ]}
          />
          <FormInput label="Buyer Entry Cost" id="entryCost" name="entryCost" type="number" placeholder="Cash to close" />
          <FormInput label="Est. Rent" id="estimatedRent" name="estimatedRent" type="number" placeholder="Monthly" />
          <FormInput label="Est. Taxes" id="estimatedTaxes" name="estimatedTaxes" type="number" placeholder="Monthly" />
        </div>
      </FormSection>

      {/* 3. Dynamic Deal Sections */}
      <DealTypeSections dealType={dealType} isMortgageBased={isMortgageBased} />

      {/* 4. Physical Specs */}
      <FormSection title="Physical Specifications" description="Data points for property evaluation." delay={0.3}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <FormInput
            label="Sq Footage"
            id="squareFeet"
            name="squareFeet"
            type="number"
            placeholder="e.g. 1850"
          />
          <FormInput
            label="Year Built"
            id="yearBuilt"
            name="yearBuilt"
            type="number"
            placeholder="e.g. 1995"
          />
          <FormInput label="Beds" id="beds" name="beds" type="number" />
          <FormInput label="Baths" id="baths" name="baths" type="number" step="0.5" />
          <FormInput label="Acres" id="lotSize" name="lotSize" type="number" step="0.01" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
            Deal Summary
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Rehab scope, comps, access instructions..."
            className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50 dark:focus:border-blue-400"
          />
        </div>
      </FormSection>

      {/* 5. Comps Section */}
      <CompsSection />

      {/* 6. Assets Section */}
      <ImageGridSection onImagesChange={handlePhotosChange} />

      <FileSection
        contractFile={contractFile}
        handleContractFile={handleContractFile}
        isContractDragActive={isContractDragActive}
        setIsContractDragActive={setIsContractDragActive}
      />

      {/* 8. Contact & Action */}
      <FormSection title="Contact Information" description="How investors will reach the wholesaler." delay={0.5}>
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput label="Email Address" id="contactEmail" name="contactEmail" type="email" placeholder="you@example.com" />
          <FormInput label="Phone Number" id="contactPhone" name="contactPhone" type="tel" placeholder="(555) 000-0000" />
        </div>
      </FormSection>

      {/* Status Messages & Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
          <div className="pointer-events-auto w-full max-w-2xl">
            {state.status === "success" && state.message && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm text-center shadow-xl shadow-emerald-500/20 mb-4 uppercase tracking-widest">
                {state.message}
              </motion.div>
            )}
            {state.status === "error" && state.error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500 text-white font-bold text-sm text-center shadow-xl shadow-red-500/20 mb-4 uppercase tracking-widest">
                {state.error}
              </motion.div>
            )}
          </div>

          <div className="pointer-events-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 w-full">
            <p className="flex-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center sm:text-left ml-4">
              Pending deals undergo expert review before publication
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                name="intent"
                value="draft"
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-950 dark:text-zinc-50 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95"
              >
                Save Draft
              </button>
              <SubmitButton />
            </div>
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
      className="flex-1 sm:flex-none px-10 py-4 rounded-2xl bg-blue-600 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        "Submit Deal"
      )}
    </button>
  );
}
