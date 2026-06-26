<script setup lang="ts">
import SideNav from './SideNav.vue';
import SearchBar from './SearchBar.vue';
import StatusBar from './StatusBar.vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__body">
      <SideNav />
      <div class="app-shell__main">
        <SearchBar v-if="appStore.isSearchOpen" />
        <div class="app-shell__content">
          <slot />
        </div>
        <StatusBar />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-shell__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-shell__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.app-shell__content {
  flex: 1;
  overflow: auto;
}
</style>
