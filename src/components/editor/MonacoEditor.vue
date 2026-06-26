<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';
import * as monaco from 'monaco-editor';
import { invoke } from '@tauri-apps/api/core';
import '@/workers/monaco-setup';

const props = withDefaults(defineProps<{
  modelValue: string;
  language?: string;
  readOnly?: boolean;
  theme?: 'vs' | 'vs-dark';
  fontSize?: number;
  wordWrap?: 'on' | 'off';
  enableDropFiles?: boolean;
}>(), {
  language: 'plaintext',
  readOnly: false,
  theme: 'vs-dark',
  fontSize: 13,
  wordWrap: 'on',
  enableDropFiles: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
  'stats': [stats: { chars: number; lines: number; language: string }];
}>();

const containerRef = ref<HTMLElement>();
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>();

function emitStats() {
  if (!editor.value) return;
  const text = editor.value.getValue();
  const lines = editor.value.getModel()?.getLineCount() ?? 0;
  emit('stats', { chars: text.length, lines, language: props.language });
}

onMounted(() => {
  if (!containerRef.value) return;

  editor.value = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    readOnly: props.readOnly,
    theme: props.theme,
    fontSize: props.fontSize,
    wordWrap: props.wordWrap,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    padding: { top: 12 },
  });

  editor.value.onDidChangeModelContent(() => {
    const value = editor.value!.getValue();
    emit('update:modelValue', value);
    emit('change', value);
    emitStats();
  });

  emitStats();

  // File drop handler — overrides Monaco's native file open
  if (props.enableDropFiles && containerRef.value) {
    containerRef.value.addEventListener('dragover', (e) => e.preventDefault());
    containerRef.value.addEventListener('drop', async (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        editor.value?.setValue(text);
      } catch {
        // Tauri path — try invoke read_file
        try {
          const text = await invoke<string>('read_file', { path: (file as any).path });
          editor.value?.setValue(text);
        } catch { /* ignore */ }
      }
    });
  }
});

onUnmounted(() => {
  editor.value?.dispose();
  editor.value = undefined;
});

watch(() => props.modelValue, (newVal) => {
  if (editor.value && editor.value.getValue() !== newVal) { editor.value.setValue(newVal); }
});

watch(() => props.language, (newLang) => {
  if (editor.value) {
    const model = editor.value.getModel();
    if (model) monaco.editor.setModelLanguage(model, newLang);
  }
});

watch(() => props.readOnly, (ro) => editor.value?.updateOptions({ readOnly: ro }));

defineExpose({
  getEditor: () => editor.value,
  getValue: () => editor.value?.getValue() ?? '',
  setValue: (v: string) => editor.value?.setValue(v),
  format: () => editor.value?.getAction('editor.action.formatDocument')?.run(),
});
</script>

<template>
  <div ref="containerRef" class="monaco-editor" />
</template>

<style scoped>
.monaco-editor { width: 100%; height: 100%; }
</style>
