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
        englishServices: fileURLToPath(new URL('./en/services/index.html', import.meta.url)),
        italianServices: fileURLToPath(new URL('./it/servizi/index.html', import.meta.url)),
        englishPrivacy: fileURLToPath(new URL('./en/privacy/index.html', import.meta.url)),
        italianPrivacy: fileURLToPath(new URL('./it/privacy/index.html', import.meta.url)),
      },
    },
  },
});
