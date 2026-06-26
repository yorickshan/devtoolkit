<script setup lang="ts">
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import { useAppStore } from '@/stores/app';

const model = defineModel<string>({ required: true });
defineProps<{ language?: string }>();
const emit = defineEmits<{ 'stats': [s: { chars: number; lines: number; language: string }] }>();
const appStore = useAppStore();
function onStats(s: { chars: number; lines: number; language: string }) { emit('stats', s); }
</script>

<template>
  <MonacoEditor
    v-model="model"
    :language="language ?? 'plaintext'"
    :theme="appStore.theme === 'dark' ? 'vs-dark' : 'vs'"
    @stats="onStats"
  />
</template>
