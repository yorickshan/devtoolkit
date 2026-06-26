<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { NButton } from 'naive-ui';
import type { PanelInfo } from '@/types';
import ToolToolbar from './ToolToolbar.vue';
import AppShell from './AppShell.vue';

const { t } = useI18n();

defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  clear: [];
}>();

const splitRatio = ref(0.5);
const isDragging = ref(false);
const inputInfo = ref<PanelInfo>({ chars: 0, lines: 0, language: 'text', isValid: true, message: '' });
const outputInfo = ref<PanelInfo>({ chars: 0, lines: 0, language: 'text', isValid: true, message: '' });

function updateInputStats(s: { chars: number; lines: number; language: string }) {
  inputInfo.value = { ...inputInfo.value, ...s };
}
function updateOutputStats(s: { chars: number; lines: number; language: string }) {
  outputInfo.value = { ...outputInfo.value, ...s };
}
function clearAll() {
  emit('clear');
}

function onDividerMouseDown(e: MouseEvent) { isDragging.value = true; e.preventDefault(); }
function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const container = (e.target as HTMLElement).closest('.tool-layout__panels');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  splitRatio.value = Math.max(0.15, Math.min(0.85, x / rect.width));
}
function onMouseUp() { isDragging.value = false; }
function onGlobalMouseMove(e: MouseEvent) { onMouseMove(e); }
function onGlobalMouseUp() { onMouseUp(); }

import { onMounted } from 'vue';
onMounted(() => {
  document.addEventListener('mousemove', onGlobalMouseMove);
  document.addEventListener('mouseup', onGlobalMouseUp);
});
onUnmounted(() => {
  document.removeEventListener('mousemove', onGlobalMouseMove);
  document.removeEventListener('mouseup', onGlobalMouseUp);
});

defineExpose({ inputInfo, outputInfo, splitRatio, updateInputStats, updateOutputStats, clearAll });
</script>

<template>
  <AppShell>
    <div class="tool-layout">
      <ToolToolbar :title="title">
        <template #actions>
          <slot name="toolbar-actions" />
        </template>
      </ToolToolbar>
      <div
        class="tool-layout__panels"
        :class="{ 'is-dragging': isDragging }"
      >
        <div
          class="tool-layout__panel"
          :style="{ flex: splitRatio }"
        >
          <div class="tool-layout__panel-header">
            {{ t('app.panel.input') }}
            <NButton text size="tiny" style="margin-left:auto" @click="clearAll">{{ t('app.toolbar.clear') }}</NButton>
          </div>
          <div class="tool-layout__panel-body">
            <slot name="input" />
          </div>
          <div class="tool-layout__panel-footer">
            {{ t('app.panel.chars', { n: inputInfo.chars }) }} | {{ t('app.panel.lines', { n: inputInfo.lines }) }} | {{ inputInfo.language }}
          </div>
        </div>
        <div
          class="tool-layout__divider"
          :class="{ 'is-active': isDragging }"
          @mousedown="onDividerMouseDown"
        />
        <div
          class="tool-layout__panel"
          :style="{ flex: 1 - splitRatio }"
        >
          <div class="tool-layout__panel-header">
            {{ t('app.panel.output') }}
          </div>
          <div class="tool-layout__panel-body">
            <slot name="output" />
          </div>
          <div class="tool-layout__panel-footer">
            <span
              v-if="outputInfo.message"
              :class="{ 'tool-layout__error': !outputInfo.isValid }"
            >
              {{ outputInfo.message }}
            </span>
            {{ t('app.panel.chars', { n: outputInfo.chars }) }} | {{ t('app.panel.lines', { n: outputInfo.lines }) }} |
            <slot name="output-footer-actions" />
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.tool-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tool-layout__panels {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: var(--fh-surface-0);
}

.tool-layout__panels.is-dragging {
  user-select: none;
  cursor: col-resize;
}

.tool-layout__panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
}

.tool-layout__panel:first-child {
  padding-right: 0;
}

.tool-layout__panel-header {
  padding: var(--fh-space-1) var(--fh-space-3);
  font-size: var(--fh-font-size-xs);
  color: var(--fh-text-tertiary);
  background: var(--fh-surface-1);
  border-bottom: 1px solid var(--fh-border-subtle);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-family: var(--fh-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tool-layout__panel-body {
  flex: 1;
  overflow: hidden;
  background: var(--fh-surface-0);
}

.tool-layout__panel-footer {
  padding: 0 var(--fh-space-3);
  font-size: var(--fh-font-size-xs);
  color: var(--fh-text-tertiary);
  background: var(--fh-surface-glass);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid var(--fh-border-subtle);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 22px;
  font-family: var(--fh-font-mono);
}

.tool-layout__divider {
  width: 4px;
  cursor: col-resize;
  background: var(--fh-border-subtle);
  flex-shrink: 0;
  transition: background var(--fh-duration-fast) var(--fh-ease-out),
              box-shadow var(--fh-duration-fast) var(--fh-ease-out);
}

.tool-layout__divider:hover {
  background: var(--fh-accent);
  box-shadow: 0 0 6px rgba(74, 158, 255, 0.15);
}

.tool-layout__divider.is-active {
  background: var(--fh-accent);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.25);
}

.tool-layout__error {
  color: var(--fh-error);
}
</style>
