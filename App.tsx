import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Header from "./components/Header";
import NewsCard from "./components/NewsCard";
import HighlightCard from "./components/HighlightCard";
import SkeletonCard from "./components/SkeletonCard";
import SkeletonHighlightCard from "./components/SkeletonHighlightCard";
import Modal from "./components/Modal";
import ErrorState from "./components/ErrorState";
import SearchBar from "./components/SearchBar";
import { ViewMode, NewsItem, Highlight, NewsOrHighlight } from "./types";
import {
  fetchSmartMix,
  fetchTabNews,
  fetchHackerNews,
  fetchHighlights,
} from "./services/api";

export default function App() {
  const [view, setView] = useState<ViewMode>("mix");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [mixNextCursor, setMixNextCursor] = useState<string | null>(null); // New state for mix pagination
  const [hasMoreMixItems, setHasMoreMixItems] = useState(false); // New state for mix pagination
  const [loadingMoreMixItems, setLoadingMoreMixItems] = useState(false); // New state for mix pagination
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const lastItemRef = useRef<HTMLDivElement>(null); // Ref for the last item in the main feed

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (items.length === 0) {
        setLoading(true);
      }
      setError(null);

      let fetchedNewsItems: NewsItem[] = [];
      let newMixNextCursor: string | null = null;
      let newHasMoreMix: boolean = false;

      try {
        switch (view) {
          case "mix":
            setLoadingMoreMixItems(true); // Indicate loading for mix items
            console.log("[Initial Load] Buscando primeira página do mix...");
            const mixResponse = await fetchSmartMix(10); // Fetch first page of mix
            console.log("[Initial Load] Primeira página carregada:", {
              itens: mixResponse.items.length,
              proximoCursor: mixResponse.nextCursor,
              temMais: !!mixResponse.nextCursor,
            });
            fetchedNewsItems = mixResponse.items;
            newMixNextCursor = mixResponse.nextCursor;
            newHasMoreMix = !!mixResponse.nextCursor;
            setLoadingMoreMixItems(false); // Done loading mix items
            break;
          case "tabnews":
            fetchedNewsItems = await fetchTabNews();
            setMixNextCursor(null);
            setHasMoreMixItems(false);
            break;
          case "hackernews":
            fetchedNewsItems = await fetchHackerNews();
            setMixNextCursor(null);
            setHasMoreMixItems(false);
            break;
        }

        if (!ignore) {
          setItems(Array.isArray(fetchedNewsItems) ? fetchedNewsItems : []);
          if (view === "mix") {
            setMixNextCursor(newMixNextCursor);
            setHasMoreMixItems(newHasMoreMix);
          } else {
            setMixNextCursor(null);
            setHasMoreMixItems(false);
          }
        }
      } catch (err) {
        if (!ignore) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Não foi possível conectar ao servidor.";
          setError(errorMessage);
          setItems([]); // Clear items on error
          setMixNextCursor(null);
          setHasMoreMixItems(false);
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

  // Fetch highlights asynchronously (all at once, no pagination for highlights anymore)
  useEffect(() => {
    if (view !== "mix") {
      setHighlights([]);
      setHighlightsLoading(false);
      return;
    }

    let ignore = false;

    const fetchHighlightsData = async () => {
      setHighlightsLoading(true);
      try {
        const response = await fetchHighlights(); // Fetch all highlights, no limit/after params
        if (!ignore) {
          setHighlights(response.items || []); // Use response.items
        }
      } catch (err) {
        if (!ignore) {
          setHighlights([]); // Set to empty on error
        }
      } finally {
        if (!ignore) {
          setHighlightsLoading(false);
        }
      }
    };

    fetchHighlightsData();

    return () => {
      ignore = true;
    };
  }, [view, refreshTrigger]);

  const loadMoreMixItems = useCallback(async () => {
    if (!hasMoreMixItems || loadingMoreMixItems || view !== "mix") {
      console.log("[Infinite Scroll] Bloqueado:", {
        hasMoreMixItems,
        loadingMoreMixItems,
        view,
      });
      return;
    }

    console.log("[Infinite Scroll] Carregando mais itens...", {
      cursorAtual: mixNextCursor,
      totalItensAtuais: items.length,
    });

    setLoadingMoreMixItems(true);
    try {
      const response = await fetchSmartMix(10, mixNextCursor!);
      console.log("[Infinite Scroll] Resposta recebida:", {
        novosItens: response.items.length,
        proximoCursor: response.nextCursor,
        temMais: !!response.nextCursor,
      });

      setItems((prev) => [...prev, ...response.items]);
      setMixNextCursor(response.nextCursor);
      setHasMoreMixItems(!!response.nextCursor);

      if (!response.nextCursor) {
        console.log("[Infinite Scroll] ✅ Chegou ao FINAL - sem mais itens!");
      }
    } catch (err) {
      console.error("[Infinite Scroll] ❌ Erro ao carregar:", err);
      setHasMoreMixItems(false);
    } finally {
      setLoadingMoreMixItems(false);
    }
  }, [hasMoreMixItems, loadingMoreMixItems, mixNextCursor, view, items.length]);

  // Intersection Observer for infinite scroll (mix view)
  useEffect(() => {
    if (!hasMoreMixItems || loadingMoreMixItems || view !== "mix") return;

    console.log(
      "[Intersection Observer] Configurando observer para último item",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log(
            "[Intersection Observer] Último item visível - trigger loadMore",
          );
          loadMoreMixItems();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = lastItemRef.current;
    if (currentRef) {
      console.log("[Intersection Observer] Observer anexado ao último item");
      observer.observe(currentRef);
    } else {
      console.warn(
        "[Intersection Observer] ⚠️ Referência ao último item não encontrada!",
      );
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreMixItems, loadingMoreMixItems, loadMoreMixItems, view]);

  const handleRefresh = () => {
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

  // Inject highlights or skeletons into news feed at regular intervals
  const itemsWithHighlights = useMemo(() => {
    if (searchQuery.trim() || view !== "mix") return filteredItems;

    const result: NewsOrHighlight[] = [];
    let highlightIndex = 0;
    filteredItems.forEach((item, index) => {
      result.push(item);

      // Insert highlight after every 5th item starting from 2nd (positions 2,7,12,17,22,...)
      if ((index + 1 - 2) % 5 === 0 && index >= 1) {
        if (highlightIndex < highlights.length) {
          result.push({
            type: "highlight",
            data: highlights[highlightIndex],
          });
          highlightIndex++;
        } else if (highlightsLoading) {
          result.push({
            type: "skeleton-highlight",
          });
        }
      }
    });

    return result;
  }, [filteredItems, searchQuery, highlights, highlightsLoading, view]);

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

        {error ? (
          // Error State
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : loading ? (
          // Skeleton Loading State
          <div className="space-y-0">
            {(() => {
              const skeletonItems = [];
              for (let i = 0; i < 12; i++) {
                skeletonItems.push(<SkeletonCard key={`skeleton-${i}`} />);
                if (highlightsLoading && (i + 1 - 2) % 5 === 0 && i >= 1) {
                  skeletonItems.push(
                    <SkeletonHighlightCard key={`highlight-skeleton-${i}`} />,
                  );
                }
              }
              // Add a skeleton for loading more mix items if applicable
              if (
                view === "mix" &&
                hasMoreMixItems &&
                loadingMoreMixItems &&
                items.length === 0
              ) {
                skeletonItems.push(
                  <SkeletonCard key="loading-more-mix-initial" />,
                );
              }
              return skeletonItems;
            })()}
          </div>
        ) : // Data State
        itemsWithHighlights.length > 0 ? (
          <div className="space-y-0">
            {itemsWithHighlights.map((item: NewsOrHighlight, index) => {
              const isLastItem = index === itemsWithHighlights.length - 1;
              if ("type" in item) {
                if (item.type === "highlight") {
                  return (
                    <HighlightCard
                      key={`highlight-${item.data.id}`}
                      highlight={item.data}
                    />
                  );
                } else if (item.type === "skeleton-highlight") {
                  return (
                    <SkeletonHighlightCard
                      key={`skeleton-highlight-${index}`}
                    />
                  );
                }
              }
              return (
                <div // Wrap NewsCard to attach ref for infinite scroll
                  key={`${(item as NewsItem).source}-${(item as NewsItem).id}`}
                  ref={view === "mix" && isLastItem ? lastItemRef : undefined}
                >
                  <NewsCard item={item as NewsItem} onClick={setSelectedItem} />
                </div>
              );
            })}
            {view === "mix" && hasMoreMixItems && loadingMoreMixItems && (
              <SkeletonCard key="loading-more-mix" />
            )}
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
