<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import * as monaco from 'monaco-editor';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import { useAppStore } from '@/stores/app';

const message = useMessage();
const svgInput = ref('');
const output = ref('');
const outputType = ref<'png' | 'data-url' | 'html'>('data-url');

function convert() {
  if (!svgInput.value.trim()) { output.value = ''; return; }
  try {
    if (outputType.value === 'html') { output.value = svgInput.value; return; }

    const canvas = document.createElement('canvas');
    const svgBlob = new Blob([svgInput.value], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width || 400;
      canvas.height = img.height || 300;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      if (outputType.value === 'data-url') {
        output.value = canvas.toDataURL('image/png');
      } else {
        canvas.toBlob(blob => {
          const downloadUrl = URL.createObjectURL(blob!);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'converted.png';
          a.click();
          output.value = 'PNG 已下载';
        });
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { output.value = 'SVG 解析失败'; URL.revokeObjectURL(url); };
    img.src = url;
  } catch (e) { output.value = `转换错误: ${(e as Error).message}`; }
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
</script>

<template>
  <ToolLayout title="🖼️ SVG 转换">
    <template #toolbar-actions>
      <NSelect
        v-model:value="outputType"
        :options="[
          { label: 'Data URL', value: 'data-url' },
          { label: '下载 PNG', value: 'png' },
          { label: '显示 HTML', value: 'html' }
        ]"
        size="small"
        style="width:120px"
      />
      <NButton
        size="small"
        @click="convert"
      >
        ▶ 转换
      </NButton>
      <NButton
        v-if="outputType==='data-url'"
        size="small"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="padding:8px 12px;font-size:11px;color:var(--n-text-color-3);border-bottom:1px solid var(--n-border-color)">
          粘贴 SVG 代码
        </div>
        <div style="flex:1">
          <NInput
            v-model:value="svgInput"
            type="textarea"
            placeholder="<svg>...</svg>"
            :autosize="false"
            style="height:100%"
          />
        </div>
      </div>
    </template>
    <template #output>
      <div
        v-if="outputType==='html' && svgInput"
        style="padding:16px;overflow:auto"
        v-html="svgInput"
      />
      <textarea
        v-else
        :value="output"
        readonly
        style="width:100%;height:100%;border:none;resize:none;padding:12px;font-family:monospace;font-size:12px;background:var(--n-color-embedded);color:var(--n-text-color)"
      />
    </template>
  </ToolLayout>
</template>
