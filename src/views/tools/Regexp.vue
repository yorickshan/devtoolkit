<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { NButton, NInput, NCheckbox, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import InputPanel from '@/components/common/InputPanel.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const pattern = ref('');
const flags = ref('g');
const testInput = ref('');
const output = ref('');
const globalFlag = ref(true);
const caseInsensitive = ref(false);

const computedFlags = computed(() => {
  let f = '';
  if (globalFlag.value) f += 'g';
  if (caseInsensitive.value) f += 'i';
  return f;
});

function run() {
  if (!pattern.value) { output.value = ''; return; }
  try {
    const re = new RegExp(pattern.value, computedFlags.value);
    const matches = testInput.value.match(re);
    if (matches) {
      output.value = `匹配 ${matches.length} 个结果:\n` + matches.map((m, i) => `[${i}] ${m}`).join('\n');
    } else {
      output.value = '无匹配结果';
    }
  } catch (e) { output.value = `正则错误: ${(e as Error).message}`; }
}

watch([pattern, testInput, computedFlags], run);
</script>

<template>
  <ToolLayout title="📝 正则测试">
    <template #toolbar-actions>
      <NCheckbox
        v-model:checked="globalFlag"
        size="small"
      >
        全局(g)
      </NCheckbox>
      <NCheckbox
        v-model:checked="caseInsensitive"
        size="small"
      >
        忽略大小写(i)
      </NCheckbox>
      <NButton
        size="small"
        @click="run"
      >
        ▶ 执行
      </NButton>
    </template>
    <template #input>
      <div style="display:flex;flex-direction:column;height:100%">
        <div style="padding:8px 12px;border-bottom:1px solid var(--n-border-color);display:flex;gap:8px;align-items:center">
          <span style="font-size:11px;white-space:nowrap;color:var(--n-text-color-3)">正则:</span>
          <span style="font-size:12px;color:var(--n-color-primary);white-space:nowrap">/</span>
          <NInput
            v-model:value="pattern"
            size="small"
            placeholder="正则表达式"
            style="flex:1"
          />
          <span style="font-size:12px;color:var(--n-color-primary);white-space:nowrap">/{{ computedFlags }}</span>
        </div>
        <div style="flex:1;overflow:hidden">
          <InputPanel
            v-model="testInput"
            language="plaintext"
          />
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
