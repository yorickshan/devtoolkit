<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, NColorPicker, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';

const message = useMessage();
const title = ref('Hello World');
const subtitle = ref('');
const bgColor = ref('#1890ff');
const textColor = ref('#ffffff');
const width = ref(800);
const height = ref(400);
const posterSvg = ref('');

function generate() {
  const w = width.value, h = height.value;
  posterSvg.value = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${bgColor.value}" rx="12"/>
  <text x="${w/2}" y="${h/2 - 10}" text-anchor="middle" fill="${textColor.value}" font-family="sans-serif" font-size="36" font-weight="bold">${title.value}</text>
  <text x="${w/2}" y="${h/2 + 30}" text-anchor="middle" fill="${textColor.value}" font-family="sans-serif" font-size="18" opacity="0.85">${subtitle.value}</text>
</svg>`;
}

function downloadPng() {
  const canvas = document.createElement('canvas');
  canvas.width = width.value;
  canvas.height = height.value;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor.value;
  ctx.beginPath();
  ctx.roundRect(0, 0, width.value, height.value, 12);
  ctx.fill();
  ctx.fillStyle = textColor.value;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.value, width.value / 2, height.value / 2 - 10);
  ctx.font = '18px sans-serif';
  ctx.fillText(subtitle.value, width.value / 2, height.value / 2 + 30);
  const a = document.createElement('a');
  a.download = 'poster.png';
  a.href = canvas.toDataURL();
  a.click();
}

function copySvg() {
  navigator.clipboard.writeText(posterSvg.value).then(() => message.success('SVG 已复制'));
}
</script>

<template>
  <ToolLayout title="🖼️ 海报生成">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="generate"
      >
        ▶ 生成
      </NButton>
      <NButton
        size="small"
        @click="downloadPng"
      >
        💾 下载 PNG
      </NButton>
      <NButton
        size="small"
        @click="copySvg"
      >
        📋 复制 SVG
      </NButton>
    </template>
    <template #input>
      <div class="poster-input">
        <div class="poster-row">
          <span>标题</span><NInput v-model:value="title" />
        </div>
        <div class="poster-row">
          <span>副标题</span><NInput v-model:value="subtitle" />
        </div>
        <div class="poster-row">
          <span>背景色</span><NColorPicker v-model:value="bgColor" />
        </div>
        <div class="poster-row">
          <span>文字色</span><NColorPicker v-model:value="textColor" />
        </div>
        <div class="poster-row">
          <span>尺寸</span>
          <input
            v-model.number="width"
            type="number"
            style="width:70px"
          > × <input
            v-model.number="height"
            type="number"
            style="width:70px"
          >
        </div>
        <NButton
          type="primary"
          block
          @click="generate"
        >
          🔄 生成海报
        </NButton>
      </div>
    </template>
    <template #output>
      <div
        class="poster-output"
        v-html="posterSvg"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.poster-input { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.poster-row { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.poster-row span { min-width: 60px; color: var(--n-text-color-3); }
.poster-output { padding: 16px; overflow: auto; display: flex; align-items: center; justify-content: center; height: 100%; }
.poster-output :deep(svg) { max-width: 100%; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
</style>
