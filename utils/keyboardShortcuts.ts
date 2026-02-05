export const SHORTCUTS = {
  NEXT_ITEM: 'j',
  PREV_ITEM: 'k',
  OPEN_ITEM: 'o',
  HELP: '?',
  FOCUS_SEARCH: '/',
} as const;

export const SHORTCUT_DESCRIPTIONS = [
  { key: 'j', description: 'Próximo item' },
  { key: 'k', description: 'Item anterior' },
  { key: 'o', description: 'Abrir item selecionado' },
  { key: '/', description: 'Focar na busca' },
  { key: '?', description: 'Mostrar atalhos' },
] as const;

export type ShortcutKey = typeof SHORTCUTS[keyof typeof SHORTCUTS];
