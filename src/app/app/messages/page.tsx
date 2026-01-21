import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import MessagesContent from "./MessagesContent";

export const dynamic = 'force-dynamic';

type Profile = {
    id: string;
    role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
    display_name: string | null;
    avatar_url: string | null;
};

export default async function MessagesPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name, avatar_url")
        .eq("id", authData.user.id)
        .single();

    const profileData = profile as Profile | null;
    const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
    const userRole = getPrimaryRole(roles, profileData?.role || "investor");

    // Fetch all conversations for the user
    const { data: conversationParticipants } = await supabase
        .from("conversation_participants")
        .select(`
      conversation_id,
      last_read_at,
      conversations:conversation_id (
        id,
        updated_at
      )
    `)
        .eq("user_id", authData.user.id)
        .order("last_read_at", { ascending: false });

    const conversationIds = conversationParticipants?.map(cp => cp.conversation_id) || [];

    // Fetch other participants for each conversation
    const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select(`
      conversation_id,
      user_id,
      profiles:user_id (
        id,
        display_name,
        avatar_url
      )
    `)
        .in("conversation_id", conversationIds.length > 0 ? conversationIds : ['00000000-0000-0000-0000-000000000000']);

    // Fetch last message for each conversation
    const { data: lastMessages } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds.length > 0 ? conversationIds : ['00000000-0000-0000-0000-000000000000'])
        .order("created_at", { ascending: false });

    // Group last messages by conversation
    const lastMessageByConversation = lastMessages?.reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) {
            acc[msg.conversation_id] = msg;
        }
        return acc;
    }, {} as Record<string, any>) || {};

    // Build conversations list
    const conversations = conversationParticipants?.map(cp => {
        const otherParticipant = allParticipants?.find(
            p => p.conversation_id === cp.conversation_id && p.user_id !== authData.user.id
        );

        const rawProfiles = otherParticipant?.profiles;
        const otherUser = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;

        const conversationData = Array.isArray(cp.conversations) ? cp.conversations[0] : cp.conversations;
        const lastMessage = lastMessageByConversation[cp.conversation_id];
        const hasUnread = lastMessage && new Date(lastMessage.created_at) > new Date(cp.last_read_at);

        if (!otherUser) return null;

        return {
            id: cp.conversation_id,
            otherUser: {
                id: otherUser.id,
                display_name: otherUser.display_name,
                avatar_url: otherUser.avatar_url,
            },
            lastMessage: lastMessage ? {
                content: lastMessage.content,
                message_type: lastMessage.message_type,
                created_at: lastMessage.created_at,
                sender_id: lastMessage.sender_id,
            } : null,
            hasUnread: !!hasUnread,
            updatedAt: conversationData?.updated_at || new Date().toISOString(),
        };
    }).filter((c): c is NonNullable<typeof c> => c !== null) || [];

    // Sort by most recent activity
    conversations.sort((a, b) =>
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <AppHeader
                userRole={userRole}
                currentPage="messages"
                avatarUrl={profileData?.avatar_url || null}
                displayName={profileData?.display_name || null}
                email={authData.user.email}
            />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 mb-2">Messages</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Stay connected with your network</p>
                </div>

                <MessagesContent
                    conversations={conversations}
                    currentUserId={authData.user.id}
                />
            </div>
        </div>
    );
}
