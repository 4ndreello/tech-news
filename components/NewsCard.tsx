import React from "react";
import { MessageCircle } from "lucide-react";
import { NewsItem, Source } from "../types";
import { timeAgo } from "../utils/date";

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

export default function NewsCard({ item, onClick }: NewsCardProps) {
  const isHN = item.source === Source.HackerNews;

  // Lógica de Link Principal
  const tabNewsUrl = `https://www.tabnews.com.br/${item.owner_username}/${item.slug}`;
  const mainLink = isHN
    ? item.url || `https://news.ycombinator.com/item?id=${item.id}`
    : tabNewsUrl;

  // Extrair domínio apenas para links externos do HN
  let domain = "";
  if (isHN && mainLink) {
    try {
      const urlObj = new URL(mainLink);
      // Não mostrar se for o próprio site do HN
      if (!urlObj.hostname.includes("ycombinator.com")) {
        domain = urlObj.hostname.replace("www.", "");
      }
    } catch (e) {}
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isHN) {
      // Impede a ação para o Hacker News, como solicitado
      return;
    }

    onClick(item);
  };

  return (
    <div className="group relative py-4 border-b border-slate-800/50 hover:border-slate-700/50 transition-colors">
      <a
        href={mainLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-start gap-4">
          {/* Score */}
          <div className="flex-shrink-0 w-12 text-center">
            <div className="text-lg font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              {item.score}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-normal text-slate-100 group-hover:text-white transition-colors leading-relaxed mb-1.5">
              {item.title}
              {domain && (
                <span className="text-sm text-slate-500 ml-2">({domain})</span>
              )}
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span
                className={`text-xs px-2 py-0.5 rounded ${isHN ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"}`}
              >
                {isHN ? "HN" : "TN"}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    isHN
                      ? `https://news.ycombinator.com/user?id=${item.author}`
                      : `https://www.tabnews.com.br/${item.author}`,
                    "_blank",
                  );
                }}
                className="hover:text-slate-400 hover:underline transition-colors cursor-pointer"
              >
                {item.author}
              </span>
              <span>·</span>
              <span>{timeAgo(item.publishedAt)}</span>
              <button
                onClick={handleCommentClick}
                className={`flex items-center gap-1.5 transition-colors ${
                  isHN
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-slate-400"
                }`}
                title={isHN ? "Abrir discussão" : "Ler comentários"}
              >
                <MessageCircle size={14} />
                <span>{item.commentCount || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
