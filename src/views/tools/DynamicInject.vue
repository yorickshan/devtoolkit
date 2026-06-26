<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const script = ref('');
const mode = ref<'css' | 'js'>('css');
const output = ref('');

function inject() {
  if (!script.value.trim()) { output.value = '请输入内容'; return; }
  const type = mode.value === 'css' ? 'CSS' : 'JavaScript';
  const content = mode.value === 'css'
    ? '<style>' + script.value + '</style>'
    : '<scr' + 'ipt>' + script.value + '</scr' + 'ipt>';

  output.value = [
    '[' + type + ' 动态注入]',
    '注入方式: ' + (mode.value === 'css' ? 'Style Tag' : 'Script Tag'),
    '内容长度: ' + script.value.length + ' 字符',
    '',
    '注入代码:',
    content,
    '',
    '在 Tauri 桌面环境中，动态注入可通过 WebView evaluateJavascript 实现',
  ].join('\n');
  message.success(type + ' 注入代码已准备');
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
</script>

<template>
  <ToolLayout title="💉 动态注入">
    <template #toolbar-actions>
      <NSelect
        v-model:value="mode"
        :options="[{label:'CSS',value:'css'},{label:'JS',value:'js'}]"
        size="small"
        style="width:80px"
      />
      <NButton
        size="small"
        @click="inject"
      >
        ▶ 注入
      </NButton>
      <NButton
        size="small"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="di-input">
        <p class="di-label">
          {{ mode === 'css' ? 'CSS 样式代码' : 'JavaScript 代码' }}:
        </p>
        <NInput
          v-model:value="script"
          type="textarea"
          placeholder="body { background: #f0f0f0; }"
          :autosize="{ minRows: 4, maxRows: 15 }"
        />
        <NButton
          type="primary"
          block
          @click="inject"
        >
          💉 注入 {{ mode === 'css' ? 'CSS' : 'JS' }}
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
.di-input { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.di-label { font-size: 12px; color: var(--n-text-color-3); }
</style>
