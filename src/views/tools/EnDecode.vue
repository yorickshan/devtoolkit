<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, watch, computed } from 'vue';
import { NButton, NSelect, NTag, NInput, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const input = ref('');
const output = ref('');
const autoMode = ref(true);
const selectedOp = ref('base64-encode');
const loading = ref(false);

const operations = [
  { label: 'Base64 编码', value: 'base64-encode' },
  { label: 'Base64 解码', value: 'base64-decode' },
  { label: 'URL 编码', value: 'url-encode' },
  { label: 'URL 解码', value: 'url-decode' },
  { label: 'Unicode 编码', value: 'unicode-encode' },
  { label: 'Unicode 解码', value: 'unicode-decode' },
  { label: 'MD5', value: 'md5' },
  { label: 'SHA-1', value: 'sha1' },
  { label: 'HTML 实体编码', value: 'html-encode' },
  { label: 'HTML 实体解码', value: 'html-decode' },
  { label: 'JWT 解码', value: 'jwt-decode' },
  { label: 'Gzip 压缩', value: 'gzip-encode' },
  { label: 'Gzip 解压', value: 'gzip-decode' },
];

// === Smart auto-decoder (adapted from ai-decode-analyzer) ===
interface DecodeState {
  text: string;
  operations: string[];
  meta: string;
}

const MAX_DEPTH = 3;
const MAX_CANDIDATES = 6;

// Decode operations (return decoded text or null)
function tryDecode(text: string): DecodeState[] {
  const results: DecodeState[] = [];
  const tried = new Set<string>();

  function tryOp(op: string, fn: () => string | null) {
    if (tried.has(op)) return;
    try {
      const result = fn();
      if (result && result !== text) {
        results.push({ text: result, operations: [op], meta: '' });
        tried.add(op);
      }
    } catch { /* skip */ }
  }

  // Base64: contains A-Za-z0-9+/= with padding or url-safe
  if (/^[A-Za-z0-9+/=_-]+$/.test(text.trim()) && text.length > 4) {
    tryOp('base64-decode', () => {
      let t = text.trim();
      t = t.replace(/-/g, '+').replace(/_/g, '/');
      while (t.length % 4) t += '=';
      return decodeURIComponent(escape(atob(t)));
    });
    tryOp('base64-decode-raw', () => {
      let t = text.trim();
      t = t.replace(/-/g, '+').replace(/_/g, '/');
      while (t.length % 4) t += '=';
      return atob(t);
    });
  }

  // URL encoded: contains %XX
  if (/%[0-9A-Fa-f]{2}/.test(text)) {
    tryOp('url-decode', () => {
      try { return decodeURIComponent(text); } catch { return null; }
    });
  }

  // Unicode escapes: contains \uXXXX
  if (/\\u[0-9a-fA-F]{4}/.test(text)) {
    tryOp('unicode-decode', () => text.replace(/\\u([0-9a-fA-F]{4})/g, (_m, h) => String.fromCharCode(parseInt(h, 16))));
  }

  // JWT: three dot-separated base64 parts
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(text.trim())) {
    tryOp('jwt-decode', () => {
      const parts = text.split('.');
      if (parts.length !== 3) return null;
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      return JSON.stringify({ header, payload }, null, 2);
    });
  }

  // HTML entities
  if (/&[a-z]+;|&#\d+;/i.test(text)) {
    tryOp('html-decode', () => {
      return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&#x27;/g, m => {
        const map: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#x27;': "'" };
        return map[m] || m;
      });
    });
  }

  // Hex string
  if (/^[0-9a-fA-F]+$/.test(text.trim()) && text.length % 2 === 0) {
    tryOp('hex-decode', () => {
      const bytes = text.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) ?? [];
      if (bytes.length === 0) return null;
      return new TextDecoder().decode(new Uint8Array(bytes));
    });
  }

  // JSON in quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    tryOp('unquote', () => {
      try { return JSON.parse(text); } catch { return text.slice(1, -1); }
    });
  }

  // Is it valid JSON?
  try {
    const p = JSON.parse(text);
    if (typeof p === 'object' && p !== null) {
      tryOp('pretty-json', () => JSON.stringify(p, null, 2));
    }
  } catch { /* not JSON */ }

  return results.slice(0, MAX_CANDIDATES);
}

// Chain analysis: try decode recursively
const analysisResult = ref<{ chain: string[]; final: string; steps: string[] } | null>(null);

watch(input, (val) => {
  if (!val.trim() || !autoMode.value) { analysisResult.value = null; return; }
  let current = val;
  const steps: string[] = [];
  const chain: string[] = [];
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const candidates = tryDecode(current);
    if (candidates.length === 0) break;
    // Pick the best: prefer JSON, then shortest non-empty
    candidates.sort((a, b) => {
      const aJson = a.text.startsWith('{') || a.text.startsWith('[');
      const bJson = b.text.startsWith('{') || b.text.startsWith('[');
      if (aJson !== bJson) return bJson ? 1 : -1;
      return a.text.length - b.text.length;
    });
    const best = candidates[0];
    chain.push(best.operations[0]);
    steps.push(`${best.operations[0]}: ${current.slice(0, 50)}${current.length > 50 ? '...' : ''} -> ${best.text.slice(0, 50)}${best.text.length > 50 ? '...' : ''}`);
    current = best.text;
    if (current === val) break; // no progress
  }
  analysisResult.value = { chain, final: current, steps };
}, { immediate: true });

