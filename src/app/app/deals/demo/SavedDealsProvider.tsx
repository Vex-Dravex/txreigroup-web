"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SavedDealsContextType = {
    savedIds: string[];
    toggleSave: (id: string) => void;
    isSaved: (id: string) => boolean;
    showSavedOnly: boolean;
    setShowSavedOnly: (show: boolean) => void;
    isLoading: boolean;
};

const SavedDealsContext = createContext<SavedDealsContextType | undefined>(undefined);

export function SavedDealsProvider({ children }: { children: React.ReactNode }) {
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Initialize Supabase client and load saved listings
    useEffect(() => {
        const initializeSavedListings = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsLoading(false);
                    return;
                }

                setUserId(user.id);

                // Fetch saved listings from database
                const { data, error } = await supabase
                    .from('saved_listings')
                    .select('deal_id')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching saved listings:', error);
                } else if (data) {
                    setSavedIds(data.map((item: { deal_id: string }) => item.deal_id));
                }
            } catch (error) {
                console.error('Error initializing saved listings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeSavedListings();
    }, []);

    const toggleSave = async (id: string) => {
        if (!userId) {
            console.error('User not authenticated');
            return;
        }

        const supabase = createSupabaseBrowserClient();
        const isCurrentlySaved = savedIds.includes(id);

        // Optimistically update UI
        setSavedIds(prev =>
            isCurrentlySaved
                ? prev.filter(savedId => savedId !== id)
                : [...prev, id]
        );

        try {
            if (isCurrentlySaved) {
                // Remove from database
                const { error } = await supabase
                    .from('saved_listings')
                    .delete()
                    .eq('user_id', userId)
                    .eq('deal_id', id);

                if (error) {
                    console.error('Error removing saved listing:', error);
                    // Revert optimistic update
                    setSavedIds(prev => [...prev, id]);
                }
            } else {
                // Add to database
                const { error } = await supabase
                    .from('saved_listings')
                    .insert({ user_id: userId, deal_id: id });

                if (error) {
                    console.error('Error saving listing:', error);
                    // Revert optimistic update
                    setSavedIds(prev => prev.filter(savedId => savedId !== id));
                }
            }
        } catch (error) {
            console.error('Error toggling saved listing:', error);
            // Revert on error
            setSavedIds(prev =>
                isCurrentlySaved
                    ? [...prev, id]
                    : prev.filter(savedId => savedId !== id)
            );
        }
    };

    const isSaved = (id: string) => savedIds.includes(id);

    // Debug: Log when showSavedOnly changes
    React.useEffect(() => {
        console.log('[SavedDealsProvider] showSavedOnly changed to:', showSavedOnly);
    }, [showSavedOnly]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({
        savedIds,
        toggleSave,
        isSaved,
        showSavedOnly,
        setShowSavedOnly,
        isLoading
    }), [savedIds, showSavedOnly, isLoading]);

    return (
        <SavedDealsContext.Provider value={contextValue}>
            {children}
        </SavedDealsContext.Provider>
    );
}

export function useSavedDeals() {
    const context = useContext(SavedDealsContext);
    if (context === undefined) {
        throw new Error('useSavedDeals must be used within a SavedDealsProvider');
    }
    return context;
}
