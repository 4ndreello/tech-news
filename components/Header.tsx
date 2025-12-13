import React, { useState } from 'react';
import { ViewMode } from '../types';
import ServiceStatusWidget from './ServiceStatus';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

        {/* Navigation / Mobile Menu Toggle */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12 ml-8">
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
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-slate-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Service Status Widget */}
          <div className="ml-4 hidden md:block">
            <ServiceStatusWidget />
          </div>
        </div>

        {/* Mobile Menu Drawer (Conditionally rendered) */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[56px] bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}>
            <div className="bg-[#0f172a] w-64 h-[calc(100vh-56px)] p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>

              <nav className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id as ViewMode);
                        setIsMenuOpen(false);
                      }}
                      className={`text-left p-2 rounded-lg transition-colors text-lg font-medium ${
                        isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}