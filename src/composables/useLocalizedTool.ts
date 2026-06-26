import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ToolDefinition } from '@/types';

/** Returns tool name in current locale */
export function useLocalizedTool() {
  const { locale } = useI18n();

  function toolName(tool: ToolDefinition): string {
    if (locale.value === 'en') return tool.nameEn;
    return tool.name;
  }

  return { toolName, locale };
}
