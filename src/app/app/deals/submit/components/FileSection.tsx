"use client";

import { useRef } from "react";
import { FormSection } from "./FormElements"; // FormInput is removed
import { motion } from "framer-motion"; // Added for motion.div

interface FileSectionProps {
    contractFile: File | null;
    handleContractFile: (file?: File) => void;
    isContractDragActive: boolean;
    setIsContractDragActive: (val: boolean) => void;
}

export function FileSection({
    contractFile,
    handleContractFile,
    isContractDragActive,
    setIsContractDragActive,
}: FileSectionProps) {
    const contractInputRef = useRef<HTMLInputElement>(null);

    // handleDrop function is removed as it was only used for photo upload

    return (
        <FormSection title="Legal Assets" description="The signed Purchase & Sale Agreement (PSA) is required for verification.">
            <div className="space-y-4 max-w-2xl mx-auto">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                    Purchase & Sale Agreement (PDF)
                </label>
                <div
                    onClick={() => contractInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsContractDragActive(true); }}
                    onDragLeave={() => setIsContractDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsContractDragActive(false);
                        if (e.dataTransfer.files?.[0]) handleContractFile(e.dataTransfer.files[0]);
                    }}
                    className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all cursor-pointer ${isContractDragActive
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                            : "border-zinc-200 hover:border-emerald-400 dark:border-zinc-800 dark:hover:border-emerald-500/50"
                        }`}
                >
                    <div className={`p-5 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${isContractDragActive ? "bg-emerald-600 text-white scale-110" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500"}`}>
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        {contractFile ? "Agreement Attached" : (isContractDragActive ? "Drop Agreement" : "Upload Signed PSA")}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-[0.1em]">PDF Files Only</p>

                    <input
                        ref={contractInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleContractFile(e.target.files[0])}
                        name="contract"
                    />
                </div>

                {contractFile && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 uppercase tracking-widest w-fit shadow-lg shadow-emerald-500/5"
                    >
                        <div className="p-1 rounded-lg bg-emerald-500 text-white">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {contractFile.name}
                    </motion.div>
                )}
            </div>
        </FormSection>
    );
}
