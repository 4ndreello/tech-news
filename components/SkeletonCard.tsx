import React from "react";

export default function SkeletonCard() {
  return (
    <div className="py-4 border-b border-slate-800/50">
      <div className="flex items-start gap-4">
        {/* Score Placeholder */}
        <div className="flex-shrink-0 w-12 text-center">
          <div className="h-6 w-8 mx-auto bg-slate-800/50 rounded animate-pulse"></div>
        </div>

        {/* Content Placeholder */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-800/50 rounded w-4/5 animate-pulse"></div>
          <div className="flex gap-3">
            <div className="h-3 bg-slate-800/30 rounded w-20 animate-pulse"></div>
            <div className="h-3 bg-slate-800/30 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-slate-800/30 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
