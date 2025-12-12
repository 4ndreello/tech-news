import React from "react";
import { TrendingUp } from "lucide-react";

export default function SkeletonHighlightCard() {
  return (
    <div className="group relative py-6 border-y border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent my-4">
      {/* AI Badge Placeholder */}
      <div className="absolute -top-3 left-4">
        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-full border border-blue-500/30">
          <TrendingUp className="w-3 h-3 text-blue-400" />
          <div className="h-3 w-16 bg-slate-800/50 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex items-start gap-4">
        {/* Empty space for alignment */}
        <div className="flex-shrink-0 w-12"></div>

        {/* Content Placeholder */}
        <div className="flex-1 min-w-0 pr-4 space-y-3">
          {/* Title Placeholder */}
          <div className="h-4 bg-slate-800/50 rounded w-4/5 animate-pulse"></div>
          <div className="h-4 bg-slate-800/50 rounded w-3/5 animate-pulse"></div>

          {/* Summary Placeholder */}
          <div className="space-y-1">
            <div className="h-3 bg-slate-800/30 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-slate-800/30 rounded w-4/5 animate-pulse"></div>
          </div>

          {/* Meta info Placeholder */}
          <div className="flex items-center gap-3">
            <div className="h-3 w-12 bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-3 w-4 bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-slate-800/30 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
