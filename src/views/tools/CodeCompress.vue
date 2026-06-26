<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch } from 'vue';
import { NButton, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const input = ref('');
const output = ref('');
const lang = ref<'js' | 'css' | 'html'>('js');

const langOptions = [
  { label: 'JavaScript', value: 'js' },
  { label: 'CSS', value: 'css' },
  { label: 'HTML', value: 'html' },
];

const monacoLang = { js: 'javascript', css: 'css', html: 'html' };

function compress() {
  if (!input.value.trim()) { output.value = ''; return; }
  let code = input.value;
  // Simple compress: remove comments, extra whitespace
  if (lang.value === 'js') {
    code = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\s+/g, ' ').replace(/\s*([{}();,:])\s*/g, '$1');
  } else if (lang.value === 'css') {
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
  } else {
    code = code.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/>\s+</g, '><');
  }
  output.value = code.trim();
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
watch(input, compress);
</script>

<template>
  <ToolLayout title="🗜️ 代码压缩">
    <template #toolbar-actions>
      <NSelect
        v-model:value="lang"
        :options="langOptions"
        size="small"
        style="width:120px"
      />
      <NButton
        size="small"
        @click="compress"
      >
        ▶ 压缩
      </NButton>
      <NButton
        size="small"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <InputPanel
        v-model="input"
        :language="monacoLang[lang]"
      />
    </template>
    <template #output>
      <OutputPanel
        v-model="output"
        :language="monacoLang[lang]"
      />
    </template>
  </ToolLayout>
</template>
