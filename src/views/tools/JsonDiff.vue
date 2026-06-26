<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const leftInput = ref('');
const rightInput = ref('');
const diffOutput = ref('');

function deepDiff(a: unknown, b: unknown, path: string = ''): string[] {
  const diffs: string[] = [];
  if (a === b) return diffs;
  if (typeof a !== typeof b) {
    diffs.push(`${path}: type mismatch (${typeof a} vs ${typeof b})`);
    return diffs;
  }
  if (typeof a !== 'object' || a === null || b === null) {
    diffs.push(`${path}: "${String(a)}" ≠ "${String(b)}"`);
    return diffs;
  }
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  for (const key of new Set([...Object.keys(objA), ...Object.keys(objB)])) {
    const newPath = path ? `${path}.${key}` : key;
    if (!(key in objA)) diffs.push(`${newPath}: added in right`);
    else if (!(key in objB)) diffs.push(`${newPath}: removed from left`);
    else diffs.push(...deepDiff(objA[key], objB[key], newPath));
  }
  return diffs;
}

function compare() {
  let leftParsed: unknown, rightParsed: unknown;
  try { leftParsed = JSON.parse(leftInput.value); } catch { diffOutput.value = '✗ 左侧 JSON 无效'; return; }
  try { rightParsed = JSON.parse(rightInput.value); } catch { diffOutput.value = '✗ 右侧 JSON 无效'; return; }
  const diffs = deepDiff(leftParsed, rightParsed);
  diffOutput.value = diffs.length > 0 ? diffs.join('\n') : '✓ 两个 JSON 完全相同';
}

function handleCopy() {
  navigator.clipboard.writeText(diffOutput.value).then(() => message.success(t('app.clipboard.copied')));
}

watch([leftInput, rightInput], compare);
</script>

<template>
  <ToolLayout title="≔ JSON 对比">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="compare"
      >
        ▶ 对比
      </NButton>
      <NButton
        size="small"
        @click="handleCopy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="diff-inputs">
        <div class="diff-half">
          <div class="diff-label">
            左侧 JSON
          </div><MonacoEditor
            v-model="leftInput"
            language="json"
          />
        </div>
        <div class="diff-half">
          <div class="diff-label">
            右侧 JSON
          </div><MonacoEditor
            v-model="rightInput"
            language="json"
          />
        </div>
      </div>
    </template>
    <template #output>
      <OutputPanel
        v-model="diffOutput"
        language="plaintext"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.diff-inputs { display: flex; height: 100%; gap: 1px; background: var(--n-border-color); }
.diff-half { flex: 1; display: flex; flex-direction: column; background: var(--n-color); }
.diff-label { padding: 4px 12px; font-size: 11px; color: var(--n-text-color-3); background: var(--n-color-embedded); border-bottom: 1px solid var(--n-border-color); }
</style>
