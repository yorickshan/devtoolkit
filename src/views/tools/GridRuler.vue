<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, onMounted, onUnmounted } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';

const message = useMessage();
const position = ref({ x: 0, y: 0 });
const color = ref('#1890ff');
const output = ref('');
const showRuler = ref(true);
let frameId = 0;

function update() {
  const canvas = document.querySelector('.ruler-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  ctx.scale(2, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  // Grid
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Crosshair
  ctx.strokeStyle = color.value;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(position.value.x, 0); ctx.lineTo(position.value.x, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, position.value.y); ctx.lineTo(w, position.value.y); ctx.stroke();
  ctx.setLineDash([]);

  // Position text
  ctx.fillStyle = '#333';
  ctx.font = '11px monospace';
  ctx.fillText(`X: ${position.value.x}  Y: ${position.value.y}`, position.value.x + 10, position.value.y - 10);

  output.value = `坐标: X=${position.value.x}, Y=${position.value.y}`;
}

function onMouseMove(e: MouseEvent) {
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  position.value = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) };
}

function animLoop() {
  update();
  frameId = requestAnimationFrame(animLoop);
}

onMounted(() => { frameId = requestAnimationFrame(animLoop); });
onUnmounted(() => cancelAnimationFrame(frameId));
</script>

<template>
  <ToolLayout title="📐 网格标尺">
    <template #toolbar-actions>
      <NButton
        size="small"
        @click="() => { if (output) { window.navigator.clipboard.writeText(output).then(()=>message.success(t('app.clipboard.copied'))); } }"
      >
        📋 复制坐标
      </NButton>
    </template>
    <template #input>
      <div class="ruler-info">
        <p>移动鼠标查看坐标</p>
        <p class="ruler-pos">
          X: {{ position.x }}px  Y: {{ position.y }}px
        </p>
      </div>
    </template>
    <template #output>
      <canvas
        class="ruler-canvas"
        @mousemove="onMouseMove"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.ruler-info { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.ruler-pos { font-size: 18px; font-family: monospace; color: var(--n-color-primary); font-weight: 600; }
.ruler-canvas { width: 100%; height: 100%; cursor: crosshair; }
</style>
