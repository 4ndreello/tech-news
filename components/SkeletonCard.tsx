import React from "react";

export default function SkeletonCard() {
  return (
    <div className="py-4 border-b border-slate-200 dark:border-slate-800/50 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-start gap-4">
        {/* Score Circle */}
        <div className="flex-shrink-0 w-12 text-center">
          <div className="h-8 w-8 mx-auto bg-slate-200 dark:bg-slate-800/50 rounded-full shimmer"></div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title - 2 lines */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded w-[90%] shimmer"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded w-[75%] shimmer"></div>
          </div>

          {/* Metadata row */}
          <div className="flex gap-3 items-center">
            {/* Source badge */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800/30 rounded w-20 shimmer"></div>
            {/* Author */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800/30 rounded w-24 shimmer"></div>
            {/* Time */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800/30 rounded w-16 shimmer"></div>
            {/* Comments */}
            <div className="h-3 bg-slate-100 dark:bg-slate-800/30 rounded w-14 shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
