"use client";

import { useState } from "react";
import { updateAccount, updateSafeEmail, updatePassword } from "./actions";
import { useRouter } from "next/navigation";

type Profile = {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
};

type Section = "profile" | "security" | "membership";

export default function AccountForm({ profile, userEmail }: { profile: Profile; userEmail: string }) {
    const [activeSection, setActiveSection] = useState<Section>("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    async function handleProfileUpdate(formData: FormData) {
        setIsLoading(true);
        setMessage(null);
        try {
            await updateAccount(formData);
            setMessage({ type: "success", text: "Profile updated successfully" });
            router.refresh();
        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleEmailUpdate(formData: FormData) {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await updateSafeEmail(formData);
            setMessage({ type: "success", text: res.message });
        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePasswordUpdate(formData: FormData) {
        setIsLoading(true);
        setMessage(null);
        try {
            await updatePassword(formData);
            setMessage({ type: "success", text: "Password updated successfully" });
            const form = document.getElementById("password-form") as HTMLFormElement;
            form.reset();
        } catch (e: any) {
            setMessage({ type: "error", text: e.message });
        } finally {
            setIsLoading(false);
        }
    }

    const sections = [
        { id: "profile", label: "Personal Information", description: "Update your personal details here." },
        { id: "security", label: "Security", description: "Manage your email and password." },
        { id: "membership", label: "Membership", description: "View your current plan and billing status." },
    ];

    return (
        <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Navigation */}
            <nav className="w-full lg:w-64 flex-shrink-0">
                <ul className="space-y-1">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <button
                                onClick={() => {
                                    setActiveSection(section.id as Section);
                                    setMessage(null);
                                }}
                                className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeSection === section.id
                                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                                    }`}
                            >
                                {section.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {sections.find((s) => s.id === activeSection)?.label}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {sections.find((s) => s.id === activeSection)?.description}
                    </p>
                </div>

                {message && (
                    <div
                        className={`mb-6 rounded-md p-4 ${message.type === "success"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Personal Information Form */}
                {activeSection === "profile" && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <form action={handleProfileUpdate} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        defaultValue={profile.first_name || ""}
                                        placeholder="John"
                                        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        defaultValue={profile.last_name || ""}
                                        placeholder="Doe"
                                        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    id="displayName"
                                    defaultValue={profile.display_name || ""}
                                    placeholder="John Doe"
                                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    This is how your name will appear to other users.
                                </p>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    defaultValue={profile.phone || ""}
                                    placeholder="+1 (555) 000-0000"
                                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Form */}
                {activeSection === "security" && (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Email Address</h3>
                            <form action={handleEmailUpdate} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        New Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        defaultValue={userEmail}
                                        className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Update Email
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Change Password</h3>
                            <form id="password-form" action={handlePasswordUpdate} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            placeholder="••••••••"
                                            minLength={6}
                                            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            minLength={6}
                                            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-600"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Set New Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Membership Form */}
                {activeSection === "membership" && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                        {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Member"} Plan
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                                        Active
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    You have full access to all available features for your role.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                            <h4 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">Plan Features</h4>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Community Access
                                </li>
                                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Profile & Portfolio
                                </li>
                                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Network Education
                                </li>
                                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Deals & Marketplace
                                </li>
                            </ul>
                            <div className="mt-6 flex gap-4">
                                <button
                                    type="button"
                                    className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    onClick={() => alert("Billing portal integration coming soon.")}
                                >
                                    Manage Subscription
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
