import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import NewsCard from "./components/NewsCard";
import SkeletonCard from "./components/SkeletonCard";
import Modal from "./components/Modal";
import ErrorState from "./components/ErrorState";
import SearchBar from "./components/SearchBar";
import { ViewMode, NewsItem } from "./types";
import { fetchSmartMix, fetchTabNews, fetchHackerNews } from "./services/api";

export default function App() {
  const [view, setView] = useState<ViewMode>("mix");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      // Only show skeleton on initial load (when there are no items yet)
      if (items.length === 0) {
        setLoading(true);
      }
      setError(null);

      let data: NewsItem[] = [];

      try {
        switch (view) {
          case "mix":
            data = await fetchSmartMix();
            break;
          case "tabnews":
            data = await fetchTabNews();
            break;
          case "hackernews":
            data = await fetchHackerNews();
            break;
        }

        if (!ignore) {
          setItems(data);
        }
      } catch (err) {
        if (!ignore) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Não foi possível conectar ao servidor.";
          setError(errorMessage);
          setItems([]); // Clear items on error
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [view, refreshTrigger]);

  const handleRefresh = () => {
    // Just trigger effect again. The API service handles cache expiration internally.
    setRefreshTrigger((prev) => prev + 1);
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        (item.body && item.body.toLowerCase().includes(query)),
    );
  }, [items, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Header Navigation - Refresh button removed */}
      <Header
        currentView={view}
        onViewChange={(v) => {
          setView(v);
          setSearchQuery(""); // Reset search when changing tabs
        }}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Search Bar - Only show when not loading and has data */}
        {!loading && !error && items.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por título, autor ou conteúdo..."
          />
        )}

        {loading ? (
          // Skeleton Loading State
          <div className="space-y-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          // Error State
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : // Data State
        filteredItems.length > 0 ? (
          <div className="space-y-0">
            {filteredItems.map((item) => (
              <NewsCard
                key={`${item.source}-${item.id}`}
                item={item}
                onClick={setSelectedItem}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          // No results from search
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="text-lg">
              Nenhum resultado encontrado para "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-400 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="text-lg">Nenhuma notícia encontrada.</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-blue-400 hover:underline"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </main>

      {/* TabNews Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
