"use client";

import { useState } from "react";
import { FormSection, FormInput } from "./FormElements";
import { motion, AnimatePresence } from "framer-motion";

export function CompsSection() {
    const [compCount, setCompCount] = useState(2);

    return (
        <FormSection
            title="Property Comparables (Comps)"
            description="Provide evidence of similar sales to support your valuation. Minimum of two required."
            delay={0.35}
        >
            <div className="space-y-8">
                <AnimatePresence initial={false}>
                    {Array.from({ length: compCount }).map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="relative p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/30"
                        >
                            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-zinc-900 dark:bg-zinc-50 text-[10px] font-black text-white dark:text-zinc-950 uppercase tracking-widest">
                                Comparable #{index + 1}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-2">
                                <FormInput
                                    label="Address"
                                    id={`comp_address_${index}`}
                                    name={`comp_address_${index}`}
                                    placeholder="Street, City, State"
                                    required={index < 2}
                                />
                                <FormInput
                                    label="Sale Price"
                                    id={`comp_price_${index}`}
                                    name={`comp_price_${index}`}
                                    type="number"
                                    placeholder="$"
                                    required={index < 2}
                                />
                                <FormInput
                                    label="Sale Date"
                                    id={`comp_date_${index}`}
                                    name={`comp_date_${index}`}
                                    type="date"
                                    required={index < 2}
                                />
                                <FormSelectComp
                                    label="Condition"
                                    id={`comp_condition_${index}`}
                                    name={`comp_condition_${index}`}
                                    options={[
                                        { label: "Excellent (Turnkey)", value: "excellent" },
                                        { label: "Good (Minor Rehab)", value: "good" },
                                        { label: "Fair (Needs Work)", value: "fair" },
                                        { label: "Poor (Shell)", value: "poor" },
                                    ]}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setCompCount(prev => prev + 1)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:scale-105 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Another Comparable
                    </button>
                </div>
            </div>

            {/* Hidden input to tell action how many comps to expect */}
            <input type="hidden" name="compCount" value={compCount} />
        </FormSection>
    );
}

// Internal small helper for select within this specialized section
function FormSelectComp({ label, id, options, ...props }: any) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                {label}
            </label>
            <select
                id={id}
                {...props}
                className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
