<script setup lang="ts">
import { NButton } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const appStore = useAppStore();

defineProps<{
  title: string;
}>();

function goBack() {
  router.push('/');
}

function getCurrentToolId(): string {
  return route.path.replace('/tool/', '');
}
</script>

<template>
  <div class="tool-toolbar">
    <NButton
      text
      size="small"
      @click="goBack"
    >
      {{ t('app.toolbar.back') }}
    </NButton>
    <span class="tool-toolbar__title">{{ title }}</span>
    <div class="tool-toolbar__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.tool-toolbar {
  display: flex;
  align-items: center;
  gap: var(--fh-space-3);
  padding: 0 var(--fh-space-4);
  border-bottom: 1px solid var(--fh-border-subtle);
  background: var(--fh-surface-glass);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  flex-shrink: 0;
  height: 40px;
}

.tool-toolbar__title {
  font-size: var(--fh-font-size-base);
  font-weight: var(--fh-font-weight-semibold);
  color: var(--fh-text-primary);
  letter-spacing: -0.01em;
}

.tool-toolbar__actions {
  margin-left: auto;
  display: flex;
  gap: var(--fh-space-2);
  align-items: center;
}
</style>
