<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInput, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const url = ref('https://example.com');
const output = ref('');
const loading = ref(false);

async function measure() {
  if (!url.value.trim()) return;
  loading.value = true;
  output.value = '正在测试...';
  const start = performance.now();
  try {
    // Simulate page timing (in Tauri, would use actual navigation)
    // For now, do a HEAD request to get timing info
    const t0 = performance.now();
    const res = await fetch(url.value, { mode: 'no-cors' });
    const t1 = performance.now();

    output.value = [
      `URL: ${url.value}`,
      `——————————————`,
      `DNS 查询: 模拟 (~5-50ms)`,
      `TCP 连接: 模拟 (~10-100ms)`,
      `TLS 握手: 模拟 (~20-200ms)`,
      `请求发送: ${(t1 - t0).toFixed(0)}ms`,
      `——————————————`,
      `总计: ${(performance.now() - start).toFixed(0)}ms`,
      `状态: ${res.type}`,
    ].join('\n');
  } catch (e) {
    output.value = `测试失败: ${(e as Error).message}`;
  }
  loading.value = false;
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
</script>

<template>
  <ToolLayout title="⏱️ 页面性能">
    <template #toolbar-actions>
      <NButton
        size="small"
        :loading="loading"
        @click="measure"
      >
        ▶ 测试
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
      <div class="perf-input">
        <NInput
          v-model:value="url"
          placeholder="输入 URL 测试性能"
        />
        <NButton
          type="primary"
          :loading="loading"
          block
          @click="measure"
        >
          🚀 {{ loading ? '测试中...' : '开始测试' }}
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
.perf-input { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
</style>
