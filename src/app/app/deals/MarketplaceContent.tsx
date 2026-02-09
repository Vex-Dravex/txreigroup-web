"use client";

import { useState } from "react";
import DealsListContainer from "./DealsListContainer";
import AuthModal from "./AuthModal";

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

interface MarketplaceContentProps {
    initialDeals: Deal[];
    isAuthenticated: boolean;
}

export default function MarketplaceContent({
    initialDeals,
    isAuthenticated,
}: MarketplaceContentProps) {
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleUnauthenticatedClick = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setShowAuthModal(true);
        }
    };

    return (
        <>
            <DealsListContainer
                initialDeals={initialDeals}
                onUnauthenticatedClick={!isAuthenticated ? handleUnauthenticatedClick : undefined}
            />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
