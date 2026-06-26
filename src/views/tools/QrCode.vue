<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import QRCode from 'qrcode';
import ToolLayout from '@/components/shell/ToolLayout.vue';

const message = useMessage();
const inputText = ref('https://devtoolkit.app');
const qrDataUrl = ref('');
const qrSize = ref(300);

const sizeOptions = [
  { label: '200px', value: 200 },
  { label: '300px', value: 300 },
  { label: '400px', value: 400 },
];

async function generateQR() {
  if (!inputText.value.trim()) { qrDataUrl.value = ''; return; }
  try {
    qrDataUrl.value = await QRCode.toDataURL(inputText.value, {
      width: qrSize.value, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch (e) { message.error(`QR 生成失败: ${(e as Error).message}`); }
}

function saveQR() {
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = qrDataUrl.value;
  link.click();
}

watch([inputText, qrSize], generateQR, { immediate: true });
</script>

<template>
  <ToolLayout title="📱 二维码">
    <template #toolbar-actions>
      <NSelect
        v-model:value="qrSize"
        :options="sizeOptions"
        size="small"
        style="width: 100px"
      />
      <NButton
        size="small"
        :disabled="!qrDataUrl"
        @click="saveQR"
      >
        💾 保存
      </NButton>
    </template>
    <template #input>
      <div class="qr-input">
        <NInput
          v-model:value="inputText"
          type="textarea"
          placeholder="输入文本或 URL..."
          :autosize="{ minRows: 3, maxRows: 10 }"
        />
        <p class="qr-hint">
          支持普通文本、URL、WiFi 配置、vCard 等格式
        </p>
      </div>
    </template>
    <template #output>
      <div class="qr-output">
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR Code"
          class="qr-image"
        >
        <p
          v-else
          class="qr-empty"
        >
          输入内容生成二维码
        </p>
      </div>
    </template>
  </ToolLayout>
</template>

<style scoped>
.qr-input { padding: 16px; display: flex; flex-direction: column; gap: 8px; height: 100%; }
.qr-hint { font-size: 11px; color: var(--n-text-color-3); }
.qr-output { display: flex; align-items: center; justify-content: center; height: 100%; background: #fff; }
.qr-image { max-width: 100%; max-height: 100%; object-fit: contain; }
.qr-empty { color: var(--n-text-color-3); font-size: 13px; }
</style>
