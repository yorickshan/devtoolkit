<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { ref, computed } from 'vue';
import { NButton, NInput, useMessage, NCollapse, NCollapseItem, NTag } from 'naive-ui';
import ToolLayout from '@/components/shell/ToolLayout.vue';
import OutputPanel from '@/components/common/OutputPanel.vue';

const message = useMessage();
const searchQuery = ref('');
const output = ref('');

const regexDB = [
  { pattern: '\\d+', name: '数字', tags: ['常用', '提取'], examples: '匹配连续数字' },
  { pattern: '[a-zA-Z]+', name: '英文字母', tags: ['常用', '提取'], examples: '匹配英文字母单词' },
  { pattern: '[\\u4e00-\\u9fa5]+', name: '中文字符', tags: ['常用', '提取'], examples: '匹配中文字符' },
  { pattern: '^1[3-9]\\d{9}$', name: '手机号(中国)', tags: ['验证', '手机'], examples: '13800138000' },
  { pattern: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$', name: '邮箱', tags: ['验证', '邮箱'], examples: 'user@example.com' },
  { pattern: '^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$', name: 'URL', tags: ['验证', '网络'], examples: 'https://example.com' },
  { pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', name: '身份证号(中国)', tags: ['验证', '身份'], examples: '110101199001011234' },
  { pattern: '^\\d{4}-\\d{1,2}-\\d{1,2}$', name: '日期 YYYY-MM-DD', tags: ['验证', '日期'], examples: '2024-01-01' },
  { pattern: '^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$', name: 'IPv4 地址', tags: ['验证', '网络'], examples: '192.168.1.1' },
  { pattern: '<[^>]+>', name: 'HTML 标签', tags: ['提取', 'HTML'], examples: '匹配所有HTML标签' },
  { pattern: '/\\*[\\s\\S]*?\\*/', name: 'CSS/JS 块注释', tags: ['提取', '代码'], examples: '匹配块注释' },
  { pattern: '//.*$', name: '单行注释', tags: ['提取', '代码'], examples: '匹配单行注释' },
  { pattern: '\\b[0-9a-fA-F]{40}\\b', name: 'SHA-1 Hash', tags: ['提取', '哈希'], examples: '匹配40位十六进制哈希' },
  { pattern: '\\b[0-9a-fA-F]{64}\\b', name: 'SHA-256 Hash', tags: ['提取', '哈希'], examples: '匹配64位十六进制哈希' },
  { pattern: '\\b[0-9a-fA-F]{32}\\b', name: 'MD5 Hash', tags: ['提取', '哈希'], examples: '匹配32位十六进制哈希' },
  { pattern: '\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b', name: 'UUID', tags: ['提取', 'ID'], examples: '匹配UUID标准格式' },
  { pattern: '^(19|20)\\d{2}$', name: '年份 1900-2099', tags: ['验证', '日期'], examples: '2024' },
  { pattern: '^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$', name: '十六进制颜色', tags: ['验证', '颜色'], examples: '#FFF 或 #FFFFFF' },
  { pattern: '^\\d{1,3}(,\\d{3})*(\\.\\d+)?$', name: '金额(千分位)', tags: ['验证', '金额'], examples: '1,234.56' },
  { pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[^]{8,}$', name: '强密码', tags: ['验证', '密码'], examples: '至少8位，含大小写数字' },
];

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return regexDB;
  const q = searchQuery.value.toLowerCase();
  return regexDB.filter(r => r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
});

function copyPattern(p: string) {
  navigator.clipboard.writeText(p).then(() => message.success(t('app.clipboard.copied')));
}

function insertPattern(p: string) {
  output.value = p;
  navigator.clipboard.writeText(p).then(() => message.success(t('app.clipboard.copied')));
}
</script>

<template>
  <ToolLayout title="📚 正则速查">
    <template #toolbar-actions>
      <span style="font-size:11px;color:var(--n-text-color-3)">共 {{ regexDB.length }} 条</span>
    </template>
    <template #input>
      <div class="rx-input">
        <NInput
          v-model:value="searchQuery"
          placeholder="搜索正则... 名称/标签"
          clearable
        />
        <div class="rx-list">
          <div
            v-for="r in filtered"
            :key="r.pattern"
            class="rx-card"
          >
            <div class="rx-header">
              <strong class="rx-name">{{ r.name }}</strong>
              <div class="rx-tags">
                <NTag
                  v-for="t in r.tags"
                  :key="t"
                  size="tiny"
                  :bordered="false"
                >
                  {{ t }}
                </NTag>
              </div>
              <NButton
                text
                size="tiny"
                @click="insertPattern(r.pattern)"
              >
                📋
              </NButton>
            </div>
            <code
              class="rx-pattern"
              @click="insertPattern(r.pattern)"
            >{{ r.pattern }}</code>
            <div class="rx-example">
              {{ r.examples }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #output>
      <OutputPanel
        v-model="output"
        language="plaintext"
      />
    </template>
  </ToolLayout>
</template>

<style scoped>
.rx-input { padding: 16px; display: flex; flex-direction: column; gap: 12px; height: 100%; }
.rx-list { flex: 1; overflow: auto; display: flex; flex-direction: column; gap: 8px; }
.rx-card { padding: 10px 12px; border: 1px solid var(--n-border-color); border-radius: 8px; }
.rx-header { display: flex; align-items: center; gap: 8px; }
.rx-name { font-size: 13px; color: var(--n-text-color); }
.rx-tags { display: flex; gap: 3px; }
.rx-pattern { display: block; margin: 6px 0; padding: 4px 8px; background: var(--n-color-embedded); border-radius: 4px; font-size: 12px; font-family: monospace; cursor: pointer; word-break: break-all; color: var(--n-color-primary); }
.rx-example { font-size: 11px; color: var(--n-text-color-3); }
</style>
