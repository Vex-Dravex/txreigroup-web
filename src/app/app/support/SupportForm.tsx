"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitSupportRequest } from "./actions";

type Category = "bug" | "navigation" | "account" | "billing" | "other";

export default function SupportForm({
    initialEmail,
    initialName
}: {
    initialEmail?: string;
    initialName?: string;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [category, setCategory] = useState<Category>("bug");

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setStatus(null);
        try {
            const res = await submitSupportRequest(formData);
            if (res.success) {
                setStatus({ type: "success", text: res.message });
                // Reset form
                const form = document.getElementById("support-form") as HTMLFormElement;
                form.reset();
            }
        } catch (e: any) {
            setStatus({ type: "error", text: e.message || "Something went wrong. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    const categories = [
        { id: "bug", label: "Report a Bug", icon: "🐛" },
        { id: "navigation", label: "Navigation Issue", icon: "🗺️" },
        { id: "account", label: "Account Access", icon: "🔐" },
        { id: "billing", label: "Membership & Billing", icon: "💳" },
        { id: "other", label: "General Inquiry", icon: "💬" },
    ];

    const inputClasses = "mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 backdrop-blur-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-purple-500";
    const labelClasses = "block text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="glass rounded-[2.5rem] p-8 md:p-12 border-white/20 dark:border-white/5 shadow-2xl overflow-hidden relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <form id="support-form" action={handleSubmit} className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="name" className={labelClasses}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    defaultValue={initialName}
                                    placeholder="e.g. John Doe"
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className={labelClasses}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    defaultValue={initialEmail}
                                    placeholder="e.g. john@example.com"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>What can we help you with?</label>
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id as Category)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${category === cat.id
                                            ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                                            : "bg-white/50 border-zinc-200 text-zinc-600 hover:border-purple-300 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-purple-800"
                                            }`}
                                    >
                                        <span className="text-xl mb-1">{cat.icon}</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-center">{cat.label}</span>
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat.id}
                                            checked={category === cat.id}
                                            className="hidden"
                                            readOnly
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className={labelClasses}>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                required
                                placeholder="Briefly describe the issue"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className={labelClasses}>Detailed Message</label>
                            <textarea
                                name="message"
                                id="message"
                                required
                                rows={5}
                                placeholder="Please provide as much detail as possible. If reporting a bug, include steps to reproduce it."
                                className={`${inputClasses} resize-none`}
                            ></textarea>
                        </div>

                        <AnimatePresence>
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`rounded-2xl p-4 flex items-center gap-3 font-bold text-sm ${status.type === "success"
                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800/30"
                                        : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800/30"
                                        }`}
                                >
                                    {status.type === "success" ? (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    {status.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex items-center gap-3 rounded-2xl bg-purple-600 px-12 py-4 text-sm font-black text-white shadow-2xl shadow-purple-500/25 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending Ticket...
                                    </span>
                                ) : (
                                    <>
                                        Submit Request
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
}
