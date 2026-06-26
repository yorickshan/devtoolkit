<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const mode = ref<'unix-to-date' | 'date-to-unix' | 'now'>('unix-to-date');
const unixInput = ref(Date.now().toString());
const dateInput = ref('');
const output = ref('');

const modes = [
  { label: 'Unix → 日期', value: 'unix-to-date' },
  { label: '日期 → Unix', value: 'date-to-unix' },
  { label: '当前时间', value: 'now' },
];

function convert() {
  try {
    switch (mode.value) {
      case 'unix-to-date': {
        let ts = parseInt(unixInput.value);
        if (unixInput.value.length > 13) ts = Math.floor(ts / 1000); // milliseconds
        if (unixInput.value.length <= 10) ts = ts * 1000;
        const d = new Date(ts);
        output.value = `${d.toLocaleString()} (${d.toISOString()})`;
        break;
      }
      case 'date-to-unix': {
        const d = new Date(dateInput.value);
        output.value = `秒: ${Math.floor(d.getTime() / 1000)}\n毫秒: ${d.getTime()}`;
        break;
      }
      case 'now': {
        const n = Date.now();
        output.value = `秒: ${Math.floor(n / 1000)}\n毫秒: ${n}\n${new Date(n).toLocaleString()}\n${new Date(n).toISOString()}`;
        break;
      }
    }
  } catch { output.value = t('tools.conversionError'); }
}

watch([mode, unixInput, dateInput], convert, { immediate: true });
</script>

<template>
  <ToolLayout title="⏰ 时间戳转换">
    <template #toolbar-actions>
      <NSelect
        v-model:value="mode"
        :options="modes"
        size="small"
        style="width: 140px"
      />
    </template>
    <template #input>
      <div
        class="ts-input"
        style="padding:16px;display:flex;flex-direction:column;gap:12px;height:100%"
      >
        <div v-if="mode==='unix-to-date'">
          <p style="font-size:11px;color:var(--n-text-color-3);margin:0 0 4px">
            Unix 时间戳（秒/毫秒）
          </p>
          <NInput
            v-model:value="unixInput"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
          />
        </div>
        <div v-if="mode==='date-to-unix'">
          <p style="font-size:11px;color:var(--n-text-color-3);margin:0 0 4px">
            日期字符串
          </p>
          <NInput
            v-model:value="dateInput"
            placeholder="2024-01-01 00:00:00"
          />
        </div>
        <p
          v-if="mode==='now'"
          style="color:var(--n-text-color-3)"
        >
          自动显示当前时间
        </p>
        <NButton
          size="small"
          @click="convert"
        >
          ▶ 转换
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
