
export interface ForumDemoPost {
    id: string;
    author_id: string;
    title: string;
    content: string;
    topic: string;
    image_urls: string[];
    upvotes: number;
    downvotes: number;
    comment_count: number;
    is_pinned: boolean;
    created_at: string;
    author: {
        display_name: string;
        avatar_url: string | null;
    };
    tags: string[];
}

export const forumDemoPosts: ForumDemoPost[] = [
    {
        id: "demo-1",
        author_id: "author-1",
        title: "How I closed my first Subject-To deal in Houston with $500 down",
        content: "Creative finance is the ultimate game changer. I found a distressed seller who was behind on payments. Instead of a traditional purchase, I took over their existing mortgage payments. The seller was relieved, and I got a property with a 3.5% interest rate. Here's a breakdown of the numbers...",
        topic: "creative-finance",
        image_urls: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"],
        upvotes: 42,
        downvotes: 2,
        comment_count: 15,
        is_pinned: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        author: {
            display_name: "Pace J. Clone",
            avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
        },
        tags: ["subject-to", "houston", "creative-finance"]
    },
    {
        id: "demo-2",
        author_id: "author-2",
        title: "The Seller Finance Script that actually works for Wholesalers",
        content: "Most wholesalers fail at creative finance because they don't know how to explain it to sellers. Stop talking about 'interest rates' and start talking about 'monthly cash flow'. Here is the exact script I use to pivot from a cash offer to a seller finance offer when the equity is thin...",
        topic: "wholesaling",
        image_urls: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop"],
        upvotes: 28,
        downvotes: 1,
        comment_count: 8,
        is_pinned: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        author: {
            display_name: "Sarah Strategy",
            avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
        },
        tags: ["seller-finance", "scripts", "wholesaling"]
    },
    {
        id: "demo-3",
        author_id: "author-3",
        title: "Best Houston Neighborhoods for Mid-Term Rentals in 2026",
        content: "With the medical center expansion, we're seeing a massive surge in demand for MTRs in areas like Riverside Terrace and Third Ward. If you're looking for high cash flow with creative finance acquisitions, these are the sub-markets to watch. I'm currently running 4 units here and the average ADR is $145.",
        topic: "investing",
        image_urls: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop"],
        upvotes: 19,
        downvotes: 0,
        comment_count: 12,
        is_pinned: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        author: {
            display_name: "Mike Market",
            avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
        },
        tags: ["houston", "mtr", "investing"]
    }
];

export const forumDemoComments = [
    {
        id: "comment-1",
        post_id: "demo-1",
        author_id: "author-2",
        content: "This is gold! I've been struggling with the paperwork for Sub-To. Do you use a specific T-chart for the sellers?",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        author: {
            display_name: "Sarah Strategy",
            avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
        }
    },
    {
        id: "comment-2",
        post_id: "demo-1",
        author_id: "author-1",
        content: "Yes, I'll upload the template I use later today. The key is transparency with the seller about the 'Due on Sale' clause.",
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        author: {
            display_name: "Pace J. Clone",
            avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
        }
    }
];
