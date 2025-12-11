import React from 'react';
import { ViewMode } from '../types';
import ServiceStatusWidget from './ServiceStatus';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const navItems = [
    { id: 'mix', label: 'Top' },
    { id: 'tabnews', label: 'TabNews' },
    { id: 'hackernews', label: 'Hacker News' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f172a] border-b border-slate-800/50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center">
          <span className="text-lg font-semibold text-white">TechNews</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewMode)}
                className={`
                  text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {item.label}
              </button>
            );
          })}

          {/* Service Status Widget */}
          <ServiceStatusWidget />
        </nav>
      </div>
    </header>
  );
}