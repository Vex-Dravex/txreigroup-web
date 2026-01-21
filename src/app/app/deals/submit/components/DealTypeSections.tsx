"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FormSection, FormInput } from "./FormElements";

interface DealTypeSectionsProps {
    dealType: string;
    isMortgageBased: boolean;
}

export function DealTypeSections({ dealType, isMortgageBased }: DealTypeSectionsProps) {
    return (
        <AnimatePresence mode="wait">
            {dealType === "Cash Deal" && (
                <motion.div
                    key="cash"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormSection title="Cash Deal Details" description="Define the standard cash purchase parameters.">
                        <div className="grid gap-6 md:grid-cols-3">
                            <FormInput
                                label="Asking Price"
                                id="askingPrice"
                                name="askingPrice"
                                type="number"
                                placeholder="e.g. 185000"
                            />
                            <FormInput
                                label="ARV"
                                id="arv"
                                name="arv"
                                type="number"
                                placeholder="After Repair Value"
                            />
                            <FormInput
                                label="Estimated Repairs"
                                id="repairs"
                                name="repairs"
                                type="number"
                                placeholder="e.g. 45000"
                            />
                        </div>
                    </FormSection>
                </motion.div>
            )}

            {dealType === "Seller Finance" && (
                <motion.div
                    key="sf"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormSection title="Seller Finance Terms" description="Outline the owner financing agreement.">
                        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
                            <FormInput
                                label="Purchase Price"
                                id="purchasePrice"
                                name="purchasePrice"
                                type="number"
                            />
                            <FormInput
                                label="Down Payment"
                                id="downPayment"
                                name="downPayment"
                                type="number"
                            />
                            <FormInput
                                label="Interest Rate (%)"
                                id="interestRate"
                                name="interestRate"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                            />
                            <FormInput
                                label="Monthly Payment"
                                id="monthlyPayment"
                                name="monthlyPayment"
                                type="number"
                            />
                            <FormInput
                                label="Balloon Length"
                                id="balloonLength"
                                name="balloonLength"
                                type="number"
                                placeholder="Months"
                            />
                        </div>
                    </FormSection>
                </motion.div>
            )}

            {isMortgageBased && (
                <motion.div
                    key="mortgage"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormSection title="Mortgage Snapshot" description="Details about the existing lien to be assumed or acquired.">
                        <div className="grid gap-6 md:grid-cols-3">
                            <FormInput
                                label="Remaining Balance"
                                id="remainingBalance"
                                name="remainingBalance"
                                type="number"
                            />
                            <FormInput
                                label="Interest Rate (%)"
                                id="interestRate"
                                name="interestRate"
                                type="number"
                                step="0.01"
                            />
                            <FormInput
                                label="Existing Payment"
                                id="existingMonthlyPayment"
                                name="existingMonthlyPayment"
                                type="number"
                            />
                        </div>
                    </FormSection>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
