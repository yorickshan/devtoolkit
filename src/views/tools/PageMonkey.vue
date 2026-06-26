<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';
import MonacoEditor from '@/components/editor/MonacoEditor.vue';

const message = useMessage();
const script = ref(`// 页面猴子 - 用户脚本
// 示例：修改页面背景色
document.body.style.background = '#f0f8ff';
console.log('Page Monkey script executed!');`);
const url = ref('https://example.com');
const output = ref('');

function run() {
  if (!script.value.trim()) return;
  try {
    // In Tauri desktop, inject script into sandboxed iframe
    const result = `脚本已准备:\n- 目标 URL: ${url.value}\n- 脚本长度: ${script.value.length} 字符\n- 状态: 已加载\n\n(在 Tauri 桌面环境中，用户脚本功能需要 WebView 注入支持。当前为预览模式。)\n\n脚本内容:\n${script.value}`;
    output.value = result;
    message.success('脚本已加载');
  } catch (e) { output.value = `错误: ${(e as Error).message}`; }
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
</script>

<template>
  <ToolLayout title="🐵 页面猴子">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="run"
      >
        ▶ 加载
      </NButton>
      <NButton
        size="small"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="pm-input">
        <div class="pm-row">
          <span>目标 URL:</span><NInput
            v-model:value="url"
            size="small"
          />
        </div>
        <div class="pm-editor">
          <MonacoEditor
            v-model="script"
            language="javascript"
          />
        </div>
        <NButton
          type="primary"
          block
          @click="run"
        >
          🚀 运行脚本
        </NButton>
      </div>
    </template>
    <template #output>
      <OutputPanel
        v-model="output"
        language="plaintext"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.pm-input { padding: 12px; display: flex; flex-direction: column; gap: 8px; height: 100%; }
.pm-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.pm-row span { white-space: nowrap; color: var(--n-text-color-3); }
.pm-editor { flex: 1; min-height: 0; }
</style>
