<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInputNumber, useMessage } from 'naive-ui';
import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';
import ToolLayout from '@/components/shell/ToolLayout.vue';

const message = useMessage();
const capturedImage = ref('');
const isCapturing = ref(false);
const regionMode = ref(false);
const regionX = ref(0);
const regionY = ref(0);
const regionW = ref(400);
const regionH = ref(300);

async function captureScreen() {
  isCapturing.value = true;
  try {
    const args: Record<string, unknown> = {};
    if (regionMode.value) {
      args.region = { x: regionX.value, y: regionY.value, width: regionW.value, height: regionH.value };
    }
    const filePath = await invoke<string>('capture_screenshot', args);
    capturedImage.value = convertFileSrc(filePath);
    message.success(regionMode.value ? '区域截图成功' : '全屏截图成功');
  } catch (e) {
    message.error(`截图失败: ${(e as Error).message}`);
  }
  isCapturing.value = false;
}

async function copyImage() {
  try {
    const canvas = document.createElement('canvas');
    const img = document.querySelector('.screenshot-output img') as HTMLImageElement;
    if (!img) { message.warning('暂无截图'); return; }
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
    if (!blob) { message.error('转换失败'); return; }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    message.success(t('app.clipboard.copied'));
  } catch { message.error(t('app.clipboard.copyFail')); }
}
</script>

<template>
  <ToolLayout title="📸 截图">
    <template #toolbar-actions>
      <NButton size="tiny" :type="!regionMode ? 'primary' : 'default'" @click="regionMode = false">全屏</NButton>
      <NButton size="tiny" :type="regionMode ? 'primary' : 'default'" @click="regionMode = true">区域</NButton>
      <NButton type="primary" size="small" :loading="isCapturing" @click="captureScreen">
        📷 {{ regionMode ? '截取区域' : '截取全屏' }}
      </NButton>
      <NButton size="small" :disabled="!capturedImage" @click="copyImage">📋 复制图片</NButton>
    </template>
    <template #input>
      <div class="sc-input">
        <div v-if="regionMode" class="sc-region">
          <div class="sc-field"><label>X</label><NInputNumber v-model:value="regionX" :min="0" size="small" /></div>
          <div class="sc-field"><label>Y</label><NInputNumber v-model:value="regionY" :min="0" size="small" /></div>
          <div class="sc-field"><label>W</label><NInputNumber v-model:value="regionW" :min="1" size="small" /></div>
          <div class="sc-field"><label>H</label><NInputNumber v-model:value="regionH" :min="1" size="small" /></div>
        </div>
        <NButton size="large" :loading="isCapturing" style="width:200px;height:60px" @click="captureScreen">
          📷 {{ isCapturing ? '截图中...' : (regionMode ? '截取区域' : '点击截取全屏') }}
        </NButton>
        <p class="sc-hint">{{ regionMode ? '设置 X/Y/W/H 参数框选区域' : '截图后将在此处预览，支持复制到剪贴板' }}</p>
      </div>
    </template>
    <template #output>
      <div class="sc-output">
        <img v-if="capturedImage" :src="capturedImage" alt="Screenshot">
        <p v-else class="sc-empty">暂无截图</p>
      </div>
    </template>
  </ToolLayout>
</template>

<style scoped>
.sc-input { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; }
.sc-region { display: flex; gap: 8px; }
.sc-field { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: var(--n-text-color-3); }
.sc-field label { font-weight: 600; }
.sc-hint { font-size: 12px; color: var(--n-text-color-3); }
.sc-output { display: flex; align-items: center; justify-content: center; height: 100%; overflow: auto; background: #f0f0f0; }
.sc-output img { max-width: 100%; max-height: 100%; object-fit: contain; }
.sc-empty { color: var(--n-text-color-3); }
</style>
