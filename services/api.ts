import { NewsItem, Source, TabNewsItem, HackerNewsItem, Comment } from '../types';

const TABNEWS_API = 'https://www.tabnews.com.br/api/v1/contents';
// Official Firebase API endpoints
const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, CacheEntry<any>> = {};

const getFromCache = <T>(key: string): T | null => {
  const entry = cache[key];
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
  if (isExpired) {
    delete cache[key];
    return null;
  }
  
  return entry.data;
};

const setCache = <T>(key: string, data: T) => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

// --- RANKING ALGORITHM ---
// Updated Formula: (Points + (Comments * 0.5) + 1) / (T + 2)^G
// Changes:
// 1. Included Comment Count to measure engagement.
// 2. Reduced Gravity from 1.8 to 1.4 so time degrades score slower.
const calculateRank = (item: NewsItem): number => {
  const points = item.score || 0;
  const comments = item.commentCount || 0;
  
  const date = new Date(item.publishedAt);
  const now = new Date();
  
  // Calculate age in hours
  const ageInHours = Math.max(0, (now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const gravity = 1.4; 

  // Weighted Score:
  // Points (Likes/Coins) count as 1.0
  // Comments count as 0.5 (Engagement is important, but less than approval)
  const weightedScore = points + (comments * 0.5);

  // Add 1 to numerator to avoid zero/division issues
  return (weightedScore + 1) / Math.pow(ageInHours + 2, gravity);
};

export const fetchTabNews = async (): Promise<NewsItem[]> => {
  const cached = getFromCache<NewsItem[]>('tabnews');
  if (cached) return cached;

  const res = await fetch(`${TABNEWS_API}?strategy=relevant`);
  if (!res.ok) throw new Error('Falha ao carregar TabNews');
  const data: TabNewsItem[] = await res.json();
  
  const mapped = data.map(item => ({
    id: item.id,
    title: item.title,
    author: item.owner_username,
    score: item.tabcoins,
    publishedAt: item.published_at,
    source: Source.TabNews,
    slug: item.slug,
    owner_username: item.owner_username,
    body: item.body,
    sourceUrl: item.source_url,
    commentCount: item.children_deep_count
  }));

  setCache('tabnews', mapped);
  return mapped;
};

export const fetchHackerNews = async (): Promise<NewsItem[]> => {
  const cached = getFromCache<NewsItem[]>('hackernews');
  if (cached) return cached;

  // 1. Get Top Stories IDs
  const idsRes = await fetch(`${HN_BASE_URL}/topstories.json`);
  if (!idsRes.ok) throw new Error('Falha ao carregar IDs do Hacker News');
  const ids: number[] = await idsRes.json();

  // 2. Fetch details for top 30 items in parallel
  const topIds = ids.slice(0, 30); // Fetch a bit more to filter out bad data
  
  const itemPromises = topIds.map(id => 
    fetch(`${HN_BASE_URL}/item/${id}.json`).then(res => res.json())
  );

  const itemsRaw: HackerNewsItem[] = await Promise.all(itemPromises);

  // 3. Map and Filter
  const mapped = itemsRaw
    .filter(item => item && item.title && !item.title.startsWith('[dead]') && !item.title.startsWith('[flagged]'))
    .map((item) => ({
      id: String(item.id),
      title: item.title,
      author: item.by,
      score: item.score,
      publishedAt: new Date(item.time * 1000).toISOString(), // Convert Unix seconds to ISO
      source: Source.HackerNews,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      commentCount: item.descendants || 0
    }));

  setCache('hackernews', mapped);
  return mapped;
};

export const fetchSmartMix = async (): Promise<NewsItem[]> => {
  const [tabNewsResults, hnResults] = await Promise.allSettled([
    fetchTabNews(),
    fetchHackerNews()
  ]);

  const tabNews = tabNewsResults.status === 'fulfilled' ? tabNewsResults.value : [];
  const hn = hnResults.status === 'fulfilled' ? hnResults.value : [];

  if (tabNewsResults.status === 'rejected' && hnResults.status === 'rejected') {
    throw new Error('Não foi possível carregar nenhuma fonte de notícias.');
  }

  // Apply "Gravity Sort" to both lists individually
  const sortedTab = [...tabNews].sort((a, b) => calculateRank(b) - calculateRank(a));
  const sortedHn = [...hn].sort((a, b) => calculateRank(b) - calculateRank(a));

  // Take top 20 from each *after* our custom freshness sorting
  const topTab = sortedTab.slice(0, 20);
  const topHn = sortedHn.slice(0, 20);

  const mixed: NewsItem[] = [];
  const maxLength = Math.max(topTab.length, topHn.length);

  // Interleave the results to ensure diversity
  for (let i = 0; i < maxLength; i++) {
    if (i < topTab.length) mixed.push(topTab[i]);
    if (i < topHn.length) mixed.push(topHn[i]);
  }

  return mixed;
};

// Fetch comments for a specific TabNews post
export const fetchTabNewsComments = async (username: string, slug: string): Promise<Comment[]> => {
  const res = await fetch(`${TABNEWS_API}/${username}/${slug}/children`);
  if (!res.ok) throw new Error('Falha ao carregar comentários');
  return await res.json();
};