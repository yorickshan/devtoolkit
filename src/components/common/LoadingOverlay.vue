<script setup lang="ts">
defineProps<{
  visible: boolean;
  message?: string;
}>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="loading-overlay"
    >
      <div class="loading-overlay__spinner" />
      <p
        v-if="message"
        class="loading-overlay__message"
      >
        {{ message }}
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.loading-overlay__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--n-color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay__message {
  margin-top: 12px;
  font-size: 13px;
  color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
