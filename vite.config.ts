import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 所有依赖都来自本地 node_modules；构建产物不含任何外部域名引用。
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { outDir: 'dist', sourcemap: false, reportCompressedSize: false },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
} as never)
