<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { NConfigProvider, darkTheme, NMessageProvider, NDialogProvider, NNotificationProvider, NLoadingBarProvider, type GlobalThemeOverrides } from 'naive-ui';
import { useAppStore } from '@/stores/app';
import '@/styles/variables.css';

const appStore = useAppStore();
const { locale } = useI18n();

// Sync locale from store to i18n
locale.value = appStore.locale;
watch(() => appStore.locale, (lang) => { locale.value = lang; });

function detectSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const naiveTheme = computed(() => {
  if (appStore.theme === 'dark') return darkTheme;
  if (appStore.theme === 'light') return null;
  return detectSystemTheme() === 'dark' ? darkTheme : null;
});

// Naive UI theme overrides for premium macOS-native feel
const themeOverrides: GlobalThemeOverrides = {
  common: {
    borderRadius: '6px',
    borderRadiusSmall: '4px',
    borderRadiusMedium: '8px',
    borderRadiusLarge: '12px',
    fontSize: '13px',
    fontSizeSmall: '11px',
    fontSizeMedium: '14px',
    fontSizeLarge: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    fontFamilyMono: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
    primaryColor: '#58a6ff',
    primaryColorHover: '#79c0ff',
    primaryColorPressed: '#4090e0',
    primaryColorSuppl: '#58a6ff',
    infoColor: '#58a6ff',
    successColor: '#3fb950',
    warningColor: '#d29922',
    errorColor: '#f85149',
    bodyColor: 'var(--fh-text-primary)',
    textColor1: 'var(--fh-text-primary)',
    textColor2: 'var(--fh-text-secondary)',
    textColor3: 'var(--fh-text-tertiary)',
    borderColor: 'var(--fh-border)',
    hoverColor: 'var(--fh-accent-muted)',
    boxShadow1: 'var(--fh-shadow-sm)',
    boxShadow2: 'var(--fh-shadow-md)',
    boxShadow3: 'var(--fh-shadow-lg)',
    actionColor: 'var(--fh-accent)',
    modalColor: 'var(--fh-surface-1)',
    cardColor: 'var(--fh-surface-2)',
    popoverColor: 'var(--fh-surface-1)',
    tableColor: 'var(--fh-surface-1)',
    inputColor: 'var(--fh-surface-2)',
  },
  Button: {
    borderRadiusSmall: '6px',
    borderRadiusMedium: '8px',
    borderRadiusLarge: '10px',
    fontWeight: '500',
    fontSizeSmall: '12px',
    fontSizeMedium: '13px',
    fontSizeLarge: '14px',
    heightSmall: '28px',
    heightMedium: '32px',
    heightLarge: '40px',
    paddingSmall: '0 10px',
    paddingMedium: '0 14px',
    paddingLarge: '0 18px',
  },
  Input: {
    borderRadius: '6px',
    fontSizeSmall: '12px',
    fontSizeMedium: '13px',
    fontSizeLarge: '14px',
    heightSmall: '28px',
    heightMedium: '32px',
    heightLarge: '40px',
  },
  Menu: {
    borderRadius: '8px',
    itemHeight: '30px',
    fontSize: '12.5px',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '6px',
        fontSizeSmall: '12px',
        fontSizeMedium: '13px',
        heightSmall: '28px',
        heightMedium: '32px',
      },
    },
  },
  Tag: {
    borderRadius: '4px',
    fontSizeSmall: '10px',
    fontSizeMedium: '11px',
  },
  Divider: {
    color: 'var(--fh-border)',
  },
};

// Switch html root attribute for light mode
watch(() => appStore.theme, () => {
  const isDark = appStore.theme === 'dark' || (appStore.theme === 'system' && detectSystemTheme() === 'dark');
  document.documentElement.classList.toggle('light', !isDark);
}, { immediate: true });

// Listen for OS theme changes
onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => { appStore.setTheme(appStore.theme); });

  // Global Cmd/Ctrl+K to toggle search
  function onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      appStore.toggleSearch();
    }
  }
  window.addEventListener('keydown', onKeydown);
});
</script>

<template>
  <NConfigProvider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <RouterView />
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
</style>
