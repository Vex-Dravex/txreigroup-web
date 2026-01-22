"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileEditAvatar, ProfileEditBanner, ProfileEditBio, CreateShowcasePostDialog, EditShowcasePostDialog, DeleteConfirmationDialog } from "./ProfileEditDialogs";
import { createPortfolioItem, createReview, requestNetwork, respondNetworkRequest } from "./actions";
import { StarRating, StarDisplay } from "./StarRating";
import Image from "next/image";
import MessengerPopup from "../../components/MessengerPopup";

// --- Types ---
export type Profile = {
    id: string;
    role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
    display_name?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    bio?: string | null;
};

export type PortfolioItem = {
    id: string;
    user_id: string;
    category: string;
    image_url: string;
    images?: string[] | null;
    caption: string | null;
    created_at: string;
};

export type Review = {
    id: string;
    comment: string;
    rating: number;
    created_at: string;
    reviewer: any;
};

export type NetworkRequest = {
    id: string;
    status: "pending" | "accepted" | "declined";
    requester_id: string;
    requestee_id: string;
};

// --- Component ---

export default function ProfileContent({
    profileData,
    isOwner,
    portfolioItems,
    reviews,
    networkRequest,
    pendingRequests,
    networkCount,
    networkConnections,
    sampleVendorData,
    currentUserId,
    onboardingData,
    isViewerAdmin,
}: {
    profileData: Profile;
    isOwner: boolean;
    portfolioItems: PortfolioItem[];
    reviews: Review[];
    networkRequest: NetworkRequest | null;
    pendingRequests: any[];
    networkCount: number;
    networkConnections: any[];
    sampleVendorData: any;
    currentUserId: string;
    onboardingData?: any;
    isViewerAdmin?: boolean;
}) {
    const [activeTab, setActiveTab] = useState<"timeline" | "network">("timeline");
    const [isMessengerOpen, setIsMessengerOpen] = useState(false);

    const formatRoleLabel = (role: string) => role.replace("_", " ");

    const requestStatusLabel =
        networkRequest?.status === "accepted"
            ? "In Network"
            : networkRequest?.status === "pending"
                ? "Request Pending"
                : "Connect";

    // --- Sub-Components ---

    // PhotoPost Component
    const PhotoPost = ({ item }: { item: any }) => {
        const [likes, setLikes] = useState(0);
        const [isLiked, setIsLiked] = useState(false);
        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);
        const scrollContainerRef = useRef<HTMLDivElement>(null);

        // Use a timeout to avoid immediate close on click
        const closeMenuTimer = useRef<NodeJS.Timeout>(null);

        const toggleLike = () => {
            if (isLiked) {
                setLikes(prev => prev - 1);
            } else {
                setLikes(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        };

        const scroll = (direction: 'left' | 'right') => {
            if (scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const scrollAmount = container.clientWidth;
                container.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth'
                });
            }
        };

        const handleDelete = async () => {
            const { deletePortfolioItem } = await import("./actions");
            await deletePortfolioItem(profileData.id, item.id);
        };

        return (
            <div className="overflow-hidden bg-zinc-50 dark:bg-black rounded-xl border border-zinc-100 dark:border-zinc-800 relative group">
                {/* Owner Actions Menu */}
                {isOwner && (
                    <div className="absolute top-3 right-3 z-20">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            onBlur={() => {
                                closeMenuTimer.current = setTimeout(() => setIsMenuOpen(false), 200);
                            }}
                            className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
                                <button
                                    onClick={() => {
                                        if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
                                        setIsMenuOpen(false);
                                        setIsEditing(true);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        if (closeMenuTimer.current) clearTimeout(closeMenuTimer.current);
                                        setIsMenuOpen(false);
                                        setIsDeleting(true);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Dialog */}
                {isEditing && (
                    <EditShowcasePostDialog
                        item={item}
                        profileId={profileData.id}
                        open={isEditing}
                        onOpenChange={setIsEditing}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                {isDeleting && (
                    <DeleteConfirmationDialog
                        open={isDeleting}
                        onOpenChange={setIsDeleting}
                        onConfirm={handleDelete}
                    />
                )}


                {/* Media (Carousel) */}
                <div className="relative w-full aspect-square bg-black">
                    <div
                        ref={scrollContainerRef}
                        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    >
                        {item.images && item.images.length > 0 ? (
                            item.images.map((img: string, idx: number) => (
                                <div key={idx} className="w-full shrink-0 snap-center relative h-full">
                                    <img src={img} alt={`Slide ${idx}`} className="h-full w-full object-cover" />
                                </div>
                            ))
                        ) : (
                            <div className="w-full shrink-0 snap-center relative h-full">
                                <img src={item.image_url} alt="Post" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Navigation Arrows */}
                    {item.images && item.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.preventDefault(); scroll('left'); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/90 backdrop-blur-sm transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100"
                                aria-label="Previous image"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); scroll('right'); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/90 backdrop-blur-sm transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100"
                                aria-label="Next image"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </>
                    )}

                    {/* Carousel Dots */}
                    {item.images && item.images.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.images.map((_: any, idx: number) => (
                                <div key={idx} className="bg-white/70 h-1.5 w-1.5 rounded-full shadow-sm" />
                            ))}
                        </div>
                    )}
                    {/* Multi-image indicator - Hidden if Menu is overlapping or moved? Keep it but maybe adjust position if needed. The menu is top-3 right-3. The indicator was also top-3 right-3. I should change indicator position or hide it when menu is open? Or move menu to top-left? Top-right is standard for menu. Move indicator to bottom-right or top-left. Let's move indicator to top-left. */}
                    {item.images && item.images.length > 1 && (
                        <div className="absolute top-3 left-3 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm pointer-events-none">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                        </div>
                    )}
                </div>

                {/* Simplified Footer: Caption & Like */}
                <div className="p-4 flex items-start justify-between gap-4">
                    <div className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
                        {item.caption}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={toggleLike}
                            className={`shrink-0 transition-colors pt-0.5 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
                        >
                            <svg className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-zinc-500">{likes}</span>
                    </div>
                </div>
            </div>
        );
    };

    // -- Sub-Components for Tab Content --

    const TabTimeline = () => (
        <div className="space-y-6">
            {/* Full Width Bio Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">About</h2>
                    {isOwner && <ProfileEditBio profileId={profileData.id} currentBio={profileData.bio || null} />}
                </div>
                {profileData.bio ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {profileData.bio}
                    </p>
                ) : (
                    <p className="italic text-zinc-500 text-sm">No bio added yet.</p>
                )}
            </div>

            {/* Admin View: Onboarding Data */}
            {isViewerAdmin && onboardingData && (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-yellow-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h2 className="text-lg font-bold">Admin View: Onboarding Data</h2>
                    </div>

                    <div className="space-y-6 text-sm">
                        {/* Investor Data */}
                        {onboardingData.investor_data && Object.keys(onboardingData.investor_data).length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-xs tracking-wider">Investor Profile</h3>
                                <div className="grid grid-cols-1 gap-y-2 p-3 rounded-lg bg-black/20 text-zinc-300">
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="text-zinc-500">Buy Box:</span>
                                        <span className="text-right max-w-[60%]">{onboardingData.investor_data.buyBox}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="text-zinc-500">Max Entry:</span>
                                        <span className="text-right text-green-400 font-mono">${onboardingData.investor_data.maxEntry}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="text-zinc-500">Areas:</span>
                                        <span className="text-right">{onboardingData.investor_data.areas}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="text-zinc-500">Target Return:</span>
                                        <span className="text-right">{onboardingData.investor_data.targetReturn}</span>
                                    </div>
                                    <div>
                                        <span className="block text-zinc-500 mb-1">Deal Types:</span>
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {Array.isArray(onboardingData.investor_data.dealTypes) && onboardingData.investor_data.dealTypes.map((t: string) => (
                                                <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wholesaler Data */}
                        {onboardingData.wholesaler_data && Object.keys(onboardingData.wholesaler_data).length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-xs tracking-wider">Wholesaler Stats</h3>
                                <div className="grid grid-cols-1 gap-y-2 p-3 rounded-lg bg-black/20 text-zinc-300">
                                    <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span className="text-zinc-500">Experience:</span>
                                        <span className="text-right">{onboardingData.wholesaler_data.experienceYears}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Deals Closed:</span>
                                        <span className="text-right font-bold text-purple-400">{onboardingData.wholesaler_data.dealsClosed}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vendor/Service Data */}
                        {(onboardingData.vendor_data?.companyName || onboardingData.service_data?.companyName) && (
                            <div className="space-y-2">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-xs tracking-wider">Business Details</h3>
                                <div className="grid grid-cols-1 gap-y-2 p-3 rounded-lg bg-black/20 text-zinc-300">
                                    {onboardingData.service_data?.companyName && (
                                        <div className="flex justify-between border-b border-white/10 pb-1">
                                            <span className="text-zinc-500">Service Company:</span>
                                            <span className="text-right">{onboardingData.service_data.companyName} ({onboardingData.service_data.serviceType})</span>
                                        </div>
                                    )}
                                    {onboardingData.vendor_data?.companyName && (
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Vendor Company:</span>
                                            <span className="text-right">{onboardingData.vendor_data.companyName} ({onboardingData.vendor_data.serviceType})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Sidebar: Intro Details & Widgets */}
                <div className="space-y-6 lg:col-span-5">

                    {/* Intro Card (Details Only) */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">Intro</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Role: <span className="font-semibold text-zinc-900 dark:text-zinc-200 capitalize">{formatRoleLabel(profileData.role)}</span></span>
                            </div>
                            {sampleVendorData?.location && (
                                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>From <span className="font-semibold text-zinc-900 dark:text-zinc-200">{sampleVendorData.location}</span></span>
                                </div>
                            )}
                            {sampleVendorData?.contact?.website && (
                                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <a href={sampleVendorData.contact.website} target="_blank" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
                                        Website
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section (Moved from Right) */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Reviews</h2>
                            {!isOwner && (
                                <span className="text-xs text-zinc-500">Share your experience</span>
                            )}
                        </div>

                        {/* Review List */}
                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="flex gap-4">
                                        <Link href={`/app/profile/${review.reviewer?.id}`} className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                            {review.reviewer?.avatar_url ? (
                                                <img src={review.reviewer.avatar_url} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                                                    {(review.reviewer?.display_name || "U")[0]}
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex-1">
                                            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Link href={`/app/profile/${review.reviewer?.id}`} className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline">
                                                        {review.reviewer?.display_name || "User"}
                                                    </Link>
                                                    <StarDisplay rating={review.rating} size="sm" />
                                                </div>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{review.comment}</p>
                                            </div>
                                            <div className="mt-1 pl-4 text-xs text-zinc-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-zinc-500 text-sm">No reviews yet.</div>
                        )}

                        {/* Write Review */}
                        {!isOwner && (
                            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                                <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-50">Write a Review</h3>
                                <form action={createReview.bind(null, profileData.id)} className="flex gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                        {/* Current User Avatar Placeholder if needed, but we don't pass viewer avatar easily here right now. Could pass as prop. */}
                                        <div className="h-full w-full bg-zinc-300 dark:bg-zinc-700" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus-within:bg-zinc-900">
                                            <textarea
                                                name="comment"
                                                rows={2}
                                                placeholder="Write something..."
                                                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-100"
                                                required
                                            />
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-zinc-500">Rating:</span>
                                                    <StarRating name="rating" required size="sm" />
                                                </div>
                                                <button type="submit" className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Feed / Portfolio / Reviews */}
                <div className="space-y-6 lg:col-span-7">



                    {/* Photos Panel (Consolidated Feed) */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Showcase</h2>
                            {isOwner && <CreateShowcasePostDialog profileId={profileData.id} />}
                        </div>

                        <div className="space-y-8">
                            {portfolioItems.length > 0 ? (
                                portfolioItems.map(item => ({ ...item, images: item.images && item.images.length > 0 ? item.images : [item.image_url] })).map(item => (
                                    <PhotoPost key={item.id} item={item} />
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-3 h-12 w-12 text-zinc-300">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No photos yet</h3>
                                    <p className="text-xs text-zinc-500">This user hasn't uploaded any showcase items.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );



    const TabNetwork = () => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Network ({networkCount})</h2>
            {networkConnections.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {networkConnections.map((conn) => {
                        const otherUser = conn.requester_id === profileData.id ? (Array.isArray(conn.requestee) ? conn.requestee[0] : conn.requestee) : (Array.isArray(conn.requester) ? conn.requester[0] : conn.requester);
                        if (!otherUser) return null;
                        return (
                            <div key={otherUser.id} className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <Link href={`/app/profile/${otherUser.id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                    {otherUser.avatar_url ? (
                                        <img src={otherUser.avatar_url} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center font-bold text-zinc-500">{(otherUser.display_name || "U")[0]}</div>
                                    )}
                                </Link>
                                <div>
                                    <Link href={`/app/profile/${otherUser.id}`} className="font-bold text-zinc-900 hover:underline dark:text-zinc-50">
                                        {otherUser.display_name}
                                    </Link>
                                    <div className="text-xs text-zinc-500">Connected</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-zinc-500">No connections yet.</p>
            )}
        </div>
    )

    return (
        <div className="mx-auto max-w-[1200px] px-0 pb-12 sm:px-6 lg:px-8">
            {/* HEADER */}
            <div className="relative mb-6 bg-white dark:bg-zinc-900 shadow-sm sm:rounded-b-3xl">
                {/* Banner */}
                <div className="relative h-[200px] w-full overflow-hidden sm:h-[350px] sm:rounded-b-3xl">
                    <div className={`active relative h-full w-full ${!profileData.banner_url ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""}`}>
                        {profileData.banner_url && (
                            <img src={profileData.banner_url} alt="Cover" className="h-full w-full object-cover" />
                        )}
                        {/* Optional: Pattern overlay or gradient */}
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    {isOwner && <ProfileEditBanner profileId={profileData.id} currentUrl={profileData.banner_url || null} />}
                </div>

                {/* Profile Info Bar */}
                <div className="px-4 pb-4 sm:px-8">
                    <div className="-mt-16 flex flex-col items-start gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">

                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                            <div className="relative group">
                                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-lg dark:border-zinc-900 dark:bg-zinc-800 sm:h-40 sm:w-40">
                                    {profileData.avatar_url ? (
                                        <img src={profileData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-zinc-400">
                                            {(profileData.display_name || "U")[0]}
                                        </div>
                                    )}
                                </div>
                                {isOwner && <ProfileEditAvatar profileId={profileData.id} currentUrl={profileData.avatar_url || null} />}
                            </div>

                            <div className="mt-2 text-center sm:mb-2 sm:mt-0 sm:text-left">
                                <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{profileData.display_name}</h1>
                                <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:justify-start">
                                    <span className="capitalize">{formatRoleLabel(profileData.role)}</span>
                                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                    <span className="cursor-pointer hover:underline" onClick={() => setActiveTab('network')}>{networkCount} connections</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex w-full items-center gap-3 sm:w-auto sm:mb-4">
                            {!isOwner && (
                                <>
                                    <form className="flex-1 sm:flex-none" action={requestNetwork.bind(null, profileData.id)}>
                                        <button
                                            disabled={networkRequest?.status === "pending" || networkRequest?.status === "accepted"}
                                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:bg-purple-500 disabled:bg-zinc-300 disabled:shadow-none dark:disabled:bg-zinc-800"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                            {requestStatusLabel}
                                        </button>
                                    </form>
                                    <button
                                        onClick={() => setIsMessengerOpen(true)}
                                        className="flex-1 rounded-lg bg-zinc-200 px-5 py-2 text-center text-sm font-bold text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 sm:flex-none"
                                    >
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Pending Request Banner */}
                    {isOwner && pendingRequests.length > 0 && (
                        <div className="mt-4 mb-2 rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
                            <h3 className="mb-3 text-sm font-bold text-purple-900 dark:text-purple-100">Pending Network Requests</h3>
                            <div className="space-y-3">
                                {pendingRequests.map((req) => {
                                    const requester = Array.isArray(req.requester) ? req.requester[0] : req.requester;
                                    if (!requester) return null;
                                    return (
                                        <div key={req.id} className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
                                                    {requester.avatar_url && <img src={requester.avatar_url} className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{requester.display_name}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <form action={respondNetworkRequest.bind(null, req.id, "accepted")}>
                                                    <button className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500">Confirm</button>
                                                </form>
                                                <form action={respondNetworkRequest.bind(null, req.id, "declined")}>
                                                    <button className="rounded-lg bg-zinc-300 px-3 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-400">Delete</button>
                                                </form>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="my-1 h-px w-full bg-zinc-200 dark:bg-zinc-800"></div>

                    {/* Navigation Tabs */}
                    <nav className="flex gap-1 overflow-x-auto pt-1">
                        {[
                            { id: 'timeline', label: 'Timeline' },
                            { id: 'network', label: 'Network' },
                            // { id: 'photos', label: 'Photos' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative px-4 py-3 text-sm font-bold transition-colors ${activeTab === tab.id
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-purple-600 dark:bg-purple-400"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4sm:px-0">
                <AnimatePresence mode="wait">
                    {activeTab === 'timeline' && (
                        <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <TabTimeline />
                        </motion.div>
                    )}

                    {activeTab === 'network' && (
                        <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <TabNetwork />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Messenger Popup */}
            {!isOwner && (
                <MessengerPopup
                    isOpen={isMessengerOpen}
                    onClose={() => setIsMessengerOpen(false)}
                    recipientId={profileData.id}
                    recipientName={profileData.display_name || "User"}
                    recipientAvatar={profileData.avatar_url || null}
                    currentUserId={currentUserId}
                />
            )}

        </div>
    );
}
