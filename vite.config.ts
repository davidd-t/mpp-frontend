/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const httpsConfig = process.env.VITE_HTTPS
  ? {
      key: fs.readFileSync(path.resolve(__dirname, '../certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.pem')),
    }
  : undefined

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: httpsConfig,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}']
    }
  }
})
