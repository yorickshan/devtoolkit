<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch } from 'vue';
import { NButton, NSelect, useMessage } from 'naive-ui';
import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserTypescript from 'prettier/plugins/typescript';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserHtml from 'prettier/plugins/html';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserMarkdown from 'prettier/plugins/markdown';
import * as beautify from 'js-beautify';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const input = ref('');
const output = ref('');
const lang = ref('ts');
const mode = ref<'beautify' | 'minify'>('beautify');

const langOptions = [
  { label: 'TypeScript', value: 'ts' },
  { label: 'TSX', value: 'tsx' },
  { label: 'JavaScript', value: 'js' },
  { label: 'JSX', value: 'jsx' },
  { label: 'CSS', value: 'css' },
  { label: 'SCSS', value: 'scss' },
  { label: 'HTML', value: 'html' },
  { label: 'Vue', value: 'vue' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'JSON', value: 'json' },
];

const monacoLang: Record<string, string> = { ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript', css: 'css', scss: 'scss', html: 'html', vue: 'html', markdown: 'markdown', json: 'json' };

const prettierParsers: Record<string, string> = { ts: 'typescript', tsx: 'typescript', js: 'babel', jsx: 'babel', css: 'css', scss: 'css', html: 'html', vue: 'html', markdown: 'markdown', json: 'json' };

async function formatWithPrettier(code: string, parser: string): Promise<string> {
  if (mode.value === 'minify') {
    // Minify: use js-beautify for CSS/HTML, basic regex for JS/TS
    if (['js', 'jsx', 'ts', 'tsx'].includes(lang.value)) {
      return code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}();,:])\s*/g, '$1');
    }
    if (['css', 'scss'].includes(lang.value)) {
      return beautify.css(code, { indent_size: 0 });
    }
    return beautify.html(code, { indent_size: 0, max_preserve_newlines: 0 });
  }

  // Beautify with Prettier
  return await prettier.format(code, {
    parser: parser,
    plugins: [parserBabel, parserTypescript, parserPostcss, parserHtml, parserEstree, parserMarkdown],
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    printWidth: 100,
  });
}

async function process() {
  if (!input.value.trim()) { output.value = ''; return; }
  try {
    const parser = prettierParsers[lang.value] || 'html';
    output.value = await formatWithPrettier(input.value, parser);
  } catch (e) {
    // Fallback to js-beautify
    try {
      if (lang.value === 'css' || lang.value === 'scss') {
        output.value = beautify.css(input.value, { indent_size: mode.value === 'beautify' ? 2 : 0 });
      } else if (lang.value === 'html' || lang.value === 'vue') {
        output.value = beautify.html(input.value, { indent_size: mode.value === 'beautify' ? 2 : 0 });
      } else {
        output.value = beautify.js(input.value, { indent_size: mode.value === 'beautify' ? 2 : 0, max_preserve_newlines: mode.value === 'beautify' ? undefined : 0 });
      }
    } catch {
      output.value = `Error: ${(e as Error).message}`;
    }
  }
}

function handleCopy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }
function toggleMode() { mode.value = mode.value === 'beautify' ? 'minify' : 'beautify'; process(); }

watch([input, lang], () => { process(); });
</script>

<template>
  <ToolLayout title="🎨 代码美化">
    <template #toolbar-actions>
      <NSelect
        v-model:value="lang"
        :options="langOptions"
        size="small"
        style="width: 120px"
      />
      <NButton
        size="small"
        @click="toggleMode"
      >
        {{ mode === 'beautify' ? '压缩' : '美化' }}
      </NButton>
      <NButton
        size="small"
        @click="process"
      >
        ▶ {{ mode === 'beautify' ? '美化' : '压缩' }}
      </NButton>
      <NButton
        size="small"
        @click="handleCopy"
      >
        📋 复制
      </NButton>
      <span style="font-size:10px;color:var(--n-text-color-3)">Prettier</span>
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
