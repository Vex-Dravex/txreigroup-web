"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Message = {
    id: string;
    sender_id: string;
    content: string | null;
    message_type: "text" | "image" | "video";
    media_url: string | null;
    created_at: string;
    reactions?: { emoji: string; user_id: string }[];
    sender?: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    };
};

type MessengerPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    recipientName: string;
    recipientAvatar: string | null;
    currentUserId: string;
    conversationId?: string | null;
};

const EMOJI_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

export default function MessengerPopup({
    isOpen,
    onClose,
    recipientId,
    recipientName,
    recipientAvatar,
    currentUserId,
    conversationId: initialConversationId,
}: MessengerPopupProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load messages when conversation opens
    useEffect(() => {
        if (isOpen && recipientId) {
            loadOrCreateConversation();
        }
    }, [isOpen, recipientId]);

    const loadOrCreateConversation = async () => {
        setIsLoading(true);
        try {
            console.log("Loading conversation for recipient:", recipientId);
            const response = await fetch("/api/messages/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientId }),
            });

            console.log("Conversation response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Conversation data:", data);
                setConversationId(data.conversationId);
                setMessages(data.messages || []);
            } else {
                const errorText = await response.text();
                console.error("Failed to load conversation:", response.status, errorText);
                alert(`Failed to load conversation: ${errorText}`);
            }
        } catch (error) {
            console.error("Error loading conversation:", error);
            alert("Error loading conversation. Check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Attempting to send message:", newMessage);
        console.log("Conversation ID:", conversationId);

        if (!newMessage.trim()) {
            console.log("Message is empty, not sending");
            return;
        }

        if (!conversationId) {
            console.error("No conversation ID available");
            alert("Conversation not ready. Please wait a moment and try again.");
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
            console.log("Sending message to API...");
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId,
                    content: messageToSend,
                    messageType: "text",
                }),
            });

            console.log("Send message response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Message sent successfully:", data);
                setMessages((prev) =>
                    prev.map((msg) => (msg.id === tempMessage.id ? data.message : msg))
                );
            } else {
                const errorText = await response.text();
                console.error("Failed to send message:", response.status, errorText);
                alert(`Failed to send message: ${errorText}`);
                // Remove temp message on error
                setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Error sending message. Check console for details.");
            // Remove temp message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !conversationId) return;

        const messageType = file.type.startsWith("image/") ? "image" : "video";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", conversationId);
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

            // Optimistically update UI
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-4 right-4 z-50 w-[360px] h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-zinc-300/50 dark:shadow-zinc-950/50 border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-600 to-blue-600">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                {recipientAvatar ? (
                                    <img
                                        src={recipientAvatar}
                                        alt={recipientName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                        {recipientName[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{recipientName}</h3>
                            <p className="text-xs text-white/80">Active now</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Start a conversation with {recipientName}
                            </p>
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
                                            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                                                {recipientAvatar ? (
                                                    <img src={recipientAvatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                                        {recipientName[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="relative">
                                            {message.message_type === "text" && message.content && (
                                                <div
                                                    className={`px-4 py-2 rounded-2xl transition-all hover:scale-[1.02] ${isOwn
                                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                                        : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                                                </div>
                                            )}
                                            {message.message_type === "image" && message.media_url && (
                                                <div className="rounded-2xl overflow-hidden max-w-xs">
                                                    <img src={message.media_url} alt="Shared image" className="w-full" />
                                                </div>
                                            )}
                                            {message.message_type === "video" && message.media_url && (
                                                <div className="rounded-2xl overflow-hidden max-w-xs">
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
                <form onSubmit={sendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
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
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-900/30 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 shadow-inner">
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
                            className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${newMessage.trim()
                                ? 'hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50'
                                : ''
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}
