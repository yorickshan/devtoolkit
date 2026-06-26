<script setup lang="ts">
import { NMenu, NInput, type MenuOption } from 'naive-ui';
import { computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { TOOL_CATEGORIES, TOOLS } from '@/data/tools-registry';
import { useAppStore } from '@/stores/app';
import { useLocalizedTool } from '@/composables/useLocalizedTool';
import ToolIcon from '@/components/common/ToolIcon.vue';
import { SearchOutline, HomeOutline, StarOutline, SettingsOutline } from '@vicons/ionicons5';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const { t } = useI18n();
const { toolName } = useLocalizedTool();

const menuOptions = computed<MenuOption[]>(() => {
  const groups: MenuOption[] = [];

  // "全部工具" — back to home
  groups.push({
    label: () => h('span', { class: 'nav-item' }, [
      h(HomeOutline, { width: 16, height: 16, class: 'nav-icon' }),
      h('span', t('app.sidebar.home')),
    ]),
    key: '/',
  });

  // Favorites section (if any favorites exist)
  if (appStore.favorites.length > 0) {
    const favTools = TOOLS.filter((t) => appStore.favorites.includes(t.id));
    if (favTools.length > 0) {
      groups.push({
        type: 'group',
        label: () => h('span', { class: 'nav-group-label' }, [
          h('span', t('app.sidebar.favorites')),
        ]),
        key: 'cat-favorites',
        children: favTools.map((tool) => ({
          label: () => h('span', { class: 'nav-item' }, [
            h(ToolIcon, { tool, size: 16, class: 'nav-icon' }),
            h('span', toolName(tool)),
          ]),
          key: tool.route,
        })),
      });
    }
  }

  TOOL_CATEGORIES.forEach((cat) => {
    const catTools = TOOLS.filter((t) => t.category === cat.key);
    if (catTools.length === 0) return;

    const children: MenuOption[] = catTools.map((tool) => ({
      label: () => h('span', { class: 'nav-item' }, [
        h(ToolIcon, { tool, size: 16, class: 'nav-icon' }),
        h('span', toolName(tool)),
      ]),
      key: tool.route,
    }));

    groups.push({
      type: 'group',
      label: t(`categories.${cat.key}`) as string,
      key: `cat-${cat.key}`,
      children,
    });
  });

  return groups;
});

function handleMenuUpdate(key: string) {
  if (key === '/') { router.push('/'); return; }
  if (key.startsWith('/tool/') || key === '/settings') {
    appStore.addRecentTool(key.replace('/tool/', ''));
    router.push(key);
  }
}

const activeKey = computed(() => route.path);
</script>

<template>
  <aside class="side-nav">
    <div class="side-nav__header">
      <span class="side-nav__logo">⚡ DevToolkit</span>
    </div>
    <div class="side-nav__search">
      <NInput size="small" :placeholder="t('app.sidebar.search') as string" :input-props="{ readonly: true }"
        @click="appStore.toggleSearch()" class="side-nav__search-input">
        <template #prefix>
          <SearchOutline :width="14" :height="14" />
        </template>
        <template #suffix><kbd class="side-nav__kbd">⌘K</kbd></template>
      </NInput>
    </div>
    <div class="side-nav__menu">
      <NMenu :value="activeKey" :options="menuOptions" :root-indent="12" :indent="8" @update:value="handleMenuUpdate" />
    </div>
    <div class="side-nav__footer">
      <NMenu :value="activeKey" :options="[{
        label: () => h('span', { class: 'nav-item' }, [
          h(SettingsOutline, { width: 16, height: 16, class: 'nav-icon' }),
          h('span', t('app.sidebar.settings')),
        ]),
        key: '/settings',
      }]" :root-indent="12" @update:value="handleMenuUpdate" />
    </div>
  </aside>
</template>

<style scoped>
.side-nav {
  width: 228px;
  min-width: 228px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--fh-border-subtle);
  background: var(--fh-surface-1);
  overflow: hidden;
  user-select: none;
}

.side-nav__header {
  padding: 16px var(--fh-space-4) 12px;
}

.side-nav__logo {
  font-size: 15px;
  font-weight: var(--fh-font-weight-bold);
  color: var(--fh-text-primary);
  letter-spacing: -0.01em;
}

.side-nav__search {
  padding: 0 var(--fh-space-3) var(--fh-space-3);
}

.side-nav__search-input {
  cursor: pointer;
  border-radius: var(--fh-radius-md) !important;
  background: var(--fh-surface-2) !important;
  border-color: var(--fh-border-subtle) !important;
  transition: all var(--fh-duration-fast) var(--fh-ease-out);
}

.side-nav__search-input:hover {
  border-color: var(--fh-border-hover) !important;
  background: var(--fh-surface-3) !important;
}

.side-nav__kbd {
  font-family: var(--fh-font-mono);
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--fh-surface-3);
  color: var(--fh-text-tertiary);
  border: 1px solid var(--fh-border-subtle);
}

.side-nav__menu {
  flex: 1;
  overflow-y: auto;
  padding: var(--fh-space-1) 0;
}

.side-nav__footer {
  border-top: 1px solid var(--fh-border-subtle);
  padding: var(--fh-space-1) 0;
}

/* Nav item with icon — injected via render functions */
:deep(.nav-item) {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

:deep(.nav-icon) {
  flex-shrink: 0;
  opacity: 0.55;
}

:deep(.nav-group-label) {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
}

:deep(.nav-group-icon) {
  opacity: 0.45;
}
</style>
