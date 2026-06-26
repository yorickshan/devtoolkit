<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NSelect, NInputNumber, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const input = ref('');
const output = ref('');
const fromUnit = ref('byte');
const toValue = ref(1);

const units = [
  { label: 'Byte (B)', value: 'byte', multiplier: 1 },
  { label: 'KB', value: 'kb', multiplier: 1024 },
  { label: 'MB', value: 'mb', multiplier: 1024 ** 2 },
  { label: 'GB', value: 'gb', multiplier: 1024 ** 3 },
  { label: 'TB', value: 'tb', multiplier: 1024 ** 4 },
  { label: 'PB', value: 'pb', multiplier: 1024 ** 5 },
];

function convert() {
  if (!input.value.trim()) { output.value = ''; return; }
  const val = parseFloat(input.value);
  if (isNaN(val)) { output.value = t('tools.invalidInput'); return; }
  const from = units.find(u => u.value === fromUnit.value)!;
  const bytes = val * from.multiplier;
  output.value = units.map(u =>
    `${u.label.padEnd(10)} ${(bytes / u.multiplier).toFixed(4).replace(/\.?0+$/, '')}`
  ).join('\n');
}

watch([input, fromUnit], convert);
</script>

<template>
  <ToolLayout title="💾 字节换算">
    <template #toolbar-actions>
      <NSelect
        v-model:value="fromUnit"
        :options="units.map(u => ({ label: u.label, value: u.value }))"
        size="small"
        style="width: 100px"
      />
    </template>
    <template #input>
      <div style="padding:16px;display:flex;flex-direction:column;gap:8px;height:100%">
        <p style="font-size:11px;color:var(--n-text-color-3);margin:0">
          输入数值（当前单位: {{ fromUnit.toUpperCase() }}）
        </p>
        <NInput
          v-model:value="input"
          type="textarea"
          placeholder="输入数值，如: 1024"
          :autosize="{ minRows: 1, maxRows: 4 }"
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
