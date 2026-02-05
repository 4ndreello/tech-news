import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import KeyboardBadge from './KeyboardBadge';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ value, onChange, placeholder = "Buscar notícias..." }, ref) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto mb-6">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          size={20}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-16 py-3 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/50 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
        
        {/* Keyboard shortcut badge - shown when input is NOT focused */}
        {!value && (
          <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <KeyboardBadge keyLabel="/" variant="secondary" />
          </div>
        )}
        
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Limpar busca"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-500 text-center">
          Buscando por: <span className="text-slate-700 dark:text-slate-300 font-medium">"{value}"</span>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
