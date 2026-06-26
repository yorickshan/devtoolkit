import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/tool/json-format',
      name: 'json-format',
      component: () => import('@/views/tools/JsonFormat.vue'),
    },
    {
      path: '/tool/json-diff',
      name: 'json-diff',
      component: () => import('@/views/tools/JsonDiff.vue'),
    },
    {
      path: '/tool/en-decode',
      name: 'en-decode',
      component: () => import('@/views/tools/EnDecode.vue'),
    },
    {
      path: '/tool/qr-code',
      name: 'qr-code',
      component: () => import('@/views/tools/QrCode.vue'),
    },
    {
      path: '/tool/timestamp',
      name: 'timestamp',
      component: () => import('@/views/tools/Timestamp.vue'),
    },
    {
      path: '/tool/code-beautify',
      name: 'code-beautify',
      component: () => import('@/views/tools/CodeBeautify.vue'),
    },
    {
      path: '/tool/regexp',
      name: 'regexp',
      component: () => import('@/views/tools/Regexp.vue'),
    },
    {
      path: '/tool/uuid-gen',
      name: 'uuid-gen',
      component: () => import('@/views/tools/UuidGen.vue'),
    },
    {
      path: '/tool/trans-radix',
      name: 'trans-radix',
      component: () => import('@/views/tools/TransRadix.vue'),
    },
    {
      path: '/tool/postman',
      name: 'postman',
      component: () => import('@/views/tools/Postman.vue'),
    },
    {
      path: '/tool/screenshot',
      name: 'screenshot',
      component: () => import('@/views/tools/Screenshot.vue'),
    },
    {
      path: '/tool/byte-unit',
      name: 'byte-unit',
      component: () => import('@/views/tools/ByteUnit.vue'),
    },
    {
      path: '/tool/color-picker',
      name: 'color-picker',
      component: () => import('@/views/tools/ColorPicker.vue'),
    },
    {
      path: '/tool/password',
      name: 'password',
      component: () => import('@/views/tools/Password.vue'),
    },
    {
      path: '/tool/mock-data',
      name: 'mock-data',
      component: () => import('@/views/tools/MockData.vue'),
    },
    {
      path: '/tool/html2markdown',
      name: 'html2markdown',
      component: () => import('@/views/tools/Html2Markdown.vue'),
    },
    {
      path: '/tool/image-base64',
      name: 'image-base64',
      component: () => import('@/views/tools/ImageBase64.vue'),
    },
    {
      path: '/tool/date-calc',
      name: 'date-calc',
      component: () => import('@/views/tools/DateCalc.vue'),
    },
    {
      path: '/tool/crontab',
      name: 'crontab',
      component: () => import('@/views/tools/Crontab.vue'),
    },
    {
      path: '/tool/loan-rate',
      name: 'loan-rate',
      component: () => import('@/views/tools/LoanRate.vue'),
    },
    {
      path: '/tool/code-compress',
      name: 'code-compress',
      component: () => import('@/views/tools/CodeCompress.vue'),
    },
    {
      path: '/tool/svg-converter',
      name: 'svg-converter',
      component: () => import('@/views/tools/SvgConverter.vue'),
    },
    {
      path: '/tool/excel2json',
      name: 'excel2json',
      component: () => import('@/views/tools/Excel2Json.vue'),
    },
    {
      path: '/tool/chart-maker',
      name: 'chart-maker',
      component: () => import('@/views/tools/ChartMaker.vue'),
    },
    {
      path: '/tool/sticky-notes',
      name: 'sticky-notes',
      component: () => import('@/views/tools/StickyNotes.vue'),
    },
    {
      path: '/tool/websocket',
      name: 'websocket',
      component: () => import('@/views/tools/WebSocket.vue'),
    },
    {
      path: '/tool/naotu',
      name: 'naotu',
      component: () => import('@/views/tools/Naotu.vue'),
    },
    {
      path: '/tool/poster-maker',
      name: 'poster-maker',
      component: () => import('@/views/tools/PosterMaker.vue'),
    },
    {
      path: '/tool/grid-ruler',
      name: 'grid-ruler',
      component: () => import('@/views/tools/GridRuler.vue'),
    },
    {
      path: '/tool/page-timing',
      name: 'page-timing',
      component: () => import('@/views/tools/PageTiming.vue'),
    },
    {
      path: '/tool/page-monkey',
      name: 'page-monkey',
      component: () => import('@/views/tools/PageMonkey.vue'),
    },
    {
      path: '/tool/devtools',
      name: 'devtools',
      component: () => import('@/views/tools/DevTools.vue'),
    },
    {
      path: '/tool/dynamic-inject',
      name: 'dynamic-inject',
      component: () => import('@/views/tools/DynamicInject.vue'),
    },
    {
      path: '/tool/text-diff',
      name: 'text-diff',
      component: () => import('@/views/tools/TextDiff.vue'),
    },
    {
      path: '/tool/regex-db',
      name: 'regex-db',
      component: () => import('@/views/tools/RegexDB.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
  ],
});

export default router;
