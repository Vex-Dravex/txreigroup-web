"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Conversation = {
    id: string;
    otherUser: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    };
    lastMessage: {
        content: string | null;
        message_type: string;
        created_at: string;
        sender_id: string;
    } | null;
    hasUnread: boolean;
    updatedAt: string;
};

type Message = {
    id: string;
    sender_id: string;
    content: string | null;
    message_type: "text" | "image" | "video";
    media_url: string | null;
    created_at: string;
    reactions?: { emoji: string; user_id: string }[];
};

const EMOJI_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

export default function MessagesContent({
    conversations,
    currentUserId,
}: {
    conversations: Conversation[];
    currentUserId: string;
}) {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedConv = conversations.find(c => c.id === selectedConversation);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);
            markAsRead(selectedConversation);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadMessages = async (conversationId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/messages/${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await fetch(`/api/messages/${conversationId}/read`, {
                method: "POST",
            });
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("MessagesContent - Sending message:", newMessage, "Conversation:", selectedConversation);
        if (!newMessage.trim() || !selectedConversation) {
            console.log("Message empty or no conversation selected");
            return;
        }

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: currentUserId,
            content: newMessage,
            message_type: "text",
            media_url: null,
            created_at: new Date().toISOString(),
            reactions: [],
        };

        setMessages((prev) => [...prev, tempMessage]);
        const messageToSend = newMessage;
        setNewMessage("");

        try {
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: selectedConversation,
                    content: messageToSend,
                    messageType: "text",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) =>
                    prev.map((msg) => (msg.id === tempMessage.id ? data.message : msg))
                );
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        const messageType = file.type.startsWith("image/") ? "image" : "video";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", selectedConversation);
        formData.append("messageType", messageType);

        try {
            const response = await fetch("/api/messages/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, data.message]);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const addReaction = async (messageId: string, emoji: string) => {
        try {
            await fetch("/api/messages/react", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, emoji }),
            });

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? {
                            ...msg,
                            reactions: [
                                ...(msg.reactions || []),
                                { emoji, user_id: currentUserId },
                            ],
                        }
                        : msg
                )
            );
            setShowEmojiPicker(null);
        } catch (error) {
            console.error("Error adding reaction:", error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
            {/* Conversations List */}
            <div className="col-span-12 md:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-900">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">No messages yet</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Start a conversation by visiting a user's profile and clicking "Message"
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv.id)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800 ${selectedConversation === conv.id ? "bg-purple-50 dark:bg-purple-900/10 border-l-4 border-l-purple-600" : ""
                                    }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                        {conv.otherUser.avatar_url ? (
                                            <img
                                                src={conv.otherUser.avatar_url}
                                                alt={conv.otherUser.display_name || "User"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                                                {(conv.otherUser.display_name || "U")[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {conv.hasUnread && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-600 rounded-full border-2 border-white dark:border-zinc-900" />
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-sm font-bold truncate ${conv.hasUnread ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}>
                                            {conv.otherUser.display_name || "User"}
                                        </h3>
                                        {conv.lastMessage && (
                                            <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">
                                                {formatTime(conv.lastMessage.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    {conv.lastMessage && (
                                        <p className={`text-xs truncate ${conv.hasUnread ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}>
                                            {conv.lastMessage.message_type === "text"
                                                ? conv.lastMessage.content
                                                : conv.lastMessage.message_type === "image"
                                                    ? "📷 Photo"
                                                    : "🎥 Video"}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Message Thread */}
            <div className="col-span-12 md:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col">
                {selectedConv ? (
                    <>
                        {/* Thread Header */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-600 to-blue-600">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden">
                                    {selectedConv.otherUser.avatar_url ? (
                                        <img
                                            src={selectedConv.otherUser.avatar_url}
                                            alt={selectedConv.otherUser.display_name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                            {(selectedConv.otherUser.display_name || "U")[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Link
                                        href={`/app/profile/${selectedConv.otherUser.id}`}
                                        className="font-bold text-white hover:underline"
                                    >
                                        {selectedConv.otherUser.display_name || "User"}
                                    </Link>
                                    <p className="text-xs text-white/80">Active now</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isOwn = message.sender_id === currentUserId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                                        >
                                            <div className={`flex gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                                                {!isOwn && (
                                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                                                        {selectedConv.otherUser.avatar_url ? (
                                                            <img src={selectedConv.otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                                                {(selectedConv.otherUser.display_name || "U")[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="relative">
                                                    {message.message_type === "text" && message.content && (
                                                        <div
                                                            className={`px-4 py-2 rounded-2xl transition-all hover:scale-[1.02] ${isOwn
                                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                                : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                                                                }`}
                                                        >
                                                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                                        </div>
                                                    )}
                                                    {message.message_type === "image" && message.media_url && (
                                                        <div className="rounded-2xl overflow-hidden max-w-sm">
                                                            <img src={message.media_url} alt="Shared image" className="w-full" />
                                                        </div>
                                                    )}
                                                    {message.message_type === "video" && message.media_url && (
                                                        <div className="rounded-2xl overflow-hidden max-w-sm">
                                                            <video src={message.media_url} controls className="w-full" />
                                                        </div>
                                                    )}

                                                    {/* Reactions */}
                                                    {message.reactions && message.reactions.length > 0 && (
                                                        <div className="absolute -bottom-2 right-0 flex gap-1 bg-white dark:bg-zinc-800 rounded-full px-2 py-0.5 shadow-sm border border-zinc-200 dark:border-zinc-700">
                                                            {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji) => (
                                                                <span key={emoji} className="text-xs">{emoji}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Emoji Picker Button */}
                                                    <button
                                                        onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 bg-white dark:bg-zinc-800 rounded-full p-1 shadow-md border border-zinc-200 dark:border-zinc-700"
                                                    >
                                                        <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>

                                                    {/* Emoji Picker */}
                                                    {showEmojiPicker === message.id && (
                                                        <div className="absolute top-full mt-1 right-0 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 p-2 flex gap-1 z-10">
                                                            {EMOJI_REACTIONS.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => addReaction(message.id, emoji)}
                                                                    className="hover:scale-150 transition-all duration-200 text-lg hover:drop-shadow-lg"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
                            <div className="flex items-end gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*,video/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-900/30 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-3 shadow-inner">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${newMessage.trim()
                                        ? 'hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50'
                                        : ''
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Select a conversation</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Choose a conversation from the list to start messaging
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
