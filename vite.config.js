import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        italian: fileURLToPath(new URL('./it/index.html', import.meta.url)),
        english: fileURLToPath(new URL('./en/index.html', import.meta.url)),
      },
    },
  },
});
