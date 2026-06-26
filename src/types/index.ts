export type ToolCategory =
  | 'converter'
  | 'encoder'
  | 'formatter'
  | 'generator'
  | 'network'
  | 'image'
  | 'text'
  | 'other';

export type ToolComplexity = 'low' | 'medium' | 'high';

export interface ToolDefinition {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: ToolCategory;
  complexity: ToolComplexity;
  keywords: string[];
  route: string;
  phase: 1 | 2 | 3;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Locale = 'zh-CN' | 'en';

export interface ToolSettings {
  [key: string]: unknown;
}

export interface AppPreferences {
  theme: ThemeMode;
  locale: Locale;
  recentTools: string[];
  favorites: string[];
  splitRatio: number;
}

export interface PanelInfo {
  chars: number;
  lines: number;
  language: string;
  isValid: boolean;
  message: string;
}
