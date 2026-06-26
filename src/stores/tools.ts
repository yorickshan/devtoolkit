import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TOOLS, searchTools } from '@/data/tools-registry';
import type { ToolDefinition } from '@/types';

export const useToolsStore = defineStore('tools', () => {
  const tools = ref<ToolDefinition[]>(TOOLS);

  const categories = computed(() => {
    const map = new Map<string, ToolDefinition[]>();
    tools.value.forEach((tool) => {
      const list = map.get(tool.category) || [];
      list.push(tool);
      map.set(tool.category, list);
    });
    return map;
  });

  function search(query: string): ToolDefinition[] {
    return searchTools(query);
  }

  return { tools, categories, search };
});
