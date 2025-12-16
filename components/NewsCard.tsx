import React from "react";
import { MessageCircle } from "lucide-react";
import { NewsItem, Source } from "../types";
import { timeAgo } from "../utils/date";

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
  onScoreClick: (item: NewsItem) => void;
}

const sourceConfig = {
  [Source.HackerNews]: {
    name: "HACKERNEWS",
    badgeStyles: "bg-orange-500/10 text-orange-400",
    getMainLink: (item: NewsItem) =>
      item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    getUserUrl: (author: string) =>
      `https://news.ycombinator.com/user?id=${author}`,
    canOpenModal: false,
    commentActionTitle: "Abrir discussão",
  },
  [Source.TabNews]: {
    name: "TABNEWS",
    badgeStyles: "bg-blue-500/10 text-blue-400",
    getMainLink: (item: NewsItem) =>
      `https://www.tabnews.com.br/${item.owner_username}/${item.slug}`,
    getUserUrl: (author: string) => `https://www.tabnews.com.br/${author}`,
    canOpenModal: true,
    commentActionTitle: "Ler comentários",
  },
  [Source.DevTo]: {
    name: "DEVTO",
    badgeStyles: "bg-purple-500/10 text-purple-400",
    getMainLink: (item: NewsItem) => item.url!,
    getUserUrl: (author: string) => `https://dev.to/${author}`,
    canOpenModal: false,
    commentActionTitle: "Ver no Dev.to",
  },
};

export default function NewsCard({
  item,
  onClick,
  onScoreClick,
}: NewsCardProps) {
  const config = sourceConfig[item.source];

  if (!config) {
    return null; // or a fallback UI
  }

  const mainLink = config.getMainLink(item);

  let domain = "";
  if (mainLink) {
    try {
      const urlObj = new URL(mainLink);
      const hostname = urlObj.hostname.replace("www.", "");

      const isPlatformLink =
        (item.source === Source.HackerNews &&
          hostname.includes("ycombinator.com")) ||
        (item.source === Source.TabNews && hostname.includes("tabnews.com.br"));

      if (!isPlatformLink) {
        domain = hostname;
      }
    } catch (e) {}
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (config.canOpenModal) {
      onClick(item);
    }
    // For other sources, the button is disabled, so no action is needed.
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
          <div
            className="flex-shrink-0 w-12 text-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onScoreClick(item);
            }}
            title="Ver detalhes do score"
          >
            <div className="text-lg font-semibold text-slate-400 group-hover:text-sky-400 transition-colors">
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
                className={`text-xs px-2 py-0.5 rounded ${config.badgeStyles}`}
              >
                {config.name}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(config.getUserUrl(item.author), "_blank");
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
                  !config.canOpenModal
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-slate-400"
                }`}
                title={config.commentActionTitle}
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
