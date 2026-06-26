<script setup lang="ts">
import { useRouter } from 'vue-router';
import { TOOLS } from '@/data/tools-registry';
import { useAppStore } from '@/stores/app';
import { useLocalizedTool } from '@/composables/useLocalizedTool';
import { useI18n } from 'vue-i18n';
import ToolIcon from '@/components/common/ToolIcon.vue';
import type { ToolDefinition } from '@/types';

const router = useRouter();
const appStore = useAppStore();
const { toolName } = useLocalizedTool();
const { t } = useI18n();

function openTool(tool: ToolDefinition) {
  appStore.addRecentTool(tool.id);
  router.push(tool.route);
}
</script>

<template>
  <div class="tool-grid">
    <div
      v-for="tool in TOOLS"
      :key="tool.id"
      class="tool-grid__card"
      @click="openTool(tool)"
    >
      <button
        class="tool-grid__fav"
        :class="{ 'is-fav': appStore.isFavorite(tool.id) }"
        :title="appStore.isFavorite(tool.id) ? t('app.favorite.remove') : t('app.favorite.add')"
        @click.stop="appStore.toggleFavorite(tool.id)"
      >
        {{ appStore.isFavorite(tool.id) ? '⭐' : '☆' }}
      </button>
      <span class="tool-grid__icon"><ToolIcon :tool="tool" :size="28" /></span>
      <span class="tool-grid__name">{{ toolName(tool) }}</span>
    </div>
  </div>
</template>

<style scoped>
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
  gap: var(--fh-space-3);
  padding: var(--fh-space-6);
}

.tool-grid__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--fh-space-2);
  padding: var(--fh-space-5) var(--fh-space-3);
  border-radius: var(--fh-radius-lg);
  background: var(--fh-surface-2);
  border: 1px solid var(--fh-border-subtle);
  cursor: pointer;
  transition: all var(--fh-duration-base) var(--fh-ease-out);
}

.tool-grid__card:hover {
  border-color: var(--fh-border-hover);
  background: var(--fh-surface-3);
  transform: translateY(-2px);
  box-shadow: var(--fh-shadow-md);
}

.tool-grid__card:active {
  transform: translateY(0);
  transition: transform var(--fh-duration-instant) var(--fh-ease-out);
}

.tool-grid__fav {
  position: absolute;
  top: 6px;
  right: 6px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: var(--fh-radius-xs);
  opacity: 0;
  transition: opacity var(--fh-duration-fast) var(--fh-ease-out),
              transform var(--fh-duration-fast) var(--fh-ease-spring);
  color: var(--fh-text-tertiary);
}

.tool-grid__card:hover .tool-grid__fav,
.tool-grid__fav.is-fav {
  opacity: 1;
}

.tool-grid__fav.is-fav {
  color: #f0a020;
}

.tool-grid__fav:hover {
  transform: scale(1.3);
}

.tool-grid__icon {
  font-size: 28px;
  transition: transform var(--fh-duration-base) var(--fh-ease-out);
}

.tool-grid__card:hover .tool-grid__icon {
  transform: scale(1.06);
}

.tool-grid__name {
  font-size: var(--fh-font-size-sm);
  font-weight: var(--fh-font-weight-medium);
  color: var(--fh-text-secondary);
  text-align: center;
  line-height: var(--fh-line-height-tight);
}

.tool-grid__card:hover .tool-grid__name {
  color: var(--fh-text-primary);
}
</style>
