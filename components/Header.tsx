import React, { useState } from "react";
import { ViewMode, SourceStatus } from "../types";
import ServiceStatusWidget from "./ServiceStatus";
import { Home, LayoutDashboard, Sun, Moon, HelpCircle } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  feedSources?: SourceStatus[];
  showDashboard?: boolean;
  onDashboardClick?: () => void;
  onHelpClick?: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  feedSources,
  showDashboard = false,
  onDashboardClick,
  onHelpClick,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { id: "mix", label: "Home" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800/50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Brand + Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              TechNews
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
              v{import.meta.env.VITE_VERSION}
            </span>
          </div>
          
          {/* Action Buttons + Status Widget - always visible on all screens */}
          <div className="flex items-center gap-1">
            <button
              onClick={onHelpClick}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              title="Atalhos de teclado (?)"
              aria-label="Mostrar atalhos de teclado"
            >
              <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              title="Alternar tema claro/escuro"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-slate-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Service Status Widget */}
            <ServiceStatusWidget feedSources={feedSources} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation - Text */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = currentView === item.id && !showDashboard;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as ViewMode)}
                  className={`
                    text-sm font-medium transition-colors
                    ${isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />

            <button
              onClick={onDashboardClick}
              className={`
                flex items-center gap-1.5 text-sm font-medium transition-colors
                ${showDashboard
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }
              `}
            >
              Dashboard
            </button>
          </nav>

          {/* Mobile Navigation - Icons */}
          <nav className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onViewChange("mix")}
              className={`
                p-2 rounded-md transition-colors
                ${currentView === "mix" && !showDashboard
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
              `}
              title="Home"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={onDashboardClick}
              className={`
                p-2 rounded-md transition-colors
                ${showDashboard
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
              `}
              title="Dashboard"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
