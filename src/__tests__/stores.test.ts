import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAppStore } from '@/stores/app';
import { useToolsStore } from '@/stores/tools';

describe('appStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should start with system theme and closed search', () => {
    const store = useAppStore();
    expect(store.theme).toBe('system');
    expect(store.isSearchOpen).toBe(false);
    expect(store.searchQuery).toBe('');
  });

  it('should toggle search open/close', () => {
    const store = useAppStore();
    store.toggleSearch();
    expect(store.isSearchOpen).toBe(true);
    store.toggleSearch();
    expect(store.isSearchOpen).toBe(false);
  });

  it('should clear search query when closing', () => {
    const store = useAppStore();
    store.isSearchOpen = true;
    store.searchQuery = 'test';
    store.toggleSearch();
    expect(store.searchQuery).toBe('');
  });

  it('should add recent tools and keep max 20', () => {
    const store = useAppStore();
    for (let i = 1; i <= 25; i++) {
      store.addRecentTool(`tool-${i}`);
    }
    expect(store.recentTools).toHaveLength(20);
    expect(store.recentTools[0]).toBe('tool-25');
  });

  it('should deduplicate recent tools', () => {
    const store = useAppStore();
    store.addRecentTool('json-format');
    store.addRecentTool('en-decode');
    store.addRecentTool('json-format');
    expect(store.recentTools.filter(t => t === 'json-format')).toHaveLength(1);
    expect(store.recentTools[0]).toBe('json-format');
  });

  it('setTheme should update theme mode', () => {
    const store = useAppStore();
    store.setTheme('dark');
    expect(store.theme).toBe('dark');
    store.setTheme('light');
    expect(store.theme).toBe('light');
  });
});

describe('toolsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have tools loaded', () => {
    const store = useToolsStore();
    expect(store.tools.length).toBeGreaterThanOrEqual(34);
  });

  it('categories should group tools', () => {
    const store = useToolsStore();
    expect(store.categories.size).toBeGreaterThan(0);
    for (const [cat, tools] of store.categories) {
      tools.forEach(t => expect(t.category).toBe(cat));
    }
  });

  it('search should delegate to searchTools', () => {
    const store = useToolsStore();
    const results = store.search('json');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => expect(r.id).toContain('json'));
  });
});
