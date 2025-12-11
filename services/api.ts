import { NewsItem, Comment, ServicesStatusResponse } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
console.log(API_BASE_URL);
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

export const fetchTabNews = async (): Promise<NewsItem[]> => {
  const cacheKey = "tabnews";

  // Verificar cache
  const cached = getCachedData<NewsItem[]>(cacheKey);
  if (cached) return cached;

  // Verificar se já tem uma requisição em andamento
  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  // Criar nova requisição
  const request = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/news/tabnews`);
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Falha ao carregar TabNews" }));
        throw new Error(error.error || "Falha ao carregar TabNews");
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

export const fetchHackerNews = async (): Promise<NewsItem[]> => {
  const cacheKey = "hackernews";

  const cached = getCachedData<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/news/hackernews`);
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Falha ao carregar Hacker News" }));
        throw new Error(error.error || "Falha ao carregar Hacker News");
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

export const fetchSmartMix = async (): Promise<NewsItem[]> => {
  const cacheKey = "mix";

  const cached = getCachedData<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/news/mix`);
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Falha ao carregar notícias" }));
        throw new Error(error.error || "Falha ao carregar notícias");
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

export const fetchTabNewsComments = async (
  username: string,
  slug: string
): Promise<Comment[]> => {
  const cacheKey = `comments-${username}-${slug}`;

  const cached = getCachedData<Comment[]>(cacheKey);
  if (cached) return cached;

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${username}/${slug}`);
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Falha ao carregar comentários" }));
        throw new Error(error.error || "Falha ao carregar comentários");
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
        throw new Error("Falha ao carregar status dos serviços");
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
