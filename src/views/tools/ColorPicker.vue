<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, computed } from 'vue';
import { NInput, NColorPicker, NButton, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const hexColor = ref('#1890ff');
const output = ref('');

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

const rgb = computed(() => {
  const c = hexToRgb(hexColor.value);
  return c ? `rgb(${c.r}, ${c.g}, ${c.b})` : '';
});

const hsl = computed(() => {
  const c = hexToRgb(hexColor.value);
  if (!c) return '';
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
});

function convert() {
  const c = hexToRgb(hexColor.value);
  if (!c) { output.value = t('tools.invalidInput'); return; }
  output.value = [
    `HEX: ${hexColor.value}`,
    `RGB: ${rgb.value}`,
    `HSL: ${hsl.value}`,
    `R: ${c.r}  G: ${c.g}  B: ${c.b}`,
  ].join('\n');
}

function handleCopy(val: string) {
  navigator.clipboard.writeText(val).then(() => message.success(t('app.clipboard.copied')));
}
</script>

<template>
  <ToolLayout title="🎨 颜色转换">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="convert"
      >
        ▶ 转换
      </NButton>
    </template>
    <template #input>
      <div class="cp-input">
        <NColorPicker
          v-model:value="hexColor"
          :modes="['hex']"
        />
        <NInput
          v-model:value="hexColor"
          placeholder="#1890ff"
        />
        <div
          class="cp-preview"
          :style="{ background: hexColor }"
        />
        <div class="cp-values">
          <div
            v-for="(val, label) in { HEX: hexColor, RGB: rgb, HSL: hsl }"
            :key="label"
            class="cp-row"
            @click="handleCopy(val)"
          >
            <span class="cp-label">{{ label }}</span>
            <code class="cp-value">{{ val }}</code>
          </div>
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
.cp-input { padding: 20px; display: flex; flex-direction: column; gap: 16px; align-items: center; height: 100%; }
.cp-preview { width: 120px; height: 120px; border-radius: 12px; border: 2px solid var(--n-border-color); }
.cp-values { width: 100%; max-width: 300px; }
.cp-row { display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.cp-row:hover { background: var(--n-color-hover); }
.cp-label { font-size: 12px; font-weight: 600; color: var(--n-text-color-3); }
.cp-value { font-size: 13px; font-family: monospace; color: var(--n-text-color); }
</style>
