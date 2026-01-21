"use client";

import { useState } from "react";
import { updateAccount, updateSafeEmail, updatePassword } from "./actions";
import { useRouter } from "next/navigation";
import ImageCropper from "../components/ImageCropper";
import { motion, AnimatePresence } from "framer-motion";

type Profile = {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    avatar_url?: string | null;
};

type Section = "profile" | "security" | "membership";

export default function AccountForm({ profile, userEmail }: { profile: Profile; userEmail: string }) {
    const [activeSection, setActiveSection] = useState<Section>("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url || null);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);
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

    function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageForCrop(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    async function handleCropComplete(croppedImage: Blob) {
        setSelectedImageForCrop(null);
        setIsLoading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", croppedImage, "avatar.jpg");

            const response = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload avatar");
            }

            const { url } = await response.json();
            setAvatarUrl(url);
            setMessage({ type: "success", text: "Profile picture updated successfully" });
            router.refresh();
        } catch (error) {
            setMessage({ type: "error", text: "Failed to upload profile picture" });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAvatarRemove() {
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/upload/avatar", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to remove avatar");
            }

            setAvatarUrl(null);
            setMessage({ type: "success", text: "Profile picture removed successfully" });
            router.refresh();
        } catch (error) {
            setMessage({ type: "error", text: "Failed to remove profile picture" });
        } finally {
            setIsLoading(false);
        }
    }

    const sections = [
        {
            id: "profile",
            label: "Personal Details",
            description: "Manage your public profile information.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: "security",
            label: "Security & Login",
            description: "Control your email and password settings.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            id: "membership",
            label: "Plan & Billing",
            description: "Manage your subscription and usage.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
    ];

    const inputClasses = "mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 backdrop-blur-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-purple-500";
    const labelClasses = "block text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1";

    return (
        <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Navigation */}
            <nav className="w-full lg:w-72 flex-shrink-0">
                <div className="glass rounded-3xl p-3 border-white/20 dark:border-white/5">
                    <ul className="space-y-2">
                        {sections.map((section) => {
                            const isActive = activeSection === section.id;
                            return (
                                <li key={section.id}>
                                    <button
                                        onClick={() => {
                                            setActiveSection(section.id as Section);
                                            setMessage(null);
                                        }}
                                        className={`w-full group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${isActive
                                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                                            }`}
                                    >
                                        <span className={`transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"}`}>
                                            {section.icon}
                                        </span>
                                        <div className="flex flex-col items-start leading-tight">
                                            <span>{section.label}</span>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute inset-0 bg-purple-600 rounded-2xl -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Account Status Card */}
                <div className="mt-6 glass rounded-3xl p-6 border-white/20 dark:border-white/5 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                    <h4 className="text-xs uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500 mb-4">Account Status</h4>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold dark:text-zinc-100">Verified Member</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Your account is in good standing. Member since {new Date().getFullYear()}.
                    </p>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        {/* Section Header */}
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-display">
                                {sections.find((s) => s.id === activeSection)?.label}
                            </h2>
                            <p className="mt-1 text-zinc-500 dark:text-zinc-400 font-medium">
                                {sections.find((s) => s.id === activeSection)?.description}
                            </p>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-2xl p-4 flex items-center gap-3 font-bold text-sm ${message.type === "success"
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800/30"
                                    : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800/30"
                                    }`}
                            >
                                {message.type === "success" ? (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {message.text}
                            </motion.div>
                        )}

                        {/* Profile Section */}
                        {activeSection === "profile" && (
                            <div className="space-y-6">
                                {/* Avatar Card */}
                                <div className="glass rounded-[2rem] p-8 border-white/20 dark:border-white/5 shadow-xl">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-purple-500 rounded-full" />
                                        Profile Identity
                                    </h3>
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
                                            <div className="relative">
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt="Profile"
                                                        className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-2xl"
                                                    />
                                                ) : (
                                                    <div className="h-32 w-32 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-700 shadow-2xl overflow-hidden">
                                                        <span className="text-4xl font-black text-zinc-400 dark:text-zinc-500">
                                                            {profile.display_name?.[0]?.toUpperCase() || profile.first_name?.[0]?.toUpperCase() || "?"}
                                                        </span>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-4 leading-relaxed">
                                                This photo will be displayed on your profile and community posts.
                                                Supported formats: JPG, PNG, WEBP.
                                            </p>
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                                <label className="cursor-pointer group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAvatarSelect}
                                                        disabled={isLoading}
                                                        className="hidden"
                                                    />
                                                    <span className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Upload New
                                                    </span>
                                                </label>
                                                {avatarUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAvatarRemove}
                                                        disabled={isLoading}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-black text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-100 hover:scale-105 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Info Card */}
                                <div className="glass rounded-[2rem] p-8 border-white/20 dark:border-white/5 shadow-xl">
                                    <form action={handleProfileUpdate} className="space-y-6">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="firstName" className={labelClasses}>First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    id="firstName"
                                                    defaultValue={profile.first_name || ""}
                                                    placeholder="e.g. John"
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    id="lastName"
                                                    defaultValue={profile.last_name || ""}
                                                    placeholder="e.g. Doe"
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="displayName" className={labelClasses}>Display Name</label>
                                            <input
                                                type="text"
                                                name="displayName"
                                                id="displayName"
                                                defaultValue={profile.display_name || ""}
                                                placeholder="e.g. JohnnyD"
                                                className={inputClasses}
                                            />
                                            <p className="mt-2 text-xs text-zinc-500 font-medium ml-1">
                                                This is how you'll be identified in the community.
                                            </p>
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className={labelClasses}>Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                defaultValue={profile.phone || ""}
                                                placeholder="+1 (555) 000-0000"
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="group relative flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Save Changes
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
                        )}

                        {/* Security Section */}
                        {activeSection === "security" && (
                            <div className="space-y-6">
                                <div className="glass rounded-[2rem] p-8 border-white/20 dark:border-white/5 shadow-xl">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-blue-500 rounded-full" />
                                        Email Verification
                                    </h3>
                                    <form action={handleEmailUpdate} className="space-y-6">
                                        <div>
                                            <label htmlFor="email" className={labelClasses}>Registered Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                defaultValue={userEmail}
                                                className={inputClasses}
                                            />
                                            <p className="mt-2 text-xs text-zinc-500 font-medium ml-1">
                                                A confirmation link will be sent to the new email address.
                                            </p>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-black text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                Update Email
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="glass rounded-[2rem] p-8 border-white/20 dark:border-white/5 shadow-xl">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-red-500 rounded-full" />
                                        Update Password
                                    </h3>
                                    <form id="password-form" action={handlePasswordUpdate} className="space-y-6">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="password" className={labelClasses}>New Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    id="password"
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    id="confirmPassword"
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-black text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                Set New Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Membership Section */}
                        {activeSection === "membership" && (
                            <div className="glass rounded-[2rem] p-8 border-white/20 dark:border-white/5 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
                                        <div className="text-center sm:text-left">
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-display">
                                                    {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Pro"} Plan
                                                </h3>
                                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 ring-1 ring-inset ring-emerald-500/20 backdrop-blur-sm dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    Active Status
                                                </span>
                                            </div>
                                            <p className="mt-3 text-zinc-500 dark:text-zinc-400 font-medium">
                                                Premium tier membership with unlimited access to the marketplace.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center sm:items-end">
                                            <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">$0.00</span>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Per Month</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-2 mt-8">
                                        <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Features Included</h4>
                                            <ul className="space-y-3">
                                                {[
                                                    "Full Marketplace Access",
                                                    "Community Networking",
                                                    "Vendor Recommendations",
                                                    "Investment Toolbox",
                                                ].map((feat) => (
                                                    <li key={feat} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                            <svg className="h-3 w-3 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex flex-col justify-between">
                                            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                                                <h4 className="text-sm font-black text-purple-700 dark:text-purple-400 mb-2 uppercase tracking-wider">Need help?</h4>
                                                <p className="text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">
                                                    Our support team is available 24/7 for any billing inquiries.
                                                </p>
                                            </div>
                                            <div className="mt-6 flex flex-wrap gap-4">
                                                <button
                                                    type="button"
                                                    className="flex-1 rounded-xl bg-zinc-900 px-6 py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                                                    onClick={() => alert("Billing portal integration coming soon.")}
                                                >
                                                    Manage Subscription
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Image Cropper Modal */}
            {selectedImageForCrop && (
                <ImageCropper
                    image={selectedImageForCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setSelectedImageForCrop(null)}
                />
            )}
        </div>
    );
}
