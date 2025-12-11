import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass flex items-center p-4 rounded-lg border border-white/5 bg-[#1e293b]/20 h-[80px]">
        {/* Score Placeholder */}
        <div className="w-10 mr-4 flex flex-col items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/10"></div>
            <div className="w-6 h-3 rounded bg-white/5"></div>
        </div>

        {/* Content Placeholder */}
        <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="h-4 bg-white/10 rounded w-4/5 animate-pulse"></div>
            <div className="flex gap-2">
                 <div className="h-3 bg-white/5 rounded w-20"></div>
                 <div className="h-3 bg-white/5 rounded w-16"></div>
            </div>
        </div>

        {/* Comment Placeholder */}
        <div className="ml-4 pl-4 border-l border-white/5">
             <div className="w-6 h-6 rounded bg-white/5"></div>
        </div>
    </div>
  );
}