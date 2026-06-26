<script setup lang="ts">
import { NSelect, NDivider, NH3 } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/stores/app';
import AppShell from '@/components/shell/AppShell.vue';

const { t } = useI18n();
const appStore = useAppStore();

const themeOptions: Array<{ label: string; value: string }> = [
  { label: t('settings.themeSystem'), value: 'system' },
  { label: t('settings.themeLight'), value: 'light' },
  { label: t('settings.themeDark'), value: 'dark' },
];

const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
];
</script>

<template>
  <AppShell>
    <div class="settings">
      <NH3>{{ t('settings.title') }}</NH3>
      <NDivider />
      <div class="settings__row">
        <span>{{ t('settings.theme') }}</span>
        <NSelect v-model:value="appStore.theme" :options="themeOptions" size="small" style="width: 140px" />
      </div>
      <div class="settings__row">
        <span>语言 / Language</span>
        <NSelect v-model:value="appStore.locale" :options="langOptions" size="small" style="width: 140px" />
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.settings { padding: 24px; max-width: 600px; }
.settings__row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; }
</style>
