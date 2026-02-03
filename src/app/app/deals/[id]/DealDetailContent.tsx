"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AppHeader from "../../components/AppHeader";
import { type Role } from "@/lib/roles";
import SecureDealButton from "./SecureDealButton";
import InquiryModalButton from "./InquiryModalButton";
import DetailTutorial from "./DetailTutorial";

type DealType = "cash_deal" | "seller_finance" | "mortgage_takeover" | "trust_acquisition";

type Deal = {
    id: string;
    wholesaler_id: string;
    title: string;
    description: string | null;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string | null;
    property_type: string | null;
    asking_price: number;
    buyer_entry_cost?: number;
    deal_type?: DealType;
    arv: number | null;
    repair_estimate: number | null;
    square_feet: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    lot_size_acres: number | null;
    year_built: number | null;
    property_image_url?: string | null;
    status: "draft" | "pending" | "approved" | "rejected" | "closed";
    profiles: {
        id: string;
        display_name: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
};

type Profile = {
    id: string;
    role: Role;
    display_name?: string | null;
    avatar_url?: string | null;
};

interface DealDetailContentProps {
    dealData: Deal;
    userRole: Role;
    roles: Role[];
    profileData: Profile | null;
    userEmail: string | null | undefined;
}

export default function DealDetailContent({
    dealData,
    userRole,
    roles,
    profileData,
    userEmail
}: DealDetailContentProps) {
    // Format price for display
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Deal type badge colors and labels
    const getDealTypeInfo = (dealType?: DealType) => {
        switch (dealType) {
            case "cash_deal":
                return { label: "Cash Deal", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
            case "seller_finance":
                return { label: "Seller Finance", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
            case "mortgage_takeover":
                return { label: "Mortgage Takeover", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" };
            case "trust_acquisition":
                return { label: "Trust Acquisition", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" };
            default:
                return { label: "Cash Deal", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
        }
    };

    const dealTypeInfo = getDealTypeInfo(dealData.deal_type);
    const buyerEntryCost = dealData.buyer_entry_cost || dealData.asking_price * 0.2;

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as any
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30">
            <DetailTutorial />
            <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

            {/* Background Gradient Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AppHeader
                    userRole={userRole}
                    currentPage="deals"
                    avatarUrl={profileData?.avatar_url || null}
                    displayName={profileData?.display_name || null}
                    email={userEmail}
                />

                <motion.div
                    className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={item} className="mb-8 flex items-center justify-between gap-4">
                        <Link
                            href="/app/deals"
                            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                        >
                            <span className="text-lg">←</span> Back to Inventory
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Media & Info */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Property Image Gallery - Refined */}
                            <motion.div
                                variants={item}
                                className="group relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
                            >
                                {dealData.property_image_url ? (
                                    <img
                                        src={dealData.property_image_url}
                                        alt={dealData.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                        <svg className="h-24 w-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                )}

                                {/* Overlay Badges */}
                                <div className="absolute top-6 left-6 flex gap-3">
                                    {dealData.deal_type && (
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-xl ${dealTypeInfo.color.replace('bg-', 'bg-opacity-90 bg-')}`}>
                                            {dealTypeInfo.label}
                                        </span>
                                    )}
                                    {(dealData.status !== 'approved' && dealData.status !== 'pending') && (
                                        <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white/90 dark:bg-black/90 text-zinc-950 dark:text-zinc-50 backdrop-blur-xl border border-white/20">
                                            {dealData.status}
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Title & Address */}
                            <motion.div variants={item} className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne italic">
                                    {dealData.title}
                                </h1>
                                <p className="text-xl md:text-2xl font-medium text-zinc-500 dark:text-zinc-400">
                                    {dealData.property_address}, {dealData.property_city}, {dealData.property_state} {dealData.property_zip}
                                </p>
                            </motion.div>

                            {/* Specs Bar - Zillow Style */}
                            <motion.div
                                variants={item}
                                id="detail-specs-bar"
                                className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none"
                            >
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Beds</div>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{dealData.bedrooms || '--'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Baths</div>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{dealData.bathrooms || '--'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sqft</div>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{dealData.square_feet?.toLocaleString() || '--'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Year</div>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{dealData.year_built || '--'}</div>
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.div variants={item} className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tighter font-syne">Property Description</h2>
                                <div className="glass rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-lg shadow-zinc-200/50 dark:shadow-none">
                                    <p className="whitespace-pre-wrap leading-relaxed text-lg text-zinc-700 dark:text-zinc-300">
                                        {dealData.description || "No description provided."}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Detailed Specs Grid */}
                            <motion.div variants={item} className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tighter font-syne">Detailed Specifications</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { label: "Property Type", value: dealData.property_type, icon: "🏠" },
                                        { label: "Lot Size", value: dealData.lot_size_acres ? `${dealData.lot_size_acres.toFixed(2)} Acres` : null, icon: "🌳" },
                                        { label: "Asking Price", value: formatPrice(dealData.asking_price), icon: "🏷️" },
                                        { label: "ARV", value: dealData.arv ? formatPrice(dealData.arv) : null, icon: "📈" },
                                    ].map((spec, i) => spec.value && (
                                        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-lg shadow-zinc-200/50 dark:shadow-none hover:shadow-xl transition-shadow duration-300">
                                            <span className="text-2xl">{spec.icon}</span>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{spec.label}</div>
                                                <div className="font-bold text-zinc-950 dark:text-zinc-50 capitalize">{spec.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Sticky Sidebar */}
                        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
                            {/* Main Transaction Card */}
                            <motion.div
                                variants={item}
                                id="detail-transaction-card"
                                className="glass rounded-[2rem] border border-blue-500/20 p-8 shadow-2xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900/50 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />

                                <div className="relative z-10 space-y-8">
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Total Entry Cost</div>
                                        <div className="text-5xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne italic">
                                            {formatPrice(buyerEntryCost)}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Asking Price</span>
                                            <span className="font-black text-zinc-950 dark:text-zinc-50">{formatPrice(dealData.asking_price)}</span>
                                        </div>
                                        {dealData.repair_estimate && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Estimated Repairs</span>
                                                <span className="font-black text-zinc-950 dark:text-zinc-50">{formatPrice(dealData.repair_estimate)}</span>
                                            </div>
                                        )}
                                        {dealData.arv && (
                                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-blue-500/10">
                                                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px]">Potential Profit</span>
                                                <span className="font-black text-green-600 dark:text-green-400 text-lg">
                                                    {formatPrice(dealData.arv - dealData.asking_price - (dealData.repair_estimate || 0))}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <InquiryModalButton
                                            dealId={dealData.id}
                                            dealTitle={dealData.title}
                                            dealAddress={`${dealData.property_address}, ${dealData.property_city}, ${dealData.property_state}`}
                                        />

                                        <SecureDealButton
                                            dealId={dealData.id}
                                            dealTitle={dealData.title}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Wholesaler Info Card */}
                            <motion.div
                                variants={item}
                                className="glass rounded-[2rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl shadow-zinc-200/50 dark:shadow-none p-8 space-y-6"
                            >
                                <h3 className="text-lg font-black tracking-tighter font-syne italic">Listing Contact</h3>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                        {dealData.profiles?.display_name?.charAt(0) || "W"}
                                    </div>
                                    <div>
                                        <div className="font-black text-zinc-950 dark:text-zinc-50 tracking-tight">{dealData.profiles?.display_name || "Exclusive Partner"}</div>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verified Wholesaler</div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {dealData.profiles?.email && (
                                        <a
                                            href={`mailto:${dealData.profiles.email}`}
                                            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 transition-colors group"
                                        >
                                            <span className="text-lg">✉️</span>
                                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors break-all">
                                                {dealData.profiles.email}
                                            </span>
                                        </a>
                                    )}
                                    {dealData.profiles?.phone && (
                                        <a
                                            href={`tel:${dealData.profiles.phone.replace(/\D/g, "")}`}
                                            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 transition-colors group"
                                        >
                                            <span className="text-lg">📞</span>
                                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">
                                                {dealData.profiles.phone}
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </motion.div>

                            {/* Meta Info */}
                            <motion.div variants={item} className="px-4 text-[10px] items-center justify-between text-zinc-400 font-bold uppercase tracking-[0.2em] flex">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Live Deal
                                </div>
                                <div>ID: {dealData.id.slice(0, 8)}</div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
