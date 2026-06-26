<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { NButton, NInput, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';

const message = useMessage();
const chartType = ref<'bar' | 'line' | 'pie'>('bar');
const dataInput = ref('[{"label":"A","value":30},{"label":"B","value":70},{"label":"C","value":45}]');
const chartCanvas = ref<HTMLCanvasElement | null>(null);

function drawChart() {
  const canvas = chartCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  ctx.scale(2, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  ctx.clearRect(0, 0, w, h);
  try {
    const data: Array<{ label: string; value: number }> = JSON.parse(dataInput.value);
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    const max = Math.max(...data.map(d => d.value));
    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    // Axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.stroke();

    if (chartType.value === 'pie') {
      const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 20;
      let angle = -Math.PI / 2;
      data.forEach((d, i) => {
        const slice = (d.value / data.reduce((s, x) => s + x.value, 0)) * Math.PI * 2;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle, angle + slice);
        ctx.closePath();
        ctx.fill();
        const mid = angle + slice / 2;
        const lx = cx + Math.cos(mid) * (r * 0.6);
        const ly = cy + Math.sin(mid) * (r * 0.6);
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText(d.label, lx - 10, ly + 4);
        angle += slice;
      });
    } else {
      const barW = cw / data.length * 0.6;
      const gap = cw / data.length * 0.4;
      data.forEach((d, i) => {
        const barH = (d.value / max) * ch;
        const x = pad.left + i * (barW + gap) + gap / 2;
        const y = h - pad.bottom - barH;

        if (chartType.value === 'bar') {
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(x, y, barW, barH);
        } else if (chartType.value === 'line' && i > 0) {
          const prev = data[i - 1];
          const px = pad.left + (i - 1) * (barW + gap) + gap / 2 + barW / 2;
          const py = h - pad.bottom - (prev.value / max) * ch;
          ctx.strokeStyle = colors[i % colors.length];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x + barW / 2, y);
          ctx.stroke();
        }
        ctx.fillStyle = '#333';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barW / 2, h - pad.bottom + 14);
        ctx.fillText(String(d.value), x + barW / 2, y - 4);
      });

      if (chartType.value === 'line') {
        data.forEach((d, i) => {
          const x = pad.left + i * (barW + gap) + gap / 2 + barW / 2;
          const y = h - pad.bottom - (d.value / max) * ch;
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  } catch { /* invalid data */ }
}

watch([dataInput, chartType], drawChart);
onMounted(drawChart);
</script>

<template>
  <ToolLayout title="📈 图表制作">
    <template #toolbar-actions>
      <NButton
        size="small"
        :type="chartType === 'bar' ? 'primary' : 'default'"
        @click="chartType = 'bar'"
      >
        柱状图
      </NButton>
      <NButton
        size="small"
        :type="chartType === 'line' ? 'primary' : 'default'"
        @click="chartType = 'line'"
      >
        折线图
      </NButton>
      <NButton
        size="small"
        :type="chartType === 'pie' ? 'primary' : 'default'"
        @click="chartType = 'pie'"
      >
        饼图
      </NButton>
    </template>
    <template #input>
      <div class="chart-input">
        <p class="chart-label">
          数据 (JSON 格式):
        </p>
        <NInput
          v-model:value="dataInput"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 8 }"
        />
        <p class="chart-hint">
          格式: [{"label":"类别","value":数值}]
        </p>
      </div>
    </template>
    <template #output>
      <canvas
        ref="chartCanvas"
        class="chart-canvas"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.chart-input { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.chart-label { font-size: 12px; color: var(--n-text-color-3); margin: 0; }
.chart-hint { font-size: 11px; color: var(--n-text-color-3); }
.chart-canvas { width: 100%; height: 100%; }
</style>
