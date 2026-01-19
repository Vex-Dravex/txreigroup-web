"use client";

import React from "react";
import { useSavedDeals } from "./SavedDealsProvider";
import DealsGrid from "./DealsGrid";
import DealLink from "./DealLink";
import HeartButton from "./HeartButton";
import DealCardImage from "./DealCardImage";

type DealType = "cash_deal" | "seller_finance" | "mortgage_takeover" | "trust_acquisition";

type Deal = {
    id: string;
    wholesaler_id: string;
    title: string;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string | null;
    asking_price: number;
    buyer_entry_cost?: number;
    deal_type?: DealType;
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
    property_image_url?: string | null;
    deal_media?: {
        file_path: string;
        display_order: number;
    }[];
    status: string;
};

interface DealsListContainerProps {
    initialDeals: Deal[];
}

export default function DealsListContainer({
    initialDeals,
}: DealsListContainerProps) {
    // Format price for display
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deal_images/${path}`;
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
    const { showSavedOnly, savedIds } = useSavedDeals();

    // Use useMemo to ensure filtering is reactive to state changes
    const filteredDeals = React.useMemo(() => {
        console.log('[DealsListContainer] Filtering deals:', {
            showSavedOnly,
            savedIdsCount: savedIds.length,
            initialDealsCount: initialDeals.length,
        });

        if (showSavedOnly) {
            const saved = initialDeals.filter(d => savedIds.includes(d.id));
            console.log('[DealsListContainer] Showing saved only:', saved.length);
            return saved;
        }

        console.log('[DealsListContainer] Showing all deals:', initialDeals.length);
        return initialDeals;
    }, [showSavedOnly, savedIds, initialDeals]);

    // Debug: Log when key state changes
    React.useEffect(() => {
        console.log('[DealsListContainer] State changed:', {
            showSavedOnly,
            savedIdsCount: savedIds.length,
            filteredDealsCount: filteredDeals.length,
        });
    }, [showSavedOnly, savedIds, filteredDeals.length]);

    if (filteredDeals.length === 0) {
        return (
            <div className="glass rounded-3xl border border-zinc-200 p-16 text-center shadow-sm dark:border-zinc-800">
                <div className="text-4xl mb-4">{showSavedOnly ? "❤️" : "🏠"}</div>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                    {showSavedOnly
                        ? "You haven't saved any listings yet."
                        : "No listings found matching your criteria."}
                </p>
            </div>
        );
    }

    return (
        <DealsGrid key={`${showSavedOnly ? 'saved-only' : 'all-deals'}-${filteredDeals[0]?.id || 'empty'}`}>
            {filteredDeals.map((deal) => {
                const dealTypeInfo = getDealTypeInfo(deal.deal_type);
                const buyerEntryCost = deal.buyer_entry_cost || deal.asking_price * 0.2;

                // Collect images for carousel
                const images: string[] = [];
                if (deal.property_image_url) {
                    images.push(getImageUrl(deal.property_image_url));
                }
                if (deal.deal_media && deal.deal_media.length > 0) {
                    const mediaImages = deal.deal_media
                        .sort((a, b) => a.display_order - b.display_order)
                        .map(m => getImageUrl(m.file_path));
                    images.push(...mediaImages);
                }
                const uniqueImages = Array.from(new Set(images.filter(Boolean)));


                return (
                    <DealLink
                        key={deal.id}
                        dealId={deal.id}
                        className="group relative flex flex-col bg-white dark:bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
                    >
                        {/* Save Button Overlay */}
                        <div className="absolute top-4 right-4 z-30">
                            <HeartButton dealId={deal.id} />
                        </div>

                        {/* Property Image Carousel */}
                        <div className="relative h-64 w-full overflow-hidden">
                            <DealCardImage
                                images={uniqueImages}
                                alt={deal.title}
                                dealId={deal.id}
                            />

                            {/* Status Overlay - Only show if not 'approved' or 'pending' as per request (or maybe just show Deal Type) */}
                            <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
                                {deal.deal_type && (
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${dealTypeInfo.color.replace('bg-', 'bg-opacity-80 bg-')}`}>
                                        {dealTypeInfo.label}
                                    </span>
                                )}
                                {/* Status Badge - Hidden for 'approved' and 'pending' as requested */}
                                {deal.status !== 'approved' && deal.status !== 'pending' && (
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/90 dark:bg-black/90 text-zinc-900 dark:text-zinc-50 backdrop-blur-md`}>
                                        {deal.status}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="mb-6 flex flex-col gap-3">
                                <div>
                                    <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-none">
                                        {formatPrice(buyerEntryCost)}
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mt-1">Entry</div>
                                </div>

                                <div className="min-w-0 w-full text-right mt-1">
                                    <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {deal.property_address}, {deal.property_city}, {deal.property_state} {deal.property_zip}
                                    </h2>
                                </div>
                            </div>

                            {/* Stats Grid - Zillow Style */}
                            <div className="grid grid-cols-3 gap-4 py-4 border-y border-zinc-100 dark:border-zinc-800 mb-6 font-medium text-sm">
                                <div className="flex flex-col">
                                    <span className="text-zinc-950 dark:text-zinc-50 font-bold">{deal.bedrooms || '--'}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Beds</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-950 dark:text-zinc-50 font-bold">{deal.bathrooms || '--'}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Baths</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-950 dark:text-zinc-50 font-bold">{deal.square_feet?.toLocaleString() || '--'}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Sqft</span>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between text-xs pt-2">
                                <div className="text-zinc-500">
                                    Asking: <span className="font-bold text-zinc-900 dark:text-zinc-200">{formatPrice(deal.asking_price)}</span>
                                </div>
                                <div className="text-blue-600 font-bold uppercase tracking-widest text-[10px] group-hover:translate-x-1 transition-transform">
                                    View Details →
                                </div>
                            </div>
                        </div>
                    </DealLink>
                );
            })}
        </DealsGrid>
    );
}