// === Manual operations ===
function base64Encode(str: string): string { return btoa(unescape(encodeURIComponent(str))); }
function base64Decode(str: string): string { try { return decodeURIComponent(escape(atob(str))); } catch { return atob(str); } }
function uniEncode(str: string): string { return str.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''); }
function uniDecode(str: string): string { return str.replace(/\\u([0-9a-fA-F]{4})/g, (_m, h) => String.fromCharCode(parseInt(h, 16))); }
function htmlEncode(s: string): string { return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] ?? m)); }
function htmlDecode(s: string): string { return s.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'" }[m] ?? m)); }

async function process() {
  if (!input.value.trim()) { output.value = ''; return; }
  loading.value = true;
  try {
    switch (selectedOp.value) {
      case 'base64-encode': output.value = base64Encode(input.value); break;
      case 'base64-decode': output.value = base64Decode(input.value); break;
      case 'url-encode': output.value = encodeURIComponent(input.value); break;
      case 'url-decode': output.value = decodeURIComponent(input.value); break;
      case 'unicode-encode': output.value = uniEncode(input.value); break;
      case 'unicode-decode': output.value = uniDecode(input.value); break;
      case 'md5': { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value)); output.value = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32); break; }
      case 'sha1': { const h = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input.value)); output.value = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''); break; }
      case 'html-encode': output.value = htmlEncode(input.value); break;
      case 'html-decode': output.value = htmlDecode(input.value); break;
      case 'jwt-decode': {
        const p = input.value.split('.');
        if (p.length !== 3) { output.value = 'Invalid JWT'; break; }
        output.value = JSON.stringify({ header: JSON.parse(atob(p[0])), payload: JSON.parse(atob(p[1])) }, null, 2);
        break;
      }
      case 'gzip-encode': {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(new TextEncoder().encode(input.value));
        writer.close();
        const reader = stream.readable.getReader();
        const chunks: Uint8Array[] = [];
        while (true) { const { done, value } = await reader.read(); if (done) break; if (value) chunks.push(value); }
        const total = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
        let off = 0; for (const c of chunks) { total.set(c, off); off += c.length; }
        output.value = btoa(String.fromCharCode(...total));
        break;
      }
      case 'gzip-decode': {
        const binary = atob(input.value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const reader = stream.readable.getReader();
        const chunks: Uint8Array[] = [];
        while (true) { const { done, value } = await reader.read(); if (done) break; if (value) chunks.push(value); }
        const total = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
        let off = 0; for (const c of chunks) { total.set(c, off); off += c.length; }
        output.value = new TextDecoder().decode(total);
        break;
      }
    }
  } catch (e) { output.value = `Error: ${(e as Error).message}`; }
  loading.value = false;
}

function handleCopy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }

watch([input, selectedOp], () => { if (!autoMode.value) process(); });
</script>

<template>
  <ToolLayout title="🔤 编解码">
    <template #toolbar-actions>
      <NButton
        size="tiny"
        :type="autoMode ? 'primary' : 'default'"
        style="margin-right:4px"
        @click="autoMode = !autoMode"
      >
        {{ autoMode ? '🤖 智能' : '🔧 手动' }}
      </NButton>
      <NSelect
        v-if="!autoMode"
        v-model:value="selectedOp"
        :options="operations"
        size="small"
        style="width: 160px"
      />
      <NButton
        v-if="!autoMode"
        size="small"
        :loading="loading"
        @click="process"
      >
        ▶ 执行
      </NButton>
      <NButton
        size="small"
        @click="handleCopy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div style="display:flex;flex-direction:column;height:100%">
        <div
          v-if="autoMode"
          style="padding:4px 12px;font-size:10px;color:var(--n-color-primary);background:var(--n-color-embedded);border-bottom:1px solid var(--n-border-color)"
        >
          🤖 智能识别模式 — 自动分析多层编码链
        </div>
        <div style="flex:1;overflow:hidden">
          <InputPanel v-model="input" />
        </div>
        <div
          v-if="autoMode && analysisResult && analysisResult.chain.length > 0"
          style="padding:4px 12px;border-top:1px solid var(--n-border-color);background:var(--n-color-embedded);display:flex;gap:4px;flex-wrap:wrap;align-items:center"
        >
          <span style="font-size:10px;color:var(--n-text-color-3)">识别链:</span>
          <NTag
            v-for="(op, i) in analysisResult.chain"
            :key="i"
            size="small"
            :bordered="false"
          >
            {{ op }}
          </NTag>
          <span style="margin-left:auto;font-size:10px;color:var(--n-text-color-3)">{{ analysisResult.steps.length }} 层</span>
        </div>
      </div>
    </template>
    <template #output>
      <div style="display:flex;flex-direction:column;height:100%">
        <div
          v-if="autoMode && analysisResult && analysisResult.chain.length > 0"
          style="padding:4px 12px;border-bottom:1px solid var(--n-border-color)"
        >
          <div
            v-for="(s, i) in analysisResult.steps"
            :key="i"
            style="font-size:10px;color:var(--n-text-color-3);font-family:monospace;line-height:1.5"
          >
            {{ s }}
          </div>
        </div>
        <div style="flex:1;overflow:hidden">
          <OutputPanel :model-value="autoMode ? (analysisResult?.final ?? '') : output" />
        </div>
      </div>
    </template>
  </ToolLayout>
</template>
