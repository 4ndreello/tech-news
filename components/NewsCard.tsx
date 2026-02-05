import React from "react";
import { MessageCircle, Link2 } from "lucide-react";
import { NewsItem, Source, EnrichedNewsItem } from "../types";
import { timeAgo, formatFullDate } from "../utils/date";
import { copyToClipboard } from "../utils/clipboard";
import SourceIcon from "./SourceIcon";
import KeyboardBadge from "./KeyboardBadge";

type NewsItemWithEnrichment = NewsItem & Partial<Pick<EnrichedNewsItem, "techScore" | "keywords">>;

interface NewsCardProps {
  item: NewsItemWithEnrichment;
  onClick: (item: NewsItem) => void;
  onScoreClick: (item: NewsItem) => void;
  onCopyLink?: (url: string) => void;
  isSelected?: boolean;
  selectedIndex?: number;
  itemIndex?: number;
}

const sourceConfig: Record<Source, any> = {
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
  [Source.Lobsters]: {
    name: "LOBSTERS",
    badgeStyles: "bg-[#500500]/30 text-[#fff]",
    getMainLink: (item: NewsItem) => item.url!,
    getUserUrl: (author: string) => `https://lobsters.org/user/${author}`,
    canOpenModal: false,
    commentActionTitle: "Ver no Lobsters",
  },
  [Source.Twitter]: {
    name: "TWITTER",
    badgeStyles: "bg-black text-white border border-slate-700",
    getMainLink: (item: NewsItem) => item.url!,
    getUserUrl: (author: string) => `https://twitter.com/${author}`,
    canOpenModal: false,
    commentActionTitle: "Ver no Twitter",
  },
};

export default function NewsCard({
  item,
  onClick,
  onScoreClick,
  onCopyLink,
  isSelected = false,
  selectedIndex,
  itemIndex,
}: NewsCardProps) {
  const config = sourceConfig[item.source];

  if (!config) {
    return null; // or a fallback UI
  }

  const mainLink = config.getMainLink(item);

  // Determine badge configuration
  const getBadgeConfig = (): { key: 'J' | 'K' | 'O'; variant: 'primary' | 'secondary' } | null => {
    if (itemIndex === undefined || selectedIndex === undefined) return null;
    
    if (itemIndex === selectedIndex) {
      return { key: 'O', variant: 'primary' };
    } else if (itemIndex === selectedIndex - 1) {
      return { key: 'K', variant: 'secondary' };
    } else if (itemIndex === selectedIndex + 1) {
      return { key: 'J', variant: 'secondary' };
    }
    return null;
  };

  const badgeConfig = getBadgeConfig();

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

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await copyToClipboard(mainLink);

    if (success && onCopyLink) {
      onCopyLink(mainLink);
    }
  };

  return (
    <div
      className={`group relative py-4 border-b border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/50 transition-colors ${
        isSelected
          ? 'border-l-4 border-l-blue-500 bg-blue-500/5 dark:bg-blue-500/5 pl-4'
          : ''
      }`}
      data-item-index={itemIndex}
    >
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
            <div className="text-lg font-semibold text-slate-600 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
              {item.score}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-normal text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors leading-relaxed mb-1.5">
              {item.title}
              {domain && (
                <span className="text-sm text-slate-500 dark:text-slate-500 ml-2">({domain})</span>
              )}
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-500">
              {/* Keyboard Badge - First in metadata line */}
              {badgeConfig && (
                <div className="hidden md:flex items-center">
                  <KeyboardBadge 
                    keyLabel={badgeConfig.key}
                    variant={badgeConfig.variant}
                  />
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <SourceIcon source={item.source} size={16} />
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(config.getUserUrl(item.author), "_blank");
                }}
                className="hover:text-slate-700 dark:hover:text-slate-400 hover:underline transition-colors cursor-pointer"
              >
                {item.author}
              </span>
              <span>·</span>
              <span title={formatFullDate(item.publishedAt)}>
                {timeAgo(item.publishedAt)}
              </span>
              <button
                onClick={handleCommentClick}
                className={`flex items-center gap-1.5 transition-colors ${
                  !config.canOpenModal
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-slate-700 dark:hover:text-slate-400"
                }`}
                title={config.commentActionTitle}
              >
                <MessageCircle size={14} />
                <span>{item.commentCount || 0}</span>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-400 transition-all"
                title="Copiar link"
                aria-label="Copiar link do artigo"
              >
                <Link2 size={14} />
              </button>
            </div>

            {item.keywords && item.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
