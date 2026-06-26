<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { NButton, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';
import JsonWorker from '@/workers/json-worker?worker';

const message = useMessage();
const input = ref('');
const output = ref('');
const mode = ref<'format' | 'compress' | 'validate'>('format');
const indentSize = ref(2);
const workerLoading = ref(false);

const modeOptions = [
  { label: '格式化', value: 'format' },
  { label: '压缩', value: 'compress' },
  { label: '校验', value: 'validate' },
];

const indentOptions = [
  { label: '2 空格', value: 2 },
  { label: '4 空格', value: 4 },
  { label: 'Tab', value: 0 },
];

function unpackTopLevelEscapedJSON(text: string): string {
  const trimmed = text.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      const inner = JSON.parse(trimmed);
      if (typeof inner === 'string') return unpackTopLevelEscapedJSON(inner);
      return JSON.stringify(inner, null, 2);
    } catch { return text; }
  }
  return text;
}

const WORKER_THRESHOLD = 500 * 1024; // 500KB — use Worker above this

function processInput() {
  if (!input.value.trim()) { output.value = ''; return; }

  if (mode.value === 'validate') {
    try { JSON.parse(unpackTopLevelEscapedJSON(input.value)); output.value = '✓ JSON 有效'; }
    catch (e) { output.value = `✗ JSON 无效: ${(e as Error).message}`; }
    return;
  }

  // Use Web Worker for large files
  if (input.value.length > WORKER_THRESHOLD) {
    workerLoading.value = true;
    output.value = '⏳ 处理中 (Worker)...';
    const worker = new JsonWorker();
    worker.onmessage = (e) => {
      workerLoading.value = false;
      if (e.data.ok) { output.value = e.data.result; }
      else { output.value = `✗ JSON 无效: ${e.data.error}`; }
      worker.terminate();
    };
    const indent = indentSize.value === 0 ? 0 : indentSize.value;
    worker.postMessage({ text: unpackTopLevelEscapedJSON(input.value), mode: mode.value, indent });
  } else {
    doProcess();
  }
}

function doProcess() {
  try {
    const unpacked = unpackTopLevelEscapedJSON(input.value);
    const parsed = JSON.parse(unpacked);
    const indent = indentSize.value === 0 ? '\t' : indentSize.value;
    output.value = mode.value === 'compress'
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, indent as number);
  } catch (e) {
    output.value = `✗ JSON 无效: ${(e as Error).message}`;
  }
}

function handleCopy() {
  navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied')))
    .catch(() => message.warning(t('app.clipboard.copyFail')));
}

// Keyboard shortcut: Cmd/Ctrl+Enter to format
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    processInput();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

watch(input, processInput);
watch([mode, indentSize], processInput);
</script>

<template>
  <ToolLayout
    title="{} JSON 格式化"
    @clear="input = ''; output = ''"
  >
    <template #toolbar-actions>
      <NSelect v-model:value="mode" :options="modeOptions" size="small" style="width: 100px" />
      <NSelect v-model:value="indentSize" :options="indentOptions" size="small" style="width: 100px" />
      <NButton size="small" @click="processInput" :loading="workerLoading">
        ▶ 格式化
      </NButton>
      <NButton size="small" @click="handleCopy">📋 复制</NButton>
      <span style="font-size:10px;color:var(--n-text-color-3)">⌘Enter</span>
    </template>
    <template #input>
      <InputPanel v-model="input" language="json" />
    </template>
    <template #output>
      <OutputPanel v-model="output" language="json" />
    </template>
  </ToolLayout>
</template>
