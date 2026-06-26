<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInput, NButton, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const date1 = ref('2026-01-01');
const date2 = ref('2026-12-31');
const output = ref('');

function compute() {
  const d1 = new Date(date1.value);
  const d2 = new Date(date2.value);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { output.value = '请选择有效日期'; return; }
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.floor(diffMs / 86400000);
  const weeks = +(days / 7).toFixed(1);
  const months = +(days / 30.44).toFixed(1);
  const years = +(days / 365.25).toFixed(2);
  const before = d1 < d2;
  output.value = [
    `${before ? date1.value : date2.value} → ${before ? date2.value : date1.value}`,
    `相差: ${days} 天`,
    `约 ${weeks} 周`,
    `约 ${months} 个月`,
    `约 ${years} 年`,
    '',
    `${days * 24} 小时`,
    `${days * 24 * 60} 分钟`,
    `${days * 24 * 60 * 60} 秒`,
  ].join('\n');
}

watch([date1, date2], compute, { immediate: true });
</script>

<template>
  <ToolLayout title="📅 日期计算器">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="compute"
      >
        ▶ 计算
      </NButton>
    </template>
    <template #input>
      <div class="dt-input">
        <div class="dt-row">
          <span>日期 1:</span>
          <NInput
            v-model:value="date1"
            placeholder="2026-01-01"
          />
        </div>
        <div class="dt-row">
          <span>日期 2:</span>
          <NInput
            v-model:value="date2"
            placeholder="2026-12-31"
          />
        </div>
        <p class="dt-hint">
          选择两个日期，自动计算差值
        </p>
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
.dt-input { padding: 24px; display: flex; flex-direction: column; gap: 16px; height: 100%; }
.dt-row { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.dt-hint { font-size: 11px; color: var(--n-text-color-3); margin-top: 8px; }
</style>
