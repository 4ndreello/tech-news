import React, { useState } from "react";
import {
  MessageCircle,
  ExternalLink,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Highlight } from "../types";
import { timeAgo } from "../utils/date";

interface HighlightCardProps {
  highlight: Highlight;
}

export default function HighlightCard({ highlight }: HighlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSourceBadge = () => {
    switch (highlight.source) {
      case "twitter":
        return { label: "X", color: "bg-blue-500/10 text-blue-400" };
      case "reddit":
        return { label: "Reddit", color: "bg-orange-500/10 text-orange-400" };
      case "devto":
        return { label: "Dev.to", color: "bg-orange-500/10 text-orange-400" };
    }
  };

  const formatEngagement = () => {
    if (highlight.source === "twitter") {
      return `${highlight.engagement.comments} respostas`;
    }
    if (highlight.source === "reddit") {
      return `${highlight.engagement.upvotes} upvotes`;
    }
    return `${highlight.engagement.comments} comentários`;
  };

  const sourceBadge = getSourceBadge();

  return (
    <div className="group relative py-6 border-y border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent hover:from-blue-500/10 transition-all my-4">
      {/* AI Badge - top left corner */}
      <div className="absolute -top-3 left-4">
        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-full border border-blue-500/30">
          <TrendingUp className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-slate-400">Destaque IA</span>
        </div>
      </div>

      <a
        href={highlight.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-start gap-4">
          {/* Empty space for alignment with NewsCard */}
          <div className="flex-shrink-0 w-12"></div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            {/* Title */}
            <h3 className="text-base font-medium text-slate-100 group-hover:text-white transition-colors leading-relaxed mb-2">
              {highlight.title}
            </h3>

            {/* AI Summary */}
            <p
              className={`text-sm text-slate-400 leading-relaxed mb-2 ${isExpanded ? "" : "line-clamp-2"}`}
            >
              {highlight.summary}
            </p>

            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs mb-3"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{isExpanded ? "Mostrar menos" : "Mostrar mais"}</span>
            </button>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span
                className={`text-xs px-2 py-0.5 rounded ${sourceBadge.color}`}
              >
                {sourceBadge.label}
              </span>
              <span className="hover:text-slate-400 transition-colors">
                @{highlight.author}
              </span>
              <span>·</span>
              <span>{timeAgo(highlight.publishedAt)}</span>
              <div className="flex items-center gap-1.5">
                <MessageCircle size={14} />
                <span>{formatEngagement()}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
