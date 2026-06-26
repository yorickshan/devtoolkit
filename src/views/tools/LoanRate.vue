<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NInputNumber, NSelect } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const amount = ref(1000000);
const rate = ref(3.5);
const years = ref(30);
const type = ref<'equal' | 'principal'>('equal');
const output = ref('');

function compute() {
  const monthlyRate = rate.value / 100 / 12;
  const months = years.value * 12;
  let totalInterest = 0;
  const lines: string[] = [];

  if (type.value === 'equal') {
    const monthly = (amount.value * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    totalInterest = monthly * months - amount.value;
    lines.push('等额本息还款方案');
    lines.push(`月供: ¥${monthly.toFixed(2)}`);
    lines.push(`总还款: ¥${(amount.value + totalInterest).toFixed(2)}`);
    lines.push(`总利息: ¥${totalInterest.toFixed(2)}`);
  } else {
    const monthlyPrincipal = amount.value / months;
    const firstMonthly = monthlyPrincipal + amount.value * monthlyRate;
    lines.push('等额本金还款方案');
    lines.push(`首月月供: ¥${firstMonthly.toFixed(2)}`);
    let remaining = amount.value;
    for (let i = 0; i < months; i++) {
      const interest = remaining * monthlyRate;
      totalInterest += interest;
      remaining -= monthlyPrincipal;
    }
    lines.push(`总利息: ¥${totalInterest.toFixed(2)}`);
    lines.push(`总还款: ¥${(amount.value + totalInterest).toFixed(2)}`);
  }
  output.value = lines.join('\n');
}

watch([amount, rate, years, type], compute, { immediate: true });
</script>

<template>
  <ToolLayout title="🏦 贷款计算器">
    <template #toolbar-actions>
      <NSelect
        v-model:value="type"
        :options="[{label:'等额本息',value:'equal'},{label:'等额本金',value:'principal'}]"
        size="small"
        style="width:110px"
      />
    </template>
    <template #input>
      <div class="loan-input">
        <div class="loan-row">
          <span>贷款金额 (元)</span><NInputNumber
            v-model:value="amount"
            :min="10000"
            :step="10000"
          />
        </div>
        <div class="loan-row">
          <span>年利率 (%)</span><NInputNumber
            v-model:value="rate"
            :min="0.1"
            :step="0.1"
          />
        </div>
        <div class="loan-row">
          <span>贷款年限</span><NInputNumber
            v-model:value="years"
            :min="1"
            :max="50"
          />
        </div>
        <p class="loan-hint">
          自动计算月供和总利息
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
.loan-input { padding: 24px; display: flex; flex-direction: column; gap: 16px; height: 100%; }
.loan-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.loan-hint { font-size: 11px; color: var(--n-text-color-3); margin-top: auto; }
</style>
