<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const imageDataUrl = ref('');
const output = ref('');
const dimensions = ref('');

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imageDataUrl.value = reader.result as string;
    const img = new Image();
    img.onload = () => {
      dimensions.value = `${img.width} × ${img.height}`;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL(file.type || 'image/png');
      output.value = base64;
    };
    img.src = imageDataUrl.value;
  };
  reader.readAsDataURL(file);
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success('Base64 已复制')); }
</script>

<template>
  <ToolLayout title="🖼️ 图片 → Base64">
    <template #toolbar-actions>
      <NButton
        size="small"
        :disabled="!output"
        @click="copy"
      >
        📋 复制 Base64
      </NButton>
    </template>
    <template #input>
      <div class="img-input">
        <input
          type="file"
          accept="image/*"
          class="img-file"
          @change="onFileSelect"
        >
        <p class="img-hint">
          选择图片文件，自动转为 Base64
        </p>
        <img
          v-if="imageDataUrl"
          :src="imageDataUrl"
          class="img-preview"
        >
        <p
          v-if="dimensions"
          class="img-dims"
        >
          {{ dimensions }}
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
.img-input { padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; height: 100%; overflow: auto; }
.img-file { font-size: 13px; }
.img-hint { font-size: 12px; color: var(--n-text-color-3); }
.img-preview { max-width: 300px; max-height: 200px; object-fit: contain; border-radius: 8px; border: 1px solid var(--n-border-color); }
.img-dims { font-size: 12px; color: var(--n-color-primary); }
</style>
