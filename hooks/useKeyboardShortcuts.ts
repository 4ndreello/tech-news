import { useEffect, useCallback, RefObject } from 'react';
import { SHORTCUTS } from '../utils/keyboardShortcuts';

interface UseKeyboardShortcutsOptions {
  itemsCount: number;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenItem: () => void;
  onShowHelp: () => void;
  searchInputRef?: RefObject<HTMLInputElement>;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  itemsCount,
  selectedIndex,
  onSelectIndex,
  onOpenItem,
  onShowHelp,
  searchInputRef,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields or textareas
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Special case: '/' should focus search even from outside input
      if (e.key === SHORTCUTS.FOCUS_SEARCH && !isInputField) {
        e.preventDefault();
        searchInputRef?.current?.focus();
        return;
      }

      // Special case: '?' should show help from anywhere (unless typing)
      if (e.key === SHORTCUTS.HELP && !isInputField) {
        e.preventDefault();
        onShowHelp();
        return;
      }

      // Don't handle other shortcuts if in input field
      if (isInputField) {
        return;
      }

      switch (e.key) {
        case SHORTCUTS.NEXT_ITEM:
          e.preventDefault();
          if (selectedIndex < itemsCount - 1) {
            const nextIndex = selectedIndex + 1;
            onSelectIndex(nextIndex);
            scrollToItem(nextIndex);
          }
          break;

        case SHORTCUTS.PREV_ITEM:
          e.preventDefault();
          if (selectedIndex > 0) {
            const prevIndex = selectedIndex - 1;
            onSelectIndex(prevIndex);
            scrollToItem(prevIndex);
          }
          break;

        case SHORTCUTS.OPEN_ITEM:
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < itemsCount) {
            onOpenItem();
          }
          break;
      }
    },
    [
      itemsCount,
      selectedIndex,
      onSelectIndex,
      onOpenItem,
      onShowHelp,
      searchInputRef,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enabled, handleKeyPress]);
}

function scrollToItem(index: number) {
  const element = document.querySelector(`[data-item-index="${index}"]`);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
