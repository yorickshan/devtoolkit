<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NInput, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import MonacoEditor from '@/components/editor/MonacoEditor.vue';

const message = useMessage();
const mapData = ref(`Root
  Branch A
    Leaf A1
    Leaf A2
  Branch B
    Leaf B1
      Sub B1.1
    Leaf B2
  Branch C`);
const svgOutput = ref('');
const viewBox = ref('0 0 800 600');

const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

interface Node {
  label: string;
  depth: number;
  color: string;
}

function generate() {
  const lines = mapData.value.split('\n').filter(l => l.trim());
  const nodes: Node[] = [];
  let colorIdx = 0;

  lines.forEach(line => {
    const indent = line.search(/\S/);
    const label = line.trim();
    if (indent === 0) colorIdx++;
    nodes.push({ label, depth: indent, color: colors[Math.floor(indent / 2) % colors.length] });
  });

  if (nodes.length === 0) { svgOutput.value = ''; return; }

  const w = 800, h = 600;
  const startX = 60, startY = 40;
  const ySpacing = (h - 80) / nodes.length;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">\n`;
  svg += `<rect width="${w}" height="${h}" fill="#1e1e1e" rx="8"/>\n`;

  const positions: Array<{ x: number; y: number; node: Node }> = [];

  nodes.forEach((node, i) => {
    const x = startX + node.depth * 160;
    const y = startY + i * ySpacing + ySpacing / 2;
    positions.push({ x, y, node });

    // Draw line to parent
    if (node.depth > 0) {
      for (let j = i - 1; j >= 0; j--) {
        if (nodes[j].depth < node.depth) {
          const py = startY + j * ySpacing + ySpacing / 2;
          svg += `<line x1="${x - 10}" y1="${y}" x2="${positions[j].x + 80}" y2="${py}" stroke="${node.color}" stroke-width="1.5" opacity="0.5"/>\n`;
          break;
        }
      }
    }
  });

  positions.forEach(({ x, y, node }) => {
    svg += `<rect x="${x}" y="${y - 12}" width="${Math.min(node.label.length * 9 + 20, 150)}" height="24" rx="6" fill="${node.color}20" stroke="${node.color}" stroke-width="1.5"/>\n`;
    svg += `<text x="${x + 10}" y="${y + 4}" fill="${node.color}" font-family="sans-serif" font-size="12">${node.label.slice(0, 18)}</text>\n`;
  });

  svg += '</svg>';
  svgOutput.value = svg;
}

watch(mapData, generate, { immediate: true });

function copy() {
  navigator.clipboard.writeText(svgOutput.value).then(() => message.success('SVG 已复制'));
}
</script>

<template>
  <ToolLayout title="🧠 脑图">
    <template #toolbar-actions>
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
        📋 复制 SVG
      </NButton>
    </template>
    <template #input>
      <div class="mind-input">
        <p class="mind-label">
          缩进文本（空格缩进表示层级）:
        </p>
        <NInput
          v-model:value="mapData"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 20 }"
        />
      </div>
    </template>
    <template #output>
      <div
        class="mind-output"
        v-html="svgOutput"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.mind-input { padding: 16px; display: flex; flex-direction: column; gap: 8px; height: 100%; }
.mind-label { font-size: 12px; color: var(--n-text-color-3); }
.mind-output { padding: 16px; overflow: auto; height: 100%; display: flex; align-items: center; justify-content: center; }
.mind-output :deep(svg) { max-width: 100%; max-height: 100%; border-radius: 8px; }
</style>
