<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';

const message = useMessage();
const notes = ref<Array<{ id: string; text: string; color: string; date: string }>>([]);
const newNote = ref('');

const colors = ['#fff8b0', '#ffd4d4', '#d4f0ff', '#d4ffd4', '#f0d4ff', '#ffe4d4'];

import { onMounted, watch } from 'vue';

function loadNotes() {
  try {
    const saved = localStorage.getItem('devtoolkit-sticky-notes');
    if (saved) notes.value = JSON.parse(saved);
  } catch { /* ignore */ }
}

function persist() {
  localStorage.setItem('devtoolkit-sticky-notes', JSON.stringify(notes.value));
}

function addNote() {
  if (!newNote.value.trim()) return;
  notes.value.unshift({
    id: crypto.randomUUID(),
    text: newNote.value.trim(),
    color: colors[Math.floor(Math.random() * colors.length)],
    date: new Date().toLocaleDateString(),
  });
  newNote.value = '';
  persist();
}

function removeNote(id: string) {
  notes.value = notes.value.filter(n => n.id !== id);
  persist();
}

function copyNote(text: string) {
  navigator.clipboard.writeText(text).then(() => message.success(t('app.clipboard.copied')));
}

onMounted(loadNotes);
</script>

<template>
  <ToolLayout title="📝 便签">
    <template #toolbar-actions>
      <span style="font-size:11px;color:var(--n-text-color-3)">共 {{ notes.length }} 条</span>
    </template>
    <template #input>
      <div class="notes-input">
        <textarea
          v-model="newNote"
          placeholder="输入新便签..."
          class="notes-textarea"
          @keydown.enter="addNote"
        />
        <NButton
          type="primary"
          :disabled="!newNote.trim()"
          @click="addNote"
        >
          ＋ 添加便签
        </NButton>
      </div>
    </template>
    <template #output>
      <div class="notes-list">
        <div
          v-if="notes.length === 0"
          class="notes-empty"
        >
          暂无便签
        </div>
        <div
          v-for="note in notes"
          :key="note.id"
          class="notes-item"
          :style="{ background: note.color }"
        >
          <div class="notes-item-text">
            {{ note.text }}
          </div>
          <div class="notes-item-footer">
            <span class="notes-item-date">{{ note.date }}</span>
            <div class="notes-item-actions">
              <NButton
                text
                size="tiny"
                @click="copyNote(note.text)"
              >
                📋
              </NButton>
              <NButton
                text
                size="tiny"
                @click="removeNote(note.id)"
              >
                🗑
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ToolLayout>
</template>

<style scoped>
.notes-input { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.notes-textarea { width: 100%; min-height: 80px; border: 1px solid var(--n-border-color); border-radius: 8px; padding: 12px; font-size: 13px; resize: vertical; outline: none; font-family: inherit; }
.notes-list { padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow: auto; height: 100%; }
.notes-empty { text-align: center; color: var(--n-text-color-3); padding: 40px; }
.notes-item { border-radius: 8px; padding: 12px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.notes-item-text { font-size: 13px; white-space: pre-wrap; word-break: break-word; }
.notes-item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.notes-item-date { font-size: 10px; color: #999; }
.notes-item-actions { display: flex; gap: 4px; }
</style>
