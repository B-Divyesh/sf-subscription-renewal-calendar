import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022', sourcemap: false,
    rollupOptions: { output: { entryFileNames: 'assets/app.js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
