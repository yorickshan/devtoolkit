<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInput, useMessage } from 'naive-ui';
import * as XLSX from 'xlsx';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const output = ref('');

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const wb = XLSX.read(reader.result, { type: 'array' });
      const result: Record<string, unknown[]> = {};
      wb.SheetNames.forEach(name => {
        result[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
      });
      output.value = JSON.stringify(result, null, 2);
      message.success('转换成功');
    } catch (e) { message.error('文件解析失败'); }
  };
  reader.readAsArrayBuffer(file);
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
</script>

<template>
  <ToolLayout title="📊 Excel → JSON">
    <template #toolbar-actions>
      <NButton
        size="small"
        :disabled="!output"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="xl-input">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          class="xl-file"
          @change="onFileSelect"
        >
        <p class="xl-hint">
          选择 .xlsx / .xls / .csv 文件
        </p>
        <p class="xl-note">
          需要安装 xlsx 依赖: npm install xlsx
        </p>
      </div>
    </template>
    <template #output>
      <OutputPanel
        v-model="output"
        language="json"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.xl-input { padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; height: 100%; justify-content: center; }
.xl-file { font-size: 13px; }
.xl-hint { font-size: 12px; color: var(--n-text-color-3); }
.xl-note { font-size: 11px; color: var(--n-color-warning); }
</style>
