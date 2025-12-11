import React from 'react';
import { MessageSquare, ThumbsUp, Zap } from 'lucide-react';
import { NewsItem, Source } from '../types';
import { timeAgo } from '../utils/date';

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

export default function NewsCard({ item, onClick }: NewsCardProps) {
  const isHN = item.source === Source.HackerNews;
  
  // Lógica de Link Principal
  const tabNewsUrl = `https://www.tabnews.com.br/${item.owner_username}/${item.slug}`;
  const mainLink = isHN ? (item.url || `https://news.ycombinator.com/item?id=${item.id}`) : tabNewsUrl;
  
  // Extrair domínio apenas para links externos do HN
  let domain = '';
  if (isHN && mainLink) {
    try {
        const urlObj = new URL(mainLink);
        // Não mostrar se for o próprio site do HN
        if (!urlObj.hostname.includes('ycombinator.com')) {
             domain = urlObj.hostname.replace('www.', '');
        }
    } catch (e) {}
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (isHN) {
      window.open(`https://news.ycombinator.com/item?id=${item.id}`, '_blank');
    } else {
      onClick(item);
    }
  };

  return (
    <div className="glass group relative flex items-start sm:items-center p-3 sm:p-4 rounded-none sm:rounded-lg hover:bg-[#1e293b]/80 transition-all duration-200 border-b border-white/5 sm:border border-transparent sm:hover:border-white/10">
      
      {/* 1. Score Area (Left aligned, fixed width) */}
      <div className="flex flex-col items-center justify-center w-10 sm:w-14 mr-3 sm:mr-4 pt-1 sm:pt-0">
          {isHN ? (
              <Zap size={18} className="text-orange-500 mb-1 opacity-80" />
          ) : (
              <ThumbsUp size={18} className="text-green-500 mb-1 opacity-80" />
          )}
          <span className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
              {item.score}
          </span>
      </div>

      {/* 2. Main Content (Left aligned) */}
      <a 
        href={mainLink} 
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 cursor-pointer"
      >
        <div className="flex flex-col gap-1">
            <h3 className="text-[17px] md:text-lg font-medium text-slate-200 leading-snug group-hover:text-blue-400 transition-colors">
              {item.title} 
              {domain && (
                <span className="text-sm font-normal text-slate-500 ml-2 inline-block">
                    ({domain})
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-400 hover:text-slate-300 transition-colors">
                    {item.author}
                </span>
                <span>•</span>
                <span>{timeAgo(item.publishedAt)}</span>
            </div>
        </div>
      </a>

      {/* 3. Comment Button (Right) */}
      <div className="ml-2 pl-2 sm:ml-4 sm:pl-4 sm:border-l border-white/5 h-8 flex items-center">
        <button 
            onClick={handleCommentClick}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            title={isHN ? "Abrir discussão" : "Ler comentários"}
        >
             <MessageSquare size={16} />
             <span className="text-xs font-semibold">{item.commentCount || 0}</span>
        </button>
      </div>
    </div>
  );
}