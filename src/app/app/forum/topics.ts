export type ForumTopic = {
  slug: string;
  label: string;
  description?: string;
};

export const FORUM_TOPICS: ForumTopic[] = [
  {
    slug: "creative-finance",
    label: "Creative Finance",
    description: "Structuring deals with notes, wraps, and unique funding stacks",
  },
  {
    slug: "subto",
    label: "Subto Strategies",
    description: "Subject-to acquisitions, paperwork, and lender conversations",
  },
  {
    slug: "wholesale",
    label: "Wholesale Real Estate",
    description: "Finding, locking up, and assigning wholesale opportunities",
  },
  {
    slug: "private-lending",
    label: "Private Lending",
    description: "Raising and deploying private capital safely",
  },
  {
    slug: "deal-structuring",
    label: "Deal Structuring",
    description: "JV splits, equity, and creative ways to make offers work",
  },
];
