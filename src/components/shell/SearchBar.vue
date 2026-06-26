<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { NInput, NTag } from 'naive-ui';
import { searchTools, TOOLS } from '@/data/tools-registry';
import { useAppStore } from '@/stores/app';
import { useLocalizedTool } from '@/composables/useLocalizedTool';
import { useI18n } from 'vue-i18n';
import ToolIcon from '@/components/common/ToolIcon.vue';
import type { ToolDefinition } from '@/types';

const { toolName } = useLocalizedTool();
const { t } = useI18n();

const router = useRouter();
const appStore = useAppStore();

const query = ref('');
const selectedIndex = ref(0);
const MAX_RESULTS = 12;

// Enhanced search: match name/nameEn/keywords/description + rank by relevance
function enhancedSearch(q: string): ToolDefinition[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  const scored: Array<{ tool: ToolDefinition; score: number }> = [];

  TOOLS.forEach((tool) => {
    let score = 0;
    // name exact match = highest priority
    if (tool.name.toLowerCase() === lower) score += 100;
    else if (tool.name.toLowerCase().startsWith(lower)) score += 80;
    else if (tool.name.toLowerCase().includes(lower)) score += 60;

    // nameEn match
    if (tool.nameEn.toLowerCase() === lower) score += 90;
    else if (tool.nameEn.toLowerCase().startsWith(lower)) score += 70;
    else if (tool.nameEn.toLowerCase().includes(lower)) score += 50;

    // keyword match
    tool.keywords.forEach((kw) => {
      if (kw.toLowerCase() === lower) score += 40;
      else if (kw.toLowerCase().startsWith(lower)) score += 30;
      else if (kw.toLowerCase().includes(lower)) score += 20;
    });

    // description match
    if (tool.description.toLowerCase().includes(lower)) score += 10;

    // recent tool bonus
    if (appStore.recentTools.includes(tool.id)) score += 15;

    // favorite bonus
    if (appStore.isFavorite(tool.id)) score += 10;

    if (score > 0) scored.push({ tool, score });
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_RESULTS).map((s) => s.tool);
}

const results = computed(() => enhancedSearch(query.value));

watch(query, () => { selectedIndex.value = 0; });

function selectTool(tool: ToolDefinition) {
  appStore.addRecentTool(tool.id);
  router.push(tool.route);
  appStore.isSearchOpen = false;
  query.value = '';
}

function handleKeydown(e: KeyboardEvent) {
  const len = results.value.length;
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex.value = Math.min(selectedIndex.value + 1, len - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex.value = Math.max(selectedIndex.value - 1, 0); }
  else if (e.key === 'Enter') { e.preventDefault(); if (results.value[selectedIndex.value]) selectTool(results.value[selectedIndex.value]); }
  else if (e.key === 'Escape') { appStore.isSearchOpen = false; query.value = ''; }
}

watch(() => appStore.isSearchOpen, (open) => {
  if (open) {
    query.value = '';
    selectedIndex.value = 0;
  }
});
</script>

<template>
  <div class="search-bar">
    <div class="search-bar__overlay" @click="appStore.isSearchOpen = false" />
    <div class="search-bar__panel">
      <NInput
        v-model:value="query"
        :placeholder="(t('app.search.placeholder') as string)"
        size="large"
        clearable
        :input-props="{ autofocus: true }"
        @keydown="handleKeydown"
      >
        <template #prefix>🔍</template>
      </NInput>
      <div v-if="!query.trim()" class="search-bar__hint">
        <span class="search-bar__hint-text">{{ t('app.search.hint') }}</span>
      </div>
      <div v-else-if="results.length > 0" class="search-bar__results">
        <div
          v-for="(tool, idx) in results"
          :key="tool.id"
          class="search-bar__item"
          :class="{ 'search-bar__item--active': idx === selectedIndex }"
          @click="selectTool(tool)"
          @mouseenter="selectedIndex = idx"
        >
          <span class="search-bar__item-icon"><ToolIcon :tool="tool" :size="20" /></span>
          <div class="search-bar__item-body">
            <div class="search-bar__item-name">
              {{ toolName(tool) }}
              <NTag v-if="appStore.isFavorite(tool.id)" size="tiny" :bordered="false" type="warning">⭐</NTag>
            </div>
            <div class="search-bar__item-desc">{{ tool.description }}</div>
          </div>
          <span class="search-bar__item-shortcut">↵</span>
        </div>
      </div>
      <div v-else class="search-bar__empty">{{ t('app.search.empty') }}</div>
      <div v-if="results.length > 0" class="search-bar__footer">
        <span>{{ t('app.search.navigate') }}</span>
        <span>{{ t('app.search.open') }}</span>
        <span>{{ t('app.search.close') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar { position: relative; }

.search-bar__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
}

.search-bar__panel {
  position: absolute;
  top: var(--fh-space-4);
  left: 50%;
  transform: translateX(-50%);
  width: 540px;
  max-width: 90vw;
  background: var(--fh-surface-1);
  border: 1px solid var(--fh-border-default);
  border-radius: var(--fh-radius-xl);
  box-shadow: var(--fh-shadow-lg), 0 0 0 1px var(--fh-border-subtle);
  z-index: 101;
  padding: var(--fh-space-3);
}

.search-bar__hint {
  padding: var(--fh-space-4) var(--fh-space-3);
  text-align: center;
}

.search-bar__hint-text {
  font-size: var(--fh-font-size-sm);
  color: var(--fh-text-tertiary);
}

.search-bar__results {
  margin-top: var(--fh-space-2);
  max-height: 400px;
  overflow-y: auto;
}

.search-bar__item {
  display: flex;
  align-items: center;
  gap: var(--fh-space-3);
  padding: var(--fh-space-3) var(--fh-space-3);
  border-radius: var(--fh-radius-md);
  cursor: pointer;
  transition: background var(--fh-duration-fast) var(--fh-ease-out);
}

.search-bar__item--active,
.search-bar__item:hover {
  background: var(--fh-accent-muted);
}

.search-bar__item-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}

.search-bar__item-body { flex: 1; min-width: 0; }

.search-bar__item-name {
  font-size: var(--fh-font-size-base);
  font-weight: var(--fh-font-weight-medium);
  color: var(--fh-text-primary);
  display: flex;
  align-items: center;
  gap: var(--fh-space-2);
}

.search-bar__item-desc {
  font-size: var(--fh-font-size-xs);
  color: var(--fh-text-tertiary);
  margin-top: 2px;
}

.search-bar__item-shortcut {
  font-size: var(--fh-font-size-xs);
  color: var(--fh-text-tertiary);
  opacity: 0;
  transition: opacity var(--fh-duration-fast);
}

.search-bar__item--active .search-bar__item-shortcut {
  opacity: 0.6;
}

.search-bar__footer {
  display: flex;
  justify-content: space-around;
  padding: var(--fh-space-2) 0 0;
  border-top: 1px solid var(--fh-border-subtle);
  margin-top: var(--fh-space-2);
  font-size: var(--fh-font-size-xs);
  color: var(--fh-text-tertiary);
  font-family: var(--fh-font-mono);
}

.search-bar__empty {
  padding: var(--fh-space-6);
  text-align: center;
  color: var(--fh-text-tertiary);
  font-size: var(--fh-font-size-sm);
}
</style>
