<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, onMounted, computed } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const targetUrl = ref('https://devtoolkit.app');
const output = ref('');
const loading = ref(false);

async function loadAndInspect() {
  if (!targetUrl.value.trim()) return;
  loading.value = true;
  output.value = '正在加载...';
  try {
    // In Tauri desktop, this would use WebView inspection
    // Currently simulates with basic fetch analysis
    const res = await fetch(targetUrl.value, { mode: 'no-cors' });
    const info = {
      url: targetUrl.value,
      type: res.type,
      status: res.status,
      headers: {} as Record<string, string>,
      size: res.headers.get('content-length') || 'unknown',
      contentType: res.headers.get('content-type') || 'unknown',
    };

    output.value = [
      `📄 DevTools 分析`,
      `URL: ${info.url}`,
      `Status: ${info.status || 'N/A'}`,
      `Content-Type: ${info.contentType}`,
      `Content-Length: ${info.size}`,
      `Response Type: ${info.type}`,
      '',
      `📝 页面信息:`,
      `Title: (需要 WebView 加载)`,
      `Meta: (需要 WebView 加载)`,
      `Scripts: (需要 WebView 加载)`,
      `Styles: (需要 WebView 加载)`,
      '',
      `⚠️ 完整 DevTools 功能需要 Tauri WebView Inspection API`,
    ].join('\n');
  } catch (e) {
    output.value = `加载失败: ${(e as Error).message}`;
  }
  loading.value = false;
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
</script>

<template>
  <ToolLayout title="🔧 DevTools">
    <template #toolbar-actions>
      <NButton
        size="small"
        :loading="loading"
        @click="loadAndInspect"
      >
        🔍 检查
      </NButton>
      <NButton
        size="small"
        :disabled="!output"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="dt-input">
        <NInput
          v-model:value="targetUrl"
          placeholder="输入 URL 进行检查"
        />
        <NButton
          type="primary"
          :loading="loading"
          block
          @click="loadAndInspect"
        >
          🔍 {{ loading ? '检查中...' : '检查页面' }}
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
.dt-input { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
</style>
