<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NSelect, NInput, NInputNumber, useMessage, NTag } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const method = ref('GET');
const url = ref('');
const body = ref('');
const headersInput = ref('{\n  "Content-Type": "application/json"\n}');
const response = ref('');
const loading = ref(false);
const status = ref('');
const responseTime = ref(0);
const history = ref<Array<{ method: string; url: string; status: string; time: number; date: string }>>([]);

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' },
];

const presets = [
  { label: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1' },
  { label: 'HTTPBin GET', url: 'https://httpbin.org/get' },
  { label: 'HTTPBin POST', url: 'https://httpbin.org/post' },
  { label: 'Dog API', url: 'https://dog.ceo/api/breeds/image/random' },
];

async function sendRequest() {
  if (!url.value.trim()) { message.warning('请输入 URL'); return; }
  loading.value = true;
  response.value = '';
  status.value = '';
  const start = performance.now();
  try {
    let headers: Record<string, string> = {};
    if (headersInput.value.trim()) {
      try { headers = JSON.parse(headersInput.value); } catch { /* use defaults */ }
    }
    if (!headers['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(method.value)) {
      headers['Content-Type'] = 'application/json';
    }
    const opts: RequestInit = { method: method.value, headers };
    if (['POST', 'PUT', 'PATCH'].includes(method.value) && body.value.trim()) {
      opts.body = body.value;
    }
    const res = await fetch(url.value, opts);
    responseTime.value = Math.round(performance.now() - start);
    status.value = `${res.status} ${res.statusText}`;
    const text = await res.text();
    try {
      response.value = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      response.value = text;
    }
    // Add to history
    history.value.unshift({
      method: method.value,
      url: url.value,
      status: status.value,
      time: responseTime.value,
      date: new Date().toLocaleTimeString(),
    });
    history.value = history.value.slice(0, 20);
  } catch (e) {
    response.value = `请求失败: ${(e as Error).message}`;
    status.value = 'ERROR';
    responseTime.value = Math.round(performance.now() - start);
  }
  loading.value = false;
}

function loadHistory(item: typeof history.value[0]) {
  method.value = item.method;
  url.value = item.url;
}

function setPreset(p: typeof presets[0]) {
  url.value = p.url;
  method.value = 'GET';
}

function loadSaved() {
  try {
    const saved = localStorage.getItem('devtoolkit-postman-history');
    if (saved) history.value = JSON.parse(saved);
  } catch { /* ignore */ }
}
watch(history, (h) => {
  localStorage.setItem('devtoolkit-postman-history', JSON.stringify(h));
}, { deep: true });
loadSaved();
</script>

<template>
  <ToolLayout title="📡 Postman">
    <template #toolbar-actions>
      <NSelect
        v-model:value="method"
        :options="methodOptions"
        size="small"
        style="width: 100px"
      />
      <NButton
        type="primary"
        size="small"
        :loading="loading"
        @click="sendRequest"
      >
        ▶ {{ loading ? '发送中...' : '发送' }}
      </NButton>
    </template>
    <template #input>
      <div class="pm-input">
        <div class="pm-row">
          <NInput
            v-model:value="url"
            placeholder="https://api.example.com"
          />
        </div>
        <div class="pm-presets">
          <NButton
            v-for="p in presets"
            :key="p.label"
            size="tiny"
            @click="setPreset(p)"
          >
            {{ p.label }}
          </NButton>
        </div>
        <div class="pm-editors">
          <div class="pm-half">
            <div class="pm-label">
              Headers (JSON)
            </div>
            <MonacoEditor
              v-model="headersInput"
              language="json"
              :style="{ height: 'calc(100% - 24px)' }"
            />
          </div>
          <div
            v-if="['POST','PUT','PATCH'].includes(method)"
            class="pm-half"
          >
            <div class="pm-label">
              Body
            </div>
            <MonacoEditor
              v-model="body"
              language="json"
              :style="{ height: 'calc(100% - 24px)' }"
            />
          </div>
        </div>
      </div>
    </template>
    <template #output>
      <div class="pm-output">
        <div
          v-if="status"
          class="pm-status"
        >
          <NTag
            :type="status.startsWith('2') ? 'success' : status === 'ERROR' ? 'error' : 'warning'"
            size="small"
          >
            {{ status }}
          </NTag>
          <span
            v-if="responseTime"
            class="pm-time"
          >{{ responseTime }}ms</span>
        </div>
        <div class="pm-response">
          <OutputPanel
            v-model="response"
            language="json"
          />
        </div>
      </div>
    </template>
    <template #output-footer-actions>
      <span
        v-if="history.length > 0"
        style="font-size:10px;color:var(--n-text-color-3)"
      >📜 {{ history.length }} 条历史</span>
      <div class="pm-history">
        <div
          v-for="h in history.slice(0, 5)"
          :key="h.date"
          class="pm-history-item"
          @click="loadHistory(h)"
        >
          <NTag
            :bordered="false"
            size="small"
            :type="h.method === 'GET' ? 'info' : 'warning'"
          >
            {{ h.method }}
          </NTag>
          <span class="pm-history-url">{{ h.url.slice(0, 40) }}{{ h.url.length > 40 ? '...' : '' }}</span>
          <span style="font-size:9px;color:var(--n-text-color-3)">{{ h.status }}</span>
        </div>
      </div>
    </template>
  </ToolLayout>
</template>

<style scoped>
.pm-input { display: flex; flex-direction: column; height: 100%; }
.pm-row { padding: 8px 12px; border-bottom: 1px solid var(--n-border-color); display: flex; gap: 8px; align-items: center; }
.pm-presets { padding: 4px 12px; display: flex; gap: 4px; flex-wrap: wrap; border-bottom: 1px solid var(--n-border-color); }
.pm-editors { flex: 1; display: flex; min-height: 0; }
.pm-half { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--n-border-color); }
.pm-half:last-child { border-right: none; }
.pm-label { padding: 4px 12px; font-size: 11px; color: var(--n-text-color-3); background: var(--n-color-embedded); border-bottom: 1px solid var(--n-border-color); flex-shrink: 0; }
.pm-output { display: flex; flex-direction: column; height: 100%; }
.pm-status { display: flex; align-items: center; gap: 8px; padding: 4px 12px; border-bottom: 1px solid var(--n-border-color); background: var(--n-color-embedded); flex-shrink: 0; }
.pm-time { font-size: 11px; color: var(--n-text-color-3); font-family: monospace; }
.pm-response { flex: 1; overflow: hidden; }
.pm-history { display: flex; flex-direction: column; gap: 2px; margin-left: auto; }
.pm-history-item { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 2px 4px; border-radius: 4px; }
.pm-history-item:hover { background: var(--n-color-hover); }
.pm-history-url { font-size: 10px; color: var(--n-text-color); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
