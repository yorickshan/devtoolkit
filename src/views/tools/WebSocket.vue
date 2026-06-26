<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import { NButton, NInput, NSwitch, useMessage, NTag } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const url = ref('wss://echo.websocket.org');
const messages = ref<Array<{ type: 'sent' | 'received' | 'system'; text: string; time: string; pretty?: string }>>([]);
const sendText = ref('');
const autoReconnect = ref(true);
const reconnectAttempts = ref(0);
const maxReconnect = 5;
const reconnectDelay = ref(2000);
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const connected = ref(false);
const messageCount = ref({ sent: 0, received: 0 });

function tryPrettifyJSON(text: string): string {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      return JSON.stringify(parsed, null, 2);
    }
  } catch { /* ignore parse error, return raw text */ }
  return text;
}

function connect() {
  cleanup();
  doConnect();
}

function doConnect() {
  try {
    ws = new WebSocket(url.value);
    ws.onopen = () => {
      connected.value = true;
      reconnectAttempts.value = 0;
      addMsg('system', `✓ 已连接 (尝试 ${reconnectAttempts.value})`);
    };
    ws.onclose = (e) => {
      connected.value = false;
      const reason = e.reason || '无原因';
      addMsg('system', `✗ 断开 (code: ${e.code}, reason: ${reason})`);
      if (autoReconnect.value && reconnectAttempts.value < maxReconnect) {
        reconnectAttempts.value++;
        addMsg('system', `🔄 ${reconnectDelay.value / 1000}s 后重连 (${reconnectAttempts.value}/${maxReconnect})...`);
        reconnectTimer = setTimeout(doConnect, reconnectDelay.value);
      }
    };
    ws.onerror = () => addMsg('system', '⚠ 连接错误');
    ws.onmessage = (e) => {
      const pretty = tryPrettifyJSON(e.data);
      messageCount.value.received++;
      addMsg('received', e.data, pretty !== e.data ? pretty : undefined);
    };
  } catch (e) {
    message.error('连接失败');
  }
}

function disconnect() {
  autoReconnect.value = false;
  cleanup();
  addMsg('system', '手动断开');
}

function cleanup() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  ws?.close();
  ws = null;
  connected.value = false;
}

function send() {
  if (!sendText.value.trim() || !ws) return;
  messageCount.value.sent++;
  ws.send(sendText.value);
  const pretty = tryPrettifyJSON(sendText.value);
  addMsg('sent', sendText.value, pretty !== sendText.value ? pretty : undefined);
  sendText.value = '';
}

function addMsg(type: 'sent' | 'received' | 'system', text: string, pretty?: string) {
  messages.value.push({ type, text, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), pretty });
}

function clearMessages() { messages.value = []; messageCount.value = { sent: 0, received: 0 }; }

onUnmounted(() => { autoReconnect.value = false; cleanup(); });
</script>

<template>
  <ToolLayout title="🔌 WebSocket">
    <template #toolbar-actions>
      <NButton
        size="small"
        :type="connected ? 'default' : 'primary'"
        :disabled="connected"
        @click="connect"
      >
        连接
      </NButton>
      <NButton
        size="small"
        :disabled="!connected"
        @click="disconnect"
      >
        断开
      </NButton>
      <NTag
        size="small"
        :bordered="false"
        :type="connected ? 'success' : 'default'"
      >
        {{ connected ? {connected: t('app.status.connected')} : '未连接' }}
      </NTag>
      <NButton
        size="small"
        @click="clearMessages"
      >
        清空
      </NButton>
      <span style="font-size:10px;color:var(--n-text-color-3);display:flex;gap:8px">
        <span>↑{{ messageCount.sent }}</span><span>↓{{ messageCount.received }}</span>
      </span>
    </template>
    <template #input>
      <div class="ws-input">
        <NInput
          v-model:value="url"
          placeholder="wss://echo.websocket.org"
          :disabled="connected"
        />
        <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--n-text-color-3)">
          <span>自动重连</span><NSwitch
            v-model:value="autoReconnect"
            size="small"
          />
          <span
            v-if="reconnectAttempts > 0"
            style="color:var(--n-color-warning)"
          >尝试 {{ reconnectAttempts }}/{{ maxReconnect }}</span>
        </div>
        <div class="ws-send">
          <NInput
            v-model:value="sendText"
            placeholder="输入消息..."
            @keydown.enter="send"
          />
          <NButton
            size="small"
            :disabled="!connected"
            @click="send"
          >
            发送
          </NButton>
        </div>
      </div>
    </template>
    <template #output>
      <div class="ws-log">
        <div
          v-if="messages.length === 0"
          class="ws-empty"
        >
          连接 WebSocket 开始通信
        </div>
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="ws-msg"
          :class="'ws-msg--' + m.type"
        >
          <span class="ws-time">{{ m.time }}</span>
          <span class="ws-direction">{{ m.type === 'sent' ? '→' : m.type === 'received' ? '←' : '●' }}</span>
          <div class="ws-body">
            <pre
              class="ws-text"
              :class="{ 'ws-json': m.pretty }"
            >{{ m.pretty || m.text }}</pre>
          </div>
        </div>
      </div>
    </template>
  </ToolLayout>
</template>

<style scoped>
.ws-input { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.ws-send { display: flex; gap: 8px; }
.ws-log { padding: 12px; height: 100%; overflow: auto; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 12px; }
.ws-empty { color: var(--n-text-color-3); text-align: center; padding: 40px; }
.ws-msg { display: flex; gap: 8px; align-items: flex-start; padding: 4px 0; border-bottom: 1px solid var(--n-border-color); }
.ws-msg--sent .ws-text { color: var(--n-color-primary); }
.ws-msg--received .ws-text { color: var(--n-color-success); }
.ws-msg--system .ws-text { color: var(--n-text-color-3); }
.ws-time { font-size: 10px; color: var(--n-text-color-3); min-width: 75px; white-space: nowrap; }
.ws-direction { font-weight: 700; min-width: 16px; }
.ws-body { flex: 1; min-width: 0; }
.ws-text { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 12px; }
.ws-json { color: var(--n-color-target); }
</style>
