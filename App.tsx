import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import SkeletonCard from './components/SkeletonCard';
import Modal from './components/Modal';
import ErrorState from './components/ErrorState';
import { ViewMode, NewsItem } from './types';
import { fetchSmartMix, fetchTabNews, fetchHackerNews } from './services/api';

export default function App() {
  const [view, setView] = useState<ViewMode>('mix');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      let data: NewsItem[] = [];
      
      try {
        switch (view) {
          case 'mix':
            data = await fetchSmartMix();
            break;
          case 'tabnews':
            data = await fetchTabNews();
            break;
          case 'hackernews':
            data = await fetchHackerNews();
            break;
        }
        
        if (!ignore) {
          setItems(data);
        }
      } catch (err) {
        if (!ignore) {
          const errorMessage = err instanceof Error ? err.message : "Não foi possível conectar ao servidor.";
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
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      
      {/* Header Navigation - Refresh button removed */}
      <Header 
        currentView={view} 
        onViewChange={(v) => {
          setView(v);
        }} 
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Context info */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 pl-2">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
           <span>
              {view === 'mix' && 'Top 20 Curated Stories'}
              {view === 'tabnews' && 'TabNews Feed'}
              {view === 'hackernews' && 'Hacker News Feed'}
           </span>
        </div>

        {/* Content List - Changed from Grid to Flex Column (Lines) */}
        <div className="flex flex-col gap-3">
          {loading ? (
            // Skeleton Loading State
            Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : error ? (
            // Error State - Keep retry button here for errors
            <ErrorState message={error} onRetry={handleRefresh} />
          ) : (
            // Data State
            items.length > 0 ? (
              items.map((item) => (
                <NewsCard 
                  key={`${item.source}-${item.id}`} 
                  item={item} 
                  onClick={setSelectedItem} 
                />
              ))
            ) : (
              // Empty State (No items but no error)
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                <p className="text-lg">Nenhuma notícia encontrada.</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 text-blue-400 hover:underline"
                >
                  Tentar Novamente
                </button>
              </div>
            )
          )}
        </div>
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