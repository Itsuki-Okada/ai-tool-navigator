/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base: './' にすると GitHub Pages などのサブディレクトリでもそのまま動きます
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // 日本語の質問・テンプレートデータを含むため、警告の基準を少し上げています（gzip後は約160KB）
  build: { chunkSizeWarningLimit: 700 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
