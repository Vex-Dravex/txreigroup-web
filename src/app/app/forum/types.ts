export type ForumPost = {
    id: string;
    author_id: string;
    title: string;
    content: string;
    image_urls: string[];
    topic: string | null;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    profiles: {
        display_name: string | null;
        avatar_url: string | null;
    } | null;
    forum_post_tags: {
        tag: string;
    }[];
    user_vote: {
        vote_type: string;
    } | null;
    is_saved?: boolean;
};
