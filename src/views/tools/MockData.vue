<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref } from 'vue';
import { NButton, NInputNumber, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const count = ref(10);
const type = ref<'users' | 'products' | 'orders' | 'custom'>('users');
const locale = ref('zh');
const output = ref('');

const templates: Record<string, () => Record<string, unknown>> = {
  users: () => ({
    id: crypto.randomUUID(),
    name: ['张三', '李四', '王五', '赵六', '测试用户'][Math.floor(Math.random() * 5)],
    email: `user${Math.floor(Math.random() * 10000)}@example.com`,
    age: Math.floor(Math.random() * 40) + 20,
    role: ['admin', 'editor', 'viewer'][Math.floor(Math.random() * 3)],
    created: new Date(Date.now() - Math.random() * 365 * 86400000).toISOString(),
  }),
  products: () => ({
    id: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
    name: ['笔记本电脑', '手机', '平板', '耳机', '显示器'][Math.floor(Math.random() * 5)],
    price: +(Math.random() * 10000).toFixed(2),
    stock: Math.floor(Math.random() * 500),
    category: ['电子', '配件', '办公'][Math.floor(Math.random() * 3)],
  }),
  orders: () => ({
    orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
    amount: +(Math.random() * 5000).toFixed(2),
    status: ['pending', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
    items: Math.floor(Math.random() * 5) + 1,
    customerId: crypto.randomUUID().slice(0, 8),
  }),
  custom: () => ({ key: 'value', timestamp: Date.now() }),
};

function generate() {
  const tpl = templates[type.value];
  const data = Array.from({ length: count.value }, () => tpl());
  output.value = JSON.stringify(data, null, 2);
}

function copy() { navigator.clipboard.writeText(output.value).then(() => message.success(t('app.clipboard.copied'))); }

generate();
</script>

<template>
  <ToolLayout title="🎭 Mock 数据">
    <template #toolbar-actions>
      <NSelect
        v-model:value="type"
        :options="[
          { label: '用户', value: 'users' }, { label: '商品', value: 'products' },
          { label: '订单', value: 'orders' }, { label: '通用', value: 'custom' }
        ]"
        size="small"
        style="width:100px"
      />
      <span style="font-size:11px;color:var(--n-text-color-3)">条数:</span>
      <NInputNumber
        v-model:value="count"
        :min="1"
        :max="1000"
        size="small"
        style="width:80px"
      />
      <NButton
        size="small"
        @click="generate"
      >
        ▶ 生成
      </NButton>
      <NButton
        size="small"
        @click="copy"
      >
        📋 复制
      </NButton>
    </template>
    <template #input>
      <div class="mock-input">
        <p style="font-size:13px;color:var(--n-text-color-3)">
          选择数据类型和条数，点击生成
        </p>
        <NButton
          type="primary"
          size="large"
          @click="generate"
        >
          🔄 生成 {{ count }} 条 {{ {users:'用户',products:'商品',orders:'订单',custom:'数据'}[type] }} 数据
        </NButton>
      </div>
    </template>
    <template #output>
      <OutputPanel
        v-model="output"
        language="json"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.mock-input { padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; }
</style>
