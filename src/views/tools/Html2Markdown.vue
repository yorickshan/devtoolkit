<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const input = ref('');
const output = ref('');

function htmlToMd(html: string): string {
  const md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="(.*?)"[^>]*alt="(.*?)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="(.*?)"[^>]*\/?>/gi, '![]($1)')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_: string, items: string) => items.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n'))
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_: string, items: string) => {
      let i = 1;
      return items.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${i++}. $1\n`);
    })
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_, q) => q.split('\n').map((l: string) => '> ' + l).join('\n'))
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return md;
}

function convert() {
  if (!input.value.trim()) { output.value = ''; return; }
  output.value = htmlToMd(input.value);
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
watch(input, convert);
</script>

<template>
  <ToolLayout title="📝 HTML → Markdown">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="convert"
      >
        ▶ 转换
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
        language="html"
      />
    </template>
    <template #output>
      <OutputPanel
        v-model="output"
        language="markdown"
      />
    </template>
  </ToolLayout>
</template>
