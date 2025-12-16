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
import RankingInfoModal from "./components/RankingInfoModal";
import {
  ViewMode,
  NewsItem,
  Highlight,
  NewsOrHighlight,
  FeedItem,
} from "./types";
import {
  fetchSmartMix,
  fetchTabNews,
  fetchHackerNews,
  fetchFeed,
} from "./services/api";

export default function App() {
  const [view, setView] = useState<ViewMode>("mix");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]); // New: unified feed items (news + highlights intercalados)
  const [mixNextCursor, setMixNextCursor] = useState<string | null>(null); // New state for mix pagination
  const [hasMoreMixItems, setHasMoreMixItems] = useState(false); // New state for mix pagination
  const [loadingMoreMixItems, setLoadingMoreMixItems] = useState(false); // New state for mix pagination
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [rankingInfoItem, setRankingInfoItem] = useState<NewsItem | null>(null);
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
            setLoadingMoreMixItems(true);
            console.log("[Initial Load] Buscando primeira página do feed...");
            const feedResponse = await fetchFeed(10); // Fetch first page with 10 items (includes news + highlights)
            console.log("[Initial Load] Feed carregado:", {
              itens: feedResponse.items.length,
              proximoCursor: feedResponse.nextCursor,
              temMais: !!feedResponse.nextCursor,
            });
            setFeedItems(feedResponse.items);
            newMixNextCursor = feedResponse.nextCursor;
            newHasMoreMix = !!feedResponse.nextCursor;
            setLoadingMoreMixItems(false);
            break;
          case "tabnews":
            fetchedNewsItems = await fetchTabNews();
            setFeedItems([]); // Clear feed items when not in mix view
            setMixNextCursor(null);
            setHasMoreMixItems(false);
            break;
          case "hackernews":
            fetchedNewsItems = await fetchHackerNews();
            setFeedItems([]); // Clear feed items when not in mix view
            setMixNextCursor(null);
            setHasMoreMixItems(false);
            break;
        }

        if (!ignore) {
          const uniqueItems = [];
          const seenKeys = new Set();
          if (Array.isArray(fetchedNewsItems)) {
            for (const item of fetchedNewsItems) {
              const key = `${item.source}-${item.id}`;
              if (!seenKeys.has(key)) {
                uniqueItems.push(item);
                seenKeys.add(key);
              }
            }
          }
          setItems(uniqueItems);
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

  // Highlights are now fetched within the feed endpoint for mix view
  // No separate highlights fetch needed anymore

  const loadMoreMixItems = useCallback(async () => {
    if (!hasMoreMixItems || loadingMoreMixItems || view !== "mix") {
      console.log("[Infinite Scroll] Bloqueado:", {
        hasMoreMixItems,
        loadingMoreMixItems,
        view,
      });
      return;
    }

    console.log("[Infinite Scroll] Carregando mais itens do feed...", {
      cursorAtual: mixNextCursor,
      totalItensAtuais: feedItems.length,
    });

    setLoadingMoreMixItems(true);
    try {
      const response = await fetchFeed(10, mixNextCursor!);
      console.log("[Infinite Scroll] Resposta recebida:", {
        novosItens: response.items.length,
        proximoCursor: response.nextCursor,
        temMais: !!response.nextCursor,
      });

      setFeedItems((prev) => {
        const existingKeys = new Set(prev.map((i) => i.id));
        const newUniqueItems = response.items.filter(
          (item) => !existingKeys.has(item.id),
        );
        return [...prev, ...newUniqueItems];
      });
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
  }, [
    hasMoreMixItems,
    loadingMoreMixItems,
    mixNextCursor,
    view,
    feedItems.length,
  ]);

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

  const handleScoreClick = (item: NewsItem) => {
    setRankingInfoItem(item);
  };

  const handleCloseRankingModal = () => {
    setRankingInfoItem(null);
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      // If mix view, return feedItems as-is (already intercalated)
      if (view === "mix") {
        return feedItems;
      }
      return items;
    }

    const query = searchQuery.toLowerCase();

    // For mix view with search, filter feedItems
    if (view === "mix") {
      return feedItems.filter((item) => {
        if (item.type === "news") {
          return (
            item.title.toLowerCase().includes(query) ||
            item.author.toLowerCase().includes(query)
          );
        } else {
          // Highlight
          return (
            item.title.toLowerCase().includes(query) ||
            item.author.toLowerCase().includes(query)
          );
        }
      });
    }

    // For other views, filter regular items
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query),
    );
  }, [items, feedItems, searchQuery, view]);

  // For mix view, items already come intercalated from backend
  // For other views, just return the filtered items
  const itemsWithHighlights = useMemo(() => {
    return filteredItems;
  }, [filteredItems]);

  // Find the last news item index for attaching the infinite scroll ref
  // (highlights don't need ref, only news items trigger loading)
  const lastNewsIndex = useMemo(() => {
    if (view !== "mix") return itemsWithHighlights.length - 1;

    // For mix view, find the last item that is a news item
    for (let i = itemsWithHighlights.length - 1; i >= 0; i--) {
      if ((itemsWithHighlights[i] as any).type === "news") {
        return i;
      }
    }
    return -1;
  }, [itemsWithHighlights, view]);

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
        {!loading &&
          !error &&
          (view === "mix" ? feedItems.length > 0 : items.length > 0) && (
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
              const count = 10;

              if (view === "mix") {
                // Mix view: Primeiro 2 news + 1 highlight, depois 5 news + 1 highlight
                skeletonItems.push(<SkeletonCard key="skeleton-0" />);
                skeletonItems.push(<SkeletonCard key="skeleton-1" />);
                skeletonItems.push(
                  <SkeletonHighlightCard key="highlight-skeleton-0" />,
                );

                // Resto: padrão 5:1 (positions 3-9 = 7 items: 5N + 1H + 1N)
                for (let i = 3; i < count; i++) {
                  // Position 8 gets a highlight (3+5=8)
                  if (i === 8) {
                    skeletonItems.push(
                      <SkeletonHighlightCard key={`highlight-skeleton-${i}`} />,
                    );
                  } else {
                    skeletonItems.push(<SkeletonCard key={`skeleton-${i}`} />);
                  }
                }
              } else {
                // Other views: only news skeletons
                for (let i = 0; i < count; i++) {
                  skeletonItems.push(<SkeletonCard key={`skeleton-${i}`} />);
                }
              }

              return skeletonItems;
            })()}
          </div>
        ) : // Data State
        itemsWithHighlights.length > 0 ? (
          <div className="space-y-0">
            {itemsWithHighlights.map((item: any, index) => {
              // Attach ref to the last NEWS item (not the last item overall)
              const shouldAttachRef = index === lastNewsIndex;

              // For mix view, items come with type field from backend
              if (view === "mix" && "type" in item) {
                if (item.type === "highlight") {
                  return (
                    <HighlightCard
                      key={`highlight-${item.id}`}
                      highlight={item}
                    />
                  );
                } else if (item.type === "news") {
                  return (
                    <div
                      key={`news-${item.id}`}
                      ref={shouldAttachRef ? lastItemRef : undefined}
                    >
                      <NewsCard
                        item={item}
                        onClick={setSelectedItem}
                        onScoreClick={handleScoreClick}
                      />
                    </div>
                  );
                }
              }

              // For other views, items are regular NewsItems
              return (
                <div
                  key={`${(item as NewsItem).source}-${(item as NewsItem).id}`}
                  ref={shouldAttachRef ? lastItemRef : undefined}
                >
                  <NewsCard
                    item={item as NewsItem}
                    onClick={setSelectedItem}
                    onScoreClick={handleScoreClick}
                  />
                </div>
              );
            })}
            {view === "mix" && hasMoreMixItems && loadingMoreMixItems && (
              <SkeletonCard key="loading-more-mix" />
            )}
          </div>
        ) : (view === "mix" ? feedItems.length > 0 : items.length > 0) ? (
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

      {/* Ranking Info Modal */}
      {rankingInfoItem && (
        <RankingInfoModal
          item={rankingInfoItem}
          onClose={handleCloseRankingModal}
        />
      )}
    </div>
  );
}
