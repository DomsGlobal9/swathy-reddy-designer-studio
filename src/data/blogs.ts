import blogsData from './blogs.json';

export type BlogContentBlock =
  | { type: 'intro'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; title: string }
  | { type: 'list'; items: string[] }
  | { type: 'tips'; title: string; items: string[] }
  | { type: 'callout'; title: string; text: string };

export type BlogFAQ = {
  question: string;
  answer: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category: 'Custom & Couture' | 'Wedding & Bridal' | 'Styling Guides' | 'Fabrics & Craft' | 'NRI & Global Shipping';
  readTime: string;
  publishedAt: string;
  image: string;
  excerpt: string;
  content: BlogContentBlock[];
  faqs?: BlogFAQ[];
};

export const blogCategories = [
  'All Stories',
  'Custom & Couture',
  'Wedding & Bridal',
  'Styling Guides',
  'Fabrics & Craft',
  'NRI & Global Shipping'
] as const;

export const blogs: BlogPost[] = blogsData as BlogPost[];
