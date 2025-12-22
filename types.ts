export enum Source {
  TabNews = "TabNews",
  HackerNews = "HackerNews",
  DevTo = "DevTo",
  Lobsters = "Lobsters",
}

export type NewsOrHighlight =
  | NewsItem
  | { type: "highlight"; data: Highlight }
  | { type: "skeleton-highlight" };

export interface NewsResponse {
  items: NewsItem[];
  nextCursor: string | null;
}

export interface Comment {
  id: string;
  parent_id: string | null;
  owner_username: string;
  body: string;
  created_at: string;
  children: Comment[];
  tabcoins?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  author: string;
  score: number;
  publishedAt: string; // ISO String
  source: Source;
  url?: string; // External URL for HN
  sourceUrl?: string | null; // External URL for TabNews (if link post)
  slug?: string; // TabNews slug
  owner_username?: string; // TabNews owner
  body?: string; // Markdown content
  commentCount?: number;
}

export type ViewMode = "mix" | "tabnews" | "hackernews";

// Service Status types
export enum ServiceStatusType {
  Operational = "operational",
  Degraded = "degraded",
  Down = "down",
}

export interface ServiceStatus {
  name: string;
  status: ServiceStatusType;
  lastChecked: string; // ISO timestamp
  url: string; // URL da página de status do serviço
}

export interface ServicesStatusResponse {
  services: ServiceStatus[];
  lastUpdate: string; // ISO timestamp
}

// API Response types (Simplified)
export interface TabNewsItem {
  id: string;
  owner_username: string;
  slug: string;
  title: string;
  body?: string;
  published_at: string;
  tabcoins: number;
  children_deep_count: number;
  source_url?: string | null;
}

// Official Firebase API Type
export interface HackerNewsItem {
  id: number;
  title: string;
  score: number;
  by: string;
  time: number; // Unix timestamp in seconds
  url?: string;
  descendants?: number; // comment count
  type: string;
}

// Security Advisory types
export enum SecuritySeverity {
  Critical = "critical",
  High = "high",
  Medium = "medium",
  Low = "low",
}

export interface SecurityAdvisory {
  id: string;
  title: string;
  package: string;
  severity: SecuritySeverity;
  vulnerableVersions: string;
  patchedVersions: string;
  description: string;
  publishedAt: string; // ISO timestamp
  cveId?: string;
  url: string;
}

// Platform Update types
export enum UpdateType {
  Feature = "feature",
  Breaking = "breaking",
  Deprecation = "deprecation",
  Pricing = "pricing",
  Performance = "performance",
}

export interface PlatformUpdate {
  id: string;
  platform: string; // "Vercel", "AWS", "GitHub", etc
  title: string;
  type: UpdateType;
  description: string;
  publishedAt: string; // ISO timestamp
  url: string;
  impact: "high" | "medium" | "low";
}

// EOL Tracker types
export interface EOLItem {
  id: string;
  name: string; // "Node.js 16", "React 17", etc
  version: string;
  eolDate: string; // ISO timestamp
  ltsUntil?: string; // ISO timestamp (if applicable)
  status: "active" | "maintenance" | "eol" | "upcoming-eol";
  daysUntilEOL: number;
  recommendedVersion: string;
  url: string;
}

// Highlight types (AI-curated social content)
export interface Highlight {
  id: string;
  title: string;
  summary: string; // AI resume in 1-2 lines
  source: Source;
  author: string;
  url: string;
  engagement: {
    likes?: number;
    comments: number;
    shares?: number;
    upvotes?: number;
  };
  publishedAt: string;
}

// Union type with discriminator 'type' for unified feed
export type FeedItem =
  | ({ type: "news" } & NewsItem)
  | ({ type: "highlight" } & Highlight);

// Feed source status (per-request health)
export interface SourceStatus {
  name: string;
  ok: boolean;
  itemCount: number;
  error?: string;
}

// Response from /api/feed endpoint
export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  sources?: SourceStatus[];
}
