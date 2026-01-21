"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read_at: string | null;
    created_at: string;
    actor_id: string | null;
};

type NotificationBellProps = {
    initialNotifications?: Notification[];
    unreadCount?: number;
};

export default function NotificationBell({ initialNotifications = [], unreadCount = 0 }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [count, setCount] = useState(unreadCount);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "deal_approved":
            case "deal_rejected":
                return "📋";
            case "new_listing":
                return "🏠";
            case "profile_review":
                return "⭐";
            case "forum_post_like":
                return "❤️";
            case "forum_comment":
            case "forum_reply":
                return "💬";
            case "message":
                return "✉️";
            default:
                return "🔔";
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
                    <span className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
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
                        className="absolute right-0 mt-2 w-96 origin-top-right rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Notifications</h3>
                            {count > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="mb-3 text-4xl">🔔</div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No notifications</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        You're all caught up!
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <Link
                                        key={notification.id}
                                        href={notification.link || "#"}
                                        onClick={() => {
                                            if (!notification.read_at) {
                                                markAsRead(notification.id);
                                            }
                                            setIsOpen(false);
                                        }}
                                        className={`block border-b border-zinc-100 dark:border-zinc-800 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${!notification.read_at ? "bg-purple-50/50 dark:bg-purple-900/10" : ""
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                                    {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
                                <Link
                                    href="/app/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
