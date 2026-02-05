import React from 'react';

interface KeyboardBadgeProps {
  keyLabel: 'J' | 'K' | 'O' | '/' | '?';
  variant: 'primary' | 'secondary';
}

export default function KeyboardBadge({ keyLabel, variant }: KeyboardBadgeProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <kbd
      className={`
        inline-flex items-center justify-center
        min-w-[24px] h-[24px] px-2
        text-[10px] font-mono font-bold tracking-wider
        rounded-[6px]
        border-[0.5px]
        transition-all duration-200
        select-none
        ${
          isPrimary
            ? 'bg-gradient-to-b from-white/90 to-white/70 dark:from-slate-600/70 dark:to-slate-700/60 backdrop-blur-md border-slate-400/40 dark:border-slate-500/40 text-slate-700 dark:text-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,0.8),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.15)] animate-badge-pop'
            : 'bg-gradient-to-b from-white/60 to-white/40 dark:from-slate-700/50 dark:to-slate-800/40 backdrop-blur-md border-slate-400/25 dark:border-slate-600/25 text-slate-500 dark:text-slate-400 opacity-50 shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(255,255,255,0.6),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.1)] animate-badge-fade'
        }
      `}
    >
      {keyLabel}
    </kbd>
  );
}
