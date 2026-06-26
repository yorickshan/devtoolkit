<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NCheckbox, NInputNumber, NSlider, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const length = ref(16);
const upper = ref(true);
const lower = ref(true);
const digits = ref(true);
const symbols = ref(true);
const count = ref(1);
const output = ref('');

const charSets: Record<string, string> = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
};

function generate() {
  let chars = '';
  if (upper.value) chars += charSets.upper;
  if (lower.value) chars += charSets.lower;
  if (digits.value) chars += charSets.digits;
  if (symbols.value) chars += charSets.symbols;
  if (!chars) { output.value = t('tools.invalidInput'); return; }

  const arr = new Uint32Array(length.value * count.value);
  crypto.getRandomValues(arr);
  const results: string[] = [];
  for (let i = 0; i < count.value; i++) {
    let pwd = '';
    for (let j = 0; j < length.value; j++) {
      pwd += chars[arr[i * length.value + j] % chars.length];
    }
    results.push(pwd);
  }
  output.value = results.join('\n');
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }

generate();
</script>

<template>
  <ToolLayout title="🔑 密码生成器">
    <template #toolbar-actions>
      <span style="font-size:11px;color:var(--n-text-color-3)">个数:</span>
      <NInputNumber
        v-model:value="count"
        :min="1"
        :max="50"
        size="small"
        style="width:70px"
      />
      <NButton
        size="small"
        @click="generate"
      >
        ▶ 生成
      </NButton>
      <NButton
        size="small"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="pwd-input">
        <div class="pwd-row">
          <span>长度: {{ length }}</span>
          <NSlider
            v-model:value="length"
            :min="6"
            :max="64"
            style="flex:1;margin:0 16px"
          />
        </div>
        <div class="pwd-checks">
          <NCheckbox v-model:checked="upper">
            大写 A-Z
          </NCheckbox>
          <NCheckbox v-model:checked="lower">
            小写 a-z
          </NCheckbox>
          <NCheckbox v-model:checked="digits">
            数字 0-9
          </NCheckbox>
          <NCheckbox v-model:checked="symbols">
            符号 !@#$%
          </NCheckbox>
        </div>
        <NButton
          type="primary"
          size="large"
          block
          @click="generate"
        >
          🔄 生成 {{ count }} 个密码
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

<style scoped>
.pwd-input { padding: 24px; display: flex; flex-direction: column; gap: 20px; height: 100%; }
.pwd-row { display: flex; align-items: center; font-size: 13px; color: var(--n-text-color); }
.pwd-checks { display: flex; flex-wrap: wrap; gap: 12px; }
</style>
