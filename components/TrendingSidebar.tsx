import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Flame,
  ChevronDown,
  RefreshCw,
  Star,
} from "lucide-react";
import { TrendingResponse, TrendingPeriod } from "../types";
import { fetchTrending } from "../services/api";

interface TrendingSidebarProps {
  onKeywordClick?: (keyword: string) => void;
}

const sourceColors: Record<string, string> = {
  HackerNews: "bg-orange-500/20 text-orange-300",
  TabNews: "bg-blue-500/20 text-blue-300",
  DevTo: "bg-purple-500/20 text-purple-300",
  Lobsters: "bg-rose-500/20 text-rose-300",
};

const sourceOrder = ["HackerNews", "TabNews", "DevTo", "Lobsters"];

function sortSources(sources: string[]): string[] {
  return [...sources].sort((a, b) => {
    const aIndex = sourceOrder.indexOf(a);
    const bIndex = sourceOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

function SkeletonLoader() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-3/4" />
          <div className="h-3 bg-slate-700/50 rounded w-1/2" />
          <div className="flex gap-1">
            <div className="h-4 bg-slate-700/50 rounded w-12" />
            <div className="h-4 bg-slate-700/50 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrendingSidebar({ onKeywordClick }: TrendingSidebarProps) {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [period, setPeriod] = useState<TrendingPeriod>("7d");
  const [refreshing, setRefreshing] = useState(false);

  const loadTrending = async (showRefresh = false, skipCache = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await fetchTrending(period, skipCache);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrending(false, true);
    const interval = setInterval(() => loadTrending(true, true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [period]);

  const trending = data?.trending || [];
  const maxCount = Math.max(...trending.map((t) => t.count), 1);

  return (
    <div className="sticky top-20 bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden">
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-orange-400" />
          <h3 className="font-semibold text-slate-100">Trending</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTrending(true, true)}
            disabled={refreshing}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? "" : "-rotate-90"}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="px-4 py-2 border-b border-slate-800/50 flex gap-1">
            {(["24h", "7d", "30d"] as TrendingPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  period === p
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-slate-800/30 text-slate-400 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {loading && !data ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <button
                onClick={() => loadTrending()}
                className="text-xs text-blue-400 hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : trending.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Nenhum trending disponivel
            </div>
          ) : (
            <div className="p-3 space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
              {trending.slice(0, 10).map((topic) => {
                const sizeMultiplier = (topic.count / maxCount) * 0.4 + 0.85;
                const isHot = topic.count > maxCount * 0.7;

                return (
                  <div
                    key={topic.keyword}
                    onClick={() => onKeywordClick?.(topic.keyword)}
                    className="group p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {isHot && (
                          <Flame size={12} className="text-orange-500" />
                        )}
                        <span
                          className="font-medium text-slate-100 group-hover:text-white transition-colors"
                          style={{ fontSize: `${sizeMultiplier}rem` }}
                        >
                          {topic.keyword}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{topic.count}x</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                      <span>Score: {topic.avgScore}</span>
                      <div className="flex">
                        {[...Array(Math.ceil(topic.avgScore / 25))].map((_, i) => (
                          <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {sortSources(topic.sources).slice(0, 3).map((source) => (
                        <span
                          key={`${topic.keyword}-${source}`}
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            sourceColors[source] || "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {source}
                        </span>
                      ))}
                    </div>

                    {topic.topArticles?.[0] && (
                      <div className="mt-2 pt-2 border-t border-slate-700/30 text-xs text-slate-500 group-hover:text-slate-400 transition-colors line-clamp-2">
                        {topic.topArticles[0].title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
