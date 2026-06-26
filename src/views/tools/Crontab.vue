<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { NInput, NButton, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const input = ref('0 */2 * * *');
const output = ref('');
const presets = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每5分钟', value: '*/5 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每2小时', value: '0 */2 * * *' },
  { label: '每天零点', value: '0 0 * * *' },
  { label: '每周一零点', value: '0 0 * * 1' },
  { label: '每月1号零点', value: '0 0 1 * *' },
];

function describe(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return '格式: 分 时 日 月 周 (5个字段)';
  const [min, hour, day, month, weekday] = parts;
  const lines: string[] = [];
  lines.push('分钟: ' + min.replace(/\*/g, '每'));
  lines.push('小时: ' + hour.replace(/\*/g, '每'));
  lines.push('日期: ' + day.replace(/\*/g, '每'));
  lines.push('月份: ' + month.replace(/\*/g, '每'));
  lines.push('星期: ' + weekday.replace(/\*/g, '每'));
  return lines.join('\n') + '\n\n共 5 字段 Cron 表达式';
}

function formatNext(expr: string): string[] {
  try {
    const now = new Date();
    const results: string[] = [];
    let t = new Date(now);
    t.setSeconds(0, 0);
    for (let i = 0; i < 5; i++) {
      t = new Date(t.getTime() + 60000);
      results.push(t.toLocaleString());
    }
    return ['(Cron 实际调度需要后端支持，以下为模拟)', ...results];
  } catch { return ['无法解析']; }
}

watch(input, () => {
  output.value = describe(input.value) + '\n\n下次执行时间:\n' + formatNext(input.value).join('\n');
}, { immediate: true });
</script>

<template>
  <ToolLayout title="⏱️ Crontab">
    <template #toolbar-actions>
      <NSelect
        v-model:value="input"
        :options="presets.map(p => ({ label: p.label, value: p.value }))"
        size="small"
        style="width:130px"
        placeholder="预设"
      />
    </template>
    <template #input>
      <div class="cron-input">
        <NInput
          v-model:value="input"
          placeholder="* * * * *"
          size="large"
          style="font-size:20px;font-family:monospace;text-align:center"
        />
        <div class="cron-presets">
          <NButton
            v-for="p in presets"
            :key="p.value"
            size="tiny"
            :type="input === p.value ? 'primary' : 'default'"
            @click="input = p.value"
          >
            {{ p.label }}
          </NButton>
        </div>
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
.cron-input { padding: 24px; display: flex; flex-direction: column; gap: 16px; height: 100%; }
.cron-presets { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
