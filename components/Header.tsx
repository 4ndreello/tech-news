import React from 'react';
import { ViewMode } from '../types';
import { Flame, Terminal, Globe, Cpu } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const navItems = [
    { id: 'mix', icon: Flame },
    { id: 'tabnews', label: 'TabNews', icon: Terminal },
    { id: 'hackernews', label: 'Hacker News', icon: Globe },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0f172a]/90 border-b border-white/5 shadow-sm shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 mr-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden md:block">TechNews</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center md:justify-start gap-1 md:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewMode)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-white bg-white/10 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-blue-400' : ''} />
                { item.label && (<span className={`${isActive ? 'block' : 'hidden md:block'}`}>{item.label}</span>) } 
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}