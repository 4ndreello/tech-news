import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import ErrorState from "./components/ErrorState";
import Header from "./components/Header";
import Modal from "./components/Modal";
import NewsCard from "./components/NewsCard";
import RankingInfoModal from "./components/RankingInfoModal";
import SearchBar from "./components/SearchBar";
import SkeletonCard from "./components/SkeletonCard";
import Toast from "./components/Toast";
import KeyboardShortcutsHelp from "./components/KeyboardShortcutsHelp";
import { fetchFeed } from "./services/api";
import { FeedItem, NewsItem, SourceStatus, ViewMode } from "./types";
import { classifyError, ErrorType } from "./utils/errorHandler";
import { useToast } from "./hooks/useToast";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSEO } from "./hooks/useSEO";

export default function App() {
  const [view, setView] = useState<ViewMode>("mix");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [mixNextCursor, setMixNextCursor] = useState<string | null>(null);
  const [hasMoreMixItems, setHasMoreMixItems] = useState(false);
  const [loadingMoreMixItems, setLoadingMoreMixItems] = useState(false);
  const [feedSources, setFeedSources] = useState<SourceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [rankingInfoItem, setRankingInfoItem] = useState<NewsItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate skeleton count based on viewport height
  const [skeletonCount] = useState(() => {
    const viewportHeight = window.innerHeight;
    const estimatedCardHeight = 80;
    const count = Math.floor(viewportHeight / estimatedCardHeight);
    return Math.max(3, Math.min(count, 20)); // Min 3, max 20
  });

  // Toast notifications
  const { toasts, showToast, removeToast } = useToast();

  // SEO
  useSEO({
    title: "TechNews - Notícias de tecnologia",
    description:
      "Agregador de notícias de tecnologia do Hacker News, TabNews, Dev.to, Lobsters e Twitter. Fique por dentro das últimas novidades em programação, desenvolvimento web e tecnologia.",
  });

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
            setFeedSources(feedResponse.sources || []);
            newMixNextCursor = feedResponse.nextCursor;
            newHasMoreMix = !!feedResponse.nextCursor;
            setLoadingMoreMixItems(false);
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
          const error =
            err instanceof Error
              ? err
              : new Error("Não foi possível conectar ao servidor.");
          const type = classifyError(error);
          setErrorType(type);
          setError(error.message);
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
    setError(null);
    setErrorType(null);
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

  // Keyboard shortcuts
  const handleOpenSelectedItem = useCallback(() => {
    const item = itemsWithHighlights[selectedIndex];
    if (item) {
      if ("type" in item && item.type === "news") {
        const newsItem = item as NewsItem & { type: "news" };
        const mainLink =
          newsItem.url ||
          (newsItem.source === "TabNews"
            ? `https://www.tabnews.com.br/${newsItem.owner_username}/${newsItem.slug}`
            : `https://news.ycombinator.com/item?id=${newsItem.id}`);
        window.open(mainLink, "_blank");
      } else {
        const newsItem = item as NewsItem;
        const mainLink =
          newsItem.url ||
          (newsItem.source === "TabNews"
            ? `https://www.tabnews.com.br/${newsItem.owner_username}/${newsItem.slug}`
            : `https://news.ycombinator.com/item?id=${newsItem.id}`);
        window.open(mainLink, "_blank");
      }
    }
  }, [itemsWithHighlights, selectedIndex]);

  useKeyboardShortcuts({
    itemsCount: itemsWithHighlights.length,
    selectedIndex,
    onSelectIndex: setSelectedIndex,
    onOpenItem: handleOpenSelectedItem,
    onShowHelp: () => setShowKeyboardHelp(true),
    searchInputRef,
    enabled: !showKeyboardHelp && !selectedItem && !rankingInfoItem,
  });

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
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      <Header
        currentView={view}
        onViewChange={(v) => {
          setView(v);
          setSearchQuery("");
          setShowDashboard(false);
        }}
        feedSources={view === "mix" ? feedSources : undefined}
        showDashboard={showDashboard}
        onDashboardClick={() => setShowDashboard(!showDashboard)}
        onHelpClick={() => setShowKeyboardHelp(true)}
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div>
          <main className="max-w-3xl mx-auto">
            {!loading &&
              !error &&
              !showDashboard &&
              (view === "mix" ? feedItems.length > 0 : items.length > 0) && (
                <SearchBar
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Buscar por título, autor ou conteúdo..."
                />
              )}

            {showDashboard ? (
              <AnalyticsDashboard />
            ) : error ? (
              <ErrorState
                message={error}
                errorType={errorType || ErrorType.Unknown}
                onRetry={handleRefresh}
              />
            ) : loading ? (
              <div className="space-y-0">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </div>
            ) : itemsWithHighlights.length > 0 ? (
              <div className="space-y-0">
                {itemsWithHighlights.map((item: any, index) => {
                  const shouldAttachRef = index === lastNewsIndex;

                  if (view === "mix" && "type" in item) {
                    if (item.type === "news") {
                      return (
                        <div
                          key={`news-${item.id}`}
                          ref={shouldAttachRef ? lastItemRef : undefined}
                        >
                          <NewsCard
                            item={item}
                            onClick={setSelectedItem}
                            onScoreClick={handleScoreClick}
                            onCopyLink={(url) =>
                              showToast("Link copiado!", "success")
                            }
                            isSelected={index === selectedIndex}
                            selectedIndex={selectedIndex}
                            itemIndex={index}
                          />
                        </div>
                      );
                    }
                  }

                  return (
                    <div
                      key={`${(item as NewsItem).source}-${(item as NewsItem).id}`}
                      ref={shouldAttachRef ? lastItemRef : undefined}
                    >
                      <NewsCard
                        item={item as NewsItem}
                        onClick={setSelectedItem}
                        onScoreClick={handleScoreClick}
                        onCopyLink={(url) =>
                          showToast("Link copiado!", "success")
                        }
                        isSelected={index === selectedIndex}
                        selectedIndex={selectedIndex}
                        itemIndex={index}
                      />
                    </div>
                  );
                })}
                {view === "mix" && hasMoreMixItems && loadingMoreMixItems && (
                  <SkeletonCard key="loading-more-mix" />
                )}
              </div>
            ) : (view === "mix" ? feedItems.length > 0 : items.length > 0) ? (
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
        </div>
      </div>

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      {rankingInfoItem && (
        <RankingInfoModal
          item={rankingInfoItem}
          onClose={handleCloseRankingModal}
        />
      )}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </div>
  );
}
