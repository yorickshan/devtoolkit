import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { ThemeMode, AppPreferences, Locale } from '@/types';

const STORAGE_KEY = 'devtoolkit-preferences';

function loadPrefs(): Partial<AppPreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(prefs: Partial<AppPreferences>) {
  try {
    const existing = loadPrefs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch { /* quota exceeded, ignore */ }
}

export const useAppStore = defineStore('app', () => {
  const saved = loadPrefs();

  const theme = ref<ThemeMode>(saved.theme || 'system');
  const locale = ref<Locale>(saved.locale || 'zh-CN');
  const searchQuery = ref('');
  const isSearchOpen = ref(false);
  const recentTools = ref<string[]>(saved.recentTools || []);
  const favorites = ref<string[]>(saved.favorites || []);

  function addRecentTool(toolId: string) {
    recentTools.value = [
      toolId,
      ...recentTools.value.filter((id) => id !== toolId),
    ].slice(0, 20);
  }

  function toggleSearch() {
    isSearchOpen.value = !isSearchOpen.value;
    if (!isSearchOpen.value) {
      searchQuery.value = '';
    }
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
  }

  function setLocale(lang: string) {
    locale.value = lang as Locale;
  }

  // Favorites
  function toggleFavorite(toolId: string) {
    const idx = favorites.value.indexOf(toolId);
    if (idx >= 0) {
      favorites.value.splice(idx, 1);
    } else {
      favorites.value.push(toolId);
    }
  }

  function isFavorite(toolId: string): boolean {
    return favorites.value.includes(toolId);
  }

  // Persist on changes
  watch([theme, locale, recentTools, favorites], () => {
    savePrefs({
      theme: theme.value,
      locale: locale.value,
      recentTools: recentTools.value,
      favorites: favorites.value,
    });
  }, { deep: true });

  return {
    theme,
    locale,
    searchQuery,
    isSearchOpen,
    recentTools,
    favorites,
    addRecentTool,
    toggleSearch,
    setTheme,
    setLocale,
    toggleFavorite,
    isFavorite,
  };
});
