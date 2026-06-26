<script setup lang="ts">
import { ref, watch } from 'vue';
import { NInput } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const input = ref('');
const output = ref('');

function convert() {
  const val = input.value.trim();
  if (!val) { output.value = ''; return; }
  try {
    // Auto-detect: strip prefixes (0x, 0o, 0b) and parse
    let num: number;
    const s = val.toLowerCase();
    if (s.startsWith('0x')) num = parseInt(s.slice(2), 16);
    else if (s.startsWith('0b')) num = parseInt(s.slice(2), 2);
    else if (s.startsWith('0o')) num = parseInt(s.slice(2), 8);
    else num = parseInt(s, 10);
    if (isNaN(num)) { output.value = t('tools.invalidInput'); return; }
    output.value = [
      `二进制 (Bin): 0b${num.toString(2)}`,
      `八进制 (Oct): 0o${num.toString(8)}`,
      `十进制 (Dec): ${num}`,
      `十六进制 (Hex): 0x${num.toString(16).toUpperCase()}`,
    ].join('\n');
  } catch { output.value = t('tools.conversionError'); }
}

watch(input, convert);
</script>

<template>
  <ToolLayout title="🔢 进制转换">
    <template #toolbar-actions>
      <span style="font-size:11px;color:var(--n-text-color-3)">支持前缀: 0x(Hex) 0b(Bin) 0o(Oct)</span>
    </template>
    <template #input>
      <div style="padding:16px;display:flex;flex-direction:column;gap:8px;height:100%">
        <NInput
          v-model:value="input"
          type="textarea"
          placeholder="输入数值，如: 255 / 0xFF / 0b11111111 / 0o377"
          :autosize="{ minRows: 3, maxRows: 10 }"
        />
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
