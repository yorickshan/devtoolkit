<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { TOOLS, getToolById } from '@/data/tools-registry';
import { useLocalizedTool } from '@/composables/useLocalizedTool';

const { t } = useI18n();
const route = useRoute();
const toolCount = TOOLS.length;
const { toolName } = useLocalizedTool();

const activeToolName = computed(() => {
  const id = route.path.replace('/tool/', '');
  if (id === '/' || !id) return '';
  const tool = getToolById(id);
  return tool ? toolName(tool) : '';
});

const leftMsg = computed(() => {
  if (activeToolName.value) return `🔧 ${activeToolName.value}`;
  return t('app.toolsCount', { count: toolCount });
});
</script>

<template>
  <footer class="status-bar">
    <span class="status-bar__left">{{ leftMsg }}</span>
    <span class="status-bar__right">v0.1.0 🟢</span>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--fh-space-4);
  font-size: var(--fh-font-size-xs);
  color: var(--fh-text-tertiary);
  background: var(--fh-surface-glass);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  border-top: 1px solid var(--fh-border-subtle);
  height: 24px;
  flex-shrink: 0;
  font-family: var(--fh-font-mono);
}

.status-bar__right {
  opacity: 0.7;
}
</style>
