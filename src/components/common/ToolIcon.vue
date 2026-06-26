<script setup lang="ts">
import { h, type Component } from 'vue';
import {
  CodeSlashOutline, GitCompareOutline, LockClosedOutline, QrCodeOutline,
  TimerOutline, BrushOutline, SearchOutline, FingerPrintOutline,
  CalculatorOutline, GlobeOutline, CameraOutline, ServerOutline,
  ColorPaletteOutline, KeyOutline, DuplicateOutline, DocumentTextOutline,
  ImageOutline, CalendarNumberOutline, AlarmOutline, CashOutline,
  ContractOutline, ColorWandOutline, DocumentAttachOutline,
  BarChartOutline, BookmarkOutline, PulseOutline, CloudOutline,
  ConstructOutline, ImagesOutline, GridOutline, CodeWorkingOutline,
  BuildOutline, DocumentOutline, ColorFillOutline, BookOutline,
} from '@vicons/ionicons5';
import type { ToolDefinition } from '@/types';

const props = defineProps<{ tool: ToolDefinition; size?: number }>();
const size = props.size ?? 24;

const iconMap: Record<string, Component> = {
  'json-format': CodeSlashOutline,
  'json-diff': GitCompareOutline,
  'en-decode': LockClosedOutline,
  'qr-code': QrCodeOutline,
  timestamp: TimerOutline,
  'code-beautify': BrushOutline,
  regexp: SearchOutline,
  'uuid-gen': FingerPrintOutline,
  'trans-radix': CalculatorOutline,
  postman: GlobeOutline,
  screenshot: CameraOutline,
  'byte-unit': ServerOutline,
  'color-picker': ColorPaletteOutline,
  password: KeyOutline,
  'mock-data': DuplicateOutline,
  html2markdown: DocumentTextOutline,
  'image-base64': ImageOutline,
  'date-calc': CalendarNumberOutline,
  crontab: AlarmOutline,
  'loan-rate': CashOutline,
  'code-compress': ContractOutline,
  'svg-converter': ColorWandOutline,
  excel2json: DocumentAttachOutline,
  'chart-maker': BarChartOutline,
  'sticky-notes': BookmarkOutline,
  websocket: PulseOutline,
  naotu: CloudOutline,
  'poster-maker': ImagesOutline,
  'grid-ruler': GridOutline,
  'page-timing': TimerOutline,
  'page-monkey': CodeWorkingOutline,
  devtools: BuildOutline,
  'dynamic-inject': ColorFillOutline,
  'text-diff': DocumentOutline,
  'regex-db': BookOutline,
};

const icon = iconMap[props.tool.id] || CodeSlashOutline;
</script>

<template>
  <component :is="icon" :width="size" :height="size" />
</template>
