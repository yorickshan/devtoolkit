<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const leftText = ref('');
const rightText = ref('');
const diffOutput = ref('');

function lineDiff(a: string, b: string): string {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const maxLen = Math.max(aLines.length, bLines.length);
  const result: string[] = [];

  // Simple LCS-based line diff
  for (let i = 0; i < maxLen; i++) {
    const la = i < aLines.length ? aLines[i] : null;
    const lb = i < bLines.length ? bLines[i] : null;
    if (la === lb) {
      result.push(`  ${i + 1}  ${la}`);
    } else {
      if (la !== null) result.push(`- ${i + 1}  ${la}`);
      if (lb !== null) result.push(`+ ${i + 1}  ${lb}`);
    }
  }
  return result.join('\n');
}

function compare() {
  if (!leftText.value && !rightText.value) { diffOutput.value = ''; return; }
  diffOutput.value = lineDiff(leftText.value, rightText.value);
}

function handleCopy() { navigator.clipboard.writeText(diffOutput.value).then(() => message.success(t('app.clipboard.copied'))); }
watch([leftText, rightText], compare);
</script>

<template>
  <ToolLayout title="📋 文本对比">
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
            文本 A
          </div><MonacoEditor
            v-model="leftText"
            language="plaintext"
          />
        </div>
        <div class="diff-half">
          <div class="diff-label">
            文本 B
          </div><MonacoEditor
            v-model="rightText"
            language="plaintext"
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
