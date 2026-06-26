# ⚡ DevToolkit

> Developer toolbox — cross-platform desktop app built with Tauri v2 + Vue 3

[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)](https://github.com/yorickshan/devtoolkit)
[![Tests](https://img.shields.io/badge/tests-73%20passed-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

- 🧰 **35+ dev tools** — JSON formatter, encoder/decoder, QR code, timestamp, regex, Postman, WebSocket, and more
- 🖥️ **DevToys-style layout** — sidebar navigation + dual-panel input/output + global search (Ctrl+K)
- 🌗 **System theme aware** — dark / light / follow system, adapts automatically
- 🌍 **Multi-language** — 简体中文 / English
- 🚀 **Blazing fast** — Rust backend + Vue 3 + Monaco Editor
- 📦 **Lightweight packaging** — DMG ~10 MB
- 🔧 **System integration** — tray icon, screenshot, window state persistence

## 🛠️ Tool Categories

| Category | Tools |
|----------|-------|
| **Formatters** | JSON Formatter · JSON Diff · Code Beautify · Code Compress |
| **Encoders** | Base64 · URL · Unicode · HTML Entities · JWT · MD5 · SHA1 · Gzip |
| **Generators** | UUID / Snowflake · QR Code · Password · Mock Data |
| **Converters** | Timestamp · Radix · Byte · Color · Date · Loan · HTML→MD · Image→Base64 · SVG · Excel→JSON |
| **Network** | Postman · WebSocket · Page Timing · DevTools |
| **Text** | Regex Tester · Crontab · Page Monkey · Dynamic Inject · Sticky Notes |
| **Image** | Screenshot · Chart Maker · Poster Maker |
| **Other** | Mind Map · Grid Ruler |

## 📦 Getting Started

### Installation

Download the installer for your platform from [Releases](https://github.com/yorickshan/devtoolkit/releases):

- **macOS**: `DevToolkit_0.1.0_aarch64.dmg`
- **Windows**: `DevToolkit_0.1.0_x64-setup.exe`
- **Linux**: `DevToolkit_0.1.0_amd64.deb`

### Development

```bash
# Prerequisites
# Node.js v20+ | pnpm | Rust (stable) | macOS / Windows / Linux

git clone https://github.com/yorickshan/devtoolkit.git
cd devtoolkit

pnpm install            # Install dependencies
pnpm run tauri dev      # Dev mode with hot reload
pnpm run vitest run     # Run 73 tests
pnpm run tauri build    # Production build → src-tauri/target/release/bundle/
```

## 🏗️ Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | Vue 3 (Composition API) | `<script setup lang="ts">` |
| Build | Vite 6 + TypeScript 5 (strict) | HMR |
| UI | Naive UI | Dark / light themes |
| Editor | Monaco Editor | VS Code core |
| Shell | Tauri v2 | Rust backend + WebView |
| State | Pinia + localStorage | Session persistence |
| Testing | Vitest | 73 tests passing |
| i18n | vue-i18n | zh-CN / en |

## 📄 License

MIT © [yorickshan](https://github.com/yorickshan)
