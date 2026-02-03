export type SampleVideo = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  type: "video" | "live";
  badge?: string;
  href: string;
  videoUrl?: string | null;
  thumbnailUrl?: string;
};

export const topicOptions = [
  "Wholesale Real Estate",
  "Investing Basics",
  "Gator Strategy",
  "Deal Funding",
  "Lead Generation",
  "Disposition",
  "Contracts",
  "Market Analysis",
  "Systems & Ops",
  "Investor Relations",
  "Creative Finance",
];

export const sampleVideos: SampleVideo[] = [
  {
    id: "sample-1",
    title: "Wholesale Foundations: Start Your First Deal",
    description: "A no-fluff walk through sourcing, contracting, and closing.",
    duration: "38 min",
    level: "Beginner",
    topics: ["Wholesale Real Estate", "Contracts", "Lead Generation"],
    type: "video",
    href: "/app/courses/videos/sample-1",
    thumbnailUrl: "/images/education/wholesale.png",
  },
  {
    id: "sample-2",
    title: "Gator Playbook: Turning Trash Leads into Cash",
    description: "Scripts, KPIs, and follow-up rhythms for gator success.",
    duration: "52 min",
    level: "Intermediate",
    topics: ["Gator Strategy", "Lead Generation", "Systems & Ops"],
    type: "video",
    href: "/app/courses/videos/sample-2",
    thumbnailUrl: "/images/education/gator.png",
  },
  {
    id: "sample-3",
    title: "Investor Confidence: Pitching Deals with Clarity",
    description: "Structure your deal packet and communicate risk with confidence.",
    duration: "44 min",
    level: "Intermediate",
    topics: ["Investor Relations", "Market Analysis", "Disposition"],
    type: "video",
    href: "/app/courses/videos/sample-3",
    thumbnailUrl: "/images/education/pitch.png",
  },
  {
    id: "sample-4",
    title: "Deal Funding: Hard Money, Private Money, & Hybrid Plays",
    description: "Compare funding stacks and decide the right fit for each deal.",
    duration: "31 min",
    level: "Advanced",
    topics: ["Deal Funding", "Investing Basics", "Wholesale Real Estate"],
    type: "video",
    href: "/app/courses/videos/sample-4",
    thumbnailUrl: "/images/education/funding.png",
  },
  {
    id: "sample-5",
    title: "Disposition Masterclass: From Offer to Assignment",
    description: "Move contracts fast with a repeatable disposition pipeline.",
    duration: "57 min",
    level: "Advanced",
    topics: ["Disposition", "Wholesale Real Estate", "Investor Relations"],
    type: "video",
    href: "/app/courses/videos/sample-5",
    thumbnailUrl: "/images/education/disposition.png",
  },
  {
    id: "sample-6",
    title: "Systems for Scale: Build Your Weekly Operating Rhythm",
    description: "Create scorecards, cadence, and accountability in under an hour.",
    duration: "29 min",
    level: "Intermediate",
    topics: ["Systems & Ops", "Market Analysis", "Investing Basics"],
    type: "video",
    href: "/app/courses/videos/sample-6",
    thumbnailUrl: "/images/education/systems.png",
  },
  {
    id: "sample-7",
    title: "Live: Weekly Office Hours with the HTXREI Team",
    description: "Bring your deals, questions, and challenges to the live room.",
    duration: "60 min",
    level: "All Levels",
    topics: ["Wholesale Real Estate", "Gator Strategy", "Investor Relations"],
    type: "live",
    badge: "Live weekly",
    href: "/app/courses/videos/sample-7",
    thumbnailUrl: "/images/education/live.png",
  },
  {
    id: "sample-8",
    title: "Market Pulse: Spotting the Next Hot ZIPs in Houston",
    description: "Read the signals that indicate a rising wholesale opportunity.",
    duration: "35 min",
    level: "Intermediate",
    topics: ["Market Analysis", "Investing Basics", "Disposition"],
    type: "video",
    href: "/app/courses/videos/sample-8",
    thumbnailUrl: "/images/education/market.png",
  },
];

export const sampleVideoMap = sampleVideos.reduce<Record<string, SampleVideo>>(
  (acc, video) => {
    acc[video.id] = video;
    return acc;
  },
  {}
);
