import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { SHORTCUT_DESCRIPTIONS } from '../utils/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Keyboard className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Atalhos de Teclado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="text-slate-500 dark:text-slate-400" size={20} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {SHORTCUT_DESCRIPTIONS.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-slate-700 dark:text-slate-300">
                {description}
              </span>
              <kbd className="px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm min-w-[2.5rem] text-center">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Pressione <kbd className="px-2 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded">ESC</kbd> para fechar
          </p>
        </div>
      </div>
    </div>
  );
}
