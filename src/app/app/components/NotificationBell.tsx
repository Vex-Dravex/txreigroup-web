"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { respondNetworkRequest } from "../profile/[id]/actions";

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read_at: string | null;
    created_at: string;
    actor_id: string | null;
    actor?: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    } | null;
    metadata?: {
        requester_id?: string;
        request_id?: string;
        requestee_id?: string;
        [key: string]: any;
    } | null;
};

type NotificationBellProps = {
    initialNotifications?: Notification[];
    unreadCount?: number;
};

export default function NotificationBell({ initialNotifications = [], unreadCount = 0 }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [count, setCount] = useState(unreadCount);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch notifications when opened or on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/notifications");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                const unread = data.filter((n: Notification) => !n.read_at).length;
                setCount(unread);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: "POST",
            });

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "POST",
            });

            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleNetworkResponse = async (notificationId: string, requestId: string, action: "accepted" | "declined") => {
        try {
            // Optimistic update
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setCount(prev => Math.max(0, prev - 1));

            await respondNetworkRequest(requestId, action);

            // Mark the notification as read if it wasn't already (though we removed it from UI)
            await markAsRead(notificationId);
        } catch (error) {
            console.error("Error responding to network request:", error);
            // Revert on error if needed, but for now we'll just log
            fetchNotifications();
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (notification: Notification) => {
        if (notification.type === 'network_request' && notification.actor?.avatar_url) {
            return (
                <Link href={`/app/profile/${notification.actor.id}`} className="block h-10 w-10 overflow-hidden rounded-full ring-2 ring-purple-500/20 transition-transform hover:scale-110">
                    <img src={notification.actor.avatar_url} alt="" className="h-full w-full object-cover" />
                </Link>
            );
        }

        switch (notification.type) {
            case "deal_approved":
            case "deal_rejected":
                return <span className="text-2xl">📋</span>;
            case "network_request":
                return <span className="text-2xl">👤</span>;
            case "new_listing":
                return <span className="text-2xl">🏠</span>;
            case "profile_review":
                return <span className="text-2xl">⭐</span>;
            case "forum_post_like":
                return <span className="text-2xl">❤️</span>;
            case "forum_comment":
            case "forum_reply":
                return <span className="text-2xl">💬</span>;
            case "message":
                return <span className="text-2xl">✉️</span>;
            default:
                return <span className="text-2xl">🔔</span>;
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                aria-label="Notifications"
            >
                <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {count > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-sm">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 origin-top-right rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-950/20">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Notifications</h3>
                            {count > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 uppercase tracking-widest"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[450px] overflow-y-auto">
                            {isLoading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center p-12">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="mb-4 text-5xl opacity-20">🔔</div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">All Caught Up!</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                        No new notifications at this time.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`group relative border-b border-zinc-100 dark:border-zinc-800 p-4 transition-all hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 ${!notification.read_at ? "bg-purple-50/30 dark:bg-purple-900/5" : ""
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon/Avatar */}
                                            <div className="flex-shrink-0 pt-0.5">
                                                {getNotificationIcon(notification)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-sm leading-tight">
                                                        {notification.actor ? (
                                                            <Link href={`/app/profile/${notification.actor.id}`} className="font-bold text-zinc-950 dark:text-white hover:underline">
                                                                {notification.actor.display_name}
                                                            </Link>
                                                        ) : (
                                                            <span className="font-bold text-zinc-950 dark:text-white">{notification.title}</span>
                                                        )}
                                                        <span className="ml-1 text-zinc-600 dark:text-zinc-400">
                                                            {notification.type === 'network_request' ? "would like to add you to their network" : notification.message}
                                                        </span>
                                                    </p>
                                                    {!notification.read_at && (
                                                        <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 ml-2 mt-1.5" />
                                                    )}
                                                </div>

                                                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                                                    {formatTime(notification.created_at)}
                                                </p>

                                                {/* Action Buttons for Network Requests */}
                                                {notification.type === 'network_request' && notification.metadata?.request_id && (
                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleNetworkResponse(notification.id, notification.metadata!.request_id!, "accepted");
                                                            }}
                                                            className="flex-1 rounded-lg bg-purple-600 py-2 text-xs font-black text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500 active:scale-95"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleNetworkResponse(notification.id, notification.metadata!.request_id!, "declined");
                                                            }}
                                                            className="flex-1 rounded-lg bg-zinc-200 py-2 text-xs font-black text-zinc-700 transition-all hover:bg-zinc-300 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Normal Link */}
                                                {notification.link && notification.type !== 'network_request' && (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => {
                                                            if (!notification.read_at) markAsRead(notification.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="absolute inset-0 z-0"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-950/20">
                                <Link
                                    href="/app/profile/me"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center text-sm font-black text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 uppercase tracking-widest"
                                >
                                    View My Profile
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
