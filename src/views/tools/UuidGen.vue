<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInputNumber, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const output = ref('');
const count = ref(5);
const mode = ref<'uuid-v4' | 'snowflake'>('uuid-v4');

function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateSnowflake(): string {
  const timestamp = BigInt(Date.now() - 1609459200000) << 22n;
  const machineId = (BigInt(Math.floor(Math.random() * 1024)) & 0x3FFn) << 12n;
  const sequence = BigInt(Math.floor(Math.random() * 4096)) & 0xFFFn;
  return (timestamp | machineId | sequence).toString();
}

function generate() {
  const results: string[] = [];
  for (let i = 0; i < count.value; i++) {
    results.push(mode.value === 'uuid-v4' ? generateUUIDv4() : generateSnowflake());
  }
  output.value = results.join('\n');
}

function handleCopy() {
  navigator.clipboard.writeText(output.value).then(() => message.success(`已复制 ${count.value} 个`));
}

generate();
</script>

<template>
  <ToolLayout title="🪪 UUID 生成">
    <template #toolbar-actions>
      <NSelect
        v-model:value="mode"
        :options="[{ label: 'UUID v4', value: 'uuid-v4' }, { label: 'Snowflake', value: 'snowflake' }]"
        size="small"
        style="width: 120px"
      />
      <span style="font-size:11px;color:var(--n-text-color-3)">数量:</span>
      <NInputNumber
        v-model:value="count"
        :min="1"
        :max="100"
        size="small"
        style="width: 80px"
      />
      <NButton
        size="small"
        @click="generate"
      >
        ▶ 生成
      </NButton>
      <NButton
        size="small"
        @click="handleCopy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div style="padding:24px;display:flex;align-items:center;justify-content:center;height:100%;gap:16px">
        <NButton
          type="primary"
          size="large"
          @click="generate"
        >
          🔄 生成 {{ count }} 个 {{ mode === 'uuid-v4' ? 'UUID v4' : 'Snowflake ID' }}
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
