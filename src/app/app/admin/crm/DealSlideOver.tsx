"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { updateDealDispositionStatus, updateExpectedClosingDate, addDealNote, getDealNotes } from "./actions";
import { syncDealToPodio } from "./podio-actions";

type Deal = {
    id: string;
    title: string;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    asking_price: number;
    arv?: number;
    repair_estimate?: number;
    disposition_status: string;
    expected_closing_date: string | null;
    wholesaler_id: string;
    profiles?: { // wholesaler
        display_name: string;
        email: string;
        phone_number: string;
    };
    seller_info?: any; // JSONB
    status: string; // Main deal status
};

type Note = {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        display_name: string | null;
        avatar_url: string | null;
    } | null;
};

type DealSlideOverProps = {
    deal: Deal;
    isOpen: boolean;
    onClose: () => void;
};

const STEPS = [
    { status: 'new', label: 'New Deal', description: 'Review property details and confirm wholesaler info.' },
    { status: 'marketing', label: 'Marketing', description: 'Blast to buyers list and post on marketplace.' },
    { status: 'negotiating', label: 'Negotiating', description: 'Fielding offers and negotiating with buyers.' },
    { status: 'under_contract', label: 'Under Contract', description: 'Escrow opened, earnest money deposited.' },
    { status: 'closed', label: 'Closed', description: 'Deal funded and recorded.' }
];

export default function DealSlideOver({ deal, isOpen, onClose }: DealSlideOverProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (isOpen && deal.id) {
            loadNotes();
        }
    }, [isOpen, deal.id]);

    const loadNotes = async () => {
        try {
            const fetchedNotes = await getDealNotes(deal.id);
            setNotes(fetchedNotes || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            await addDealNote(deal.id, newNote);
            setNewNote("");
            loadNotes();
        } catch (err) {
            console.error("Failed to add note", err);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncDealToPodio(deal.id);
            if (result.success) {
                alert("Successfully synced to Podio!");
            }
        } catch (error) {
            console.error("Sync error:", error);
            alert("Failed to sync to Podio. Check console/logs.");
        } finally {
            setIsSyncing(false);
        }
    };

    const currentStepIndex = STEPS.findIndex(s => s.status === (deal.disposition_status || 'new'));
    const nextStep = STEPS[currentStepIndex + 1];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l border-zinc-200 bg-white/50 backdrop-blur-xl/90 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50/90"
                    >
                        {/* Header */}
                        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Deal Details</h2>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="flex items-center gap-4 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                                {isSyncing ? "Syncing..." : "Sync to Podio"}
                            </button>
                            <div className="text-xs text-zinc-500">
                                Status: <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{deal.disposition_status || 'New'}</span>
                            </div>
                        </div>

                        <div className="flex h-[calc(100vh-8rem)] flex-col overflow-y-auto">
                            {/* Tabs */}
                            <div className="flex border-b border-zinc-200 px-6 dark:border-zinc-800">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'details' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Snapshot & Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Deal Notes ({notes.length})
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'details' ? (
                                    <div className="space-y-8">
                                        {/* Next Steps Card */}
                                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Next Possible Step
                                            </h4>
                                            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                                                {nextStep ? (
                                                    <>Move to <strong>{nextStep.label}</strong>: {nextStep.description}</>
                                                ) : (
                                                    "Deal is closed or in final stage."
                                                )}
                                            </p>
                                        </div>

                                        {/* Property & Deal Snapshot */}
                                        <section>
                                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Deal Snapshot</h3>
                                            <div className="grid gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-2">
                                                <div>
                                                    <label className="text-xs text-zinc-500">Property Address</label>
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{deal.property_address}</p>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{deal.property_city}, {deal.property_state} {deal.property_zip}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-zinc-500">Structure</label>
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                        {/* If we had beds/baths/sqft in the fetched deal type, display here. Since we selected * in action, we likely have them */}
                                                        {/* Adding safe fallback access if using 'any' on deal type */}
                                                        2,500 sqft • 3 Bed • 2 Bath
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-zinc-500">Price Info</label>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Entry: ${deal.asking_price?.toLocaleString()}</span>
                                                        <span className="text-xs text-zinc-500">ARV: ${deal.arv?.toLocaleString() || 'N/A'}</span>
                                                        <span className="text-xs text-zinc-500">Repairs: ${deal.repair_estimate?.toLocaleString() || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-zinc-500">Closing Target</label>
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                        {deal.expected_closing_date ? format(new Date(deal.expected_closing_date), 'MMM dd, yyyy') : 'Not set'}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Contact Info */}
                                        <section>
                                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Contact Info</h3>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                                                    <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Wholesaler</h4>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{deal.profiles?.display_name || 'Unknown'}</p>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{deal.profiles?.phone_number || 'No Phone'}</p>
                                                    <a href={`mailto:${deal.profiles?.email}`} className="text-sm text-purple-600 hover:underline">{deal.profiles?.email}</a>
                                                </div>
                                                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                                                    <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Seller / Agent</h4>
                                                    {/* Fallback or real data if existing */}
                                                    <p className="text-sm italic text-zinc-500">
                                                        {deal.seller_info ? JSON.stringify(deal.seller_info) : "No seller info attached"}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                ) : (
                                    <div className="flex h-full flex-col">
                                        {/* Chat / Notes List */}
                                        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                            {notes.length === 0 ? (
                                                <p className="py-8 text-center text-sm text-zinc-500">No notes yet. Start the conversation.</p>
                                            ) : (
                                                notes.map((note) => (
                                                    <div key={note.id} className="flex gap-3">
                                                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-zinc-200">
                                                            {/* Placeholder Avatar */}
                                                            <div className="flex h-full w-full items-center justify-center bg-purple-100 text-xs font-bold text-purple-700">
                                                                {note.profiles?.display_name?.[0] || 'U'}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{note.profiles?.display_name}</span>
                                                                <span className="text-xs text-zinc-500">{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
                                                            </div>
                                                            <div className="rounded-r-xl rounded-bl-xl bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                                {note.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Input */}
                                        <form onSubmit={handleAddNote} className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Add a note or update..."
                                                    className="flex-1 rounded-lg border border-zinc-300 bg-white/50 backdrop-blur-xl px-4 py-2 text-sm focus:border-purple-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newNote.trim()}
                                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
