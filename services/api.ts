import {
  ServicesStatusResponse,
  FeedResponse,
  AnalyticsStatsResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos em ms

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache em memória
const cache = new Map<string, CacheEntry<any>>();

// Controle de requisições em andamento para evitar chamadas duplicadas
const inflightRequests = new Map<string, Promise<any>>();

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  const isStale = now - entry.timestamp > CACHE_DURATION;

  if (isStale) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const invalidateCache = (key: string): void => {
  cache.delete(key);
};



export const fetchServiceStatus = async (): Promise<ServicesStatusResponse> => {
  const cacheKey = "service-status";

  const cached = getCachedData<ServicesStatusResponse>(cacheKey);
  if (cached) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/services/status`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Falha ao carregar status dos serviços`);
      }
      const data = await res.json();
      setCachedData(cacheKey, data);
      return data;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, request);
  return request;
};

export const fetchFeed = async (
  limit: number = 10,
  after?: string,
): Promise<FeedResponse> => {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (after) params.append("after", after);

  const cacheKey = `feed-${limit}-${after || "start"}`;

  const cached = getCachedData<FeedResponse>(cacheKey);
  if (cached) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/feed?${params}`);
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Falha ao carregar feed" }));
        throw new Error(`HTTP ${res.status}: ${error.error || "Falha ao carregar feed"}`);
      }
      const data = await res.json();
      setCachedData(cacheKey, data);
      return data;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, request);
  return request;
};



export const fetchAnalyticsStats = async (
  skipCache = false,
): Promise<AnalyticsStatsResponse> => {
  const cacheKey = "analytics-stats";

  if (skipCache) {
    invalidateCache(cacheKey);
  }

  const cached = getCachedData<AnalyticsStatsResponse>(cacheKey);
  if (cached) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      let url = `${API_BASE_URL}/analytics/stats`;
      if (skipCache) {
        url += `?_t=${Date.now()}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Falha ao carregar analytics" }));
        throw new Error(`HTTP ${res.status}: ${error.error || "Falha ao carregar analytics"}`);
      }
      const data = await res.json();
      setCachedData(cacheKey, data);
      return data;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, request);
  return request;
};

const HISTORY_STORAGE_KEY = "technews-analytics-history";

export const saveStatsToHistory = (stats: AnalyticsStatsResponse): void => {
  const today = new Date().toISOString().split("T")[0];
  const history: Record<string, AnalyticsStatsResponse> = JSON.parse(
    localStorage.getItem(HISTORY_STORAGE_KEY) || "{}",
  );
  history[today] = stats;

  const sortedDates = Object.keys(history).sort().reverse();
  const trimmedHistory: Record<string, AnalyticsStatsResponse> = {};
  sortedDates.slice(0, 30).forEach((date) => {
    trimmedHistory[date] = history[date];
  });

  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
};

export const getStatsHistory = (
  days: number = 30,
): Array<{ date: string; stats: AnalyticsStatsResponse }> => {
  const history: Record<string, AnalyticsStatsResponse> = JSON.parse(
    localStorage.getItem(HISTORY_STORAGE_KEY) || "{}",
  );

  return Object.entries(history)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, days)
    .map(([date, stats]) => ({ date, stats }));
};
