"use client";

import { motion } from "framer-motion";

interface FormSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    delay?: number;
}

export function FormSection({ title, description, children, delay = 0 }: FormSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass rounded-3xl border border-zinc-200/50 bg-white/50 p-8 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-950/50"
        >
            <div className="mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-syne tracking-tight">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {description}
                    </p>
                )}
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </motion.div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function FormInput({ label, id, ...props }: InputProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50 dark:focus:border-blue-400"
            />
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { label: string; value: string }[];
}

export function FormSelect({ label, id, options, ...props }: SelectProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                {label}
            </label>
            <select
                id={id}
                {...props}
                className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50 dark:focus:border-blue-400"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
