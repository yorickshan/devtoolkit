import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
  { ignores: ['dist', 'src-tauri', 'node_modules', 'vite.config.ts', 'vitest.config.ts', 'eslint.config.js'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/utils/**/*.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'off',
      'prefer-rest-params': 'off',
      'no-prototype-builtins': 'off',
      'no-constant-binary-expression': 'off',
      'no-cond-assign': 'off',
      'no-fallthrough': 'off',
      'no-case-declarations': 'off',
      'no-undef': 'off',
      'no-var': 'off',
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off',
      'no-control-regex': 'off',
      'no-irregular-whitespace': 'off',
      'no-misleading-character-class': 'off',
      'preserve-caught-error': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-constant-condition': 'off',
      'no-empty': 'off',
      'prefer-spread': 'off',
      'prefer-const': 'off',
    },
  },
);
