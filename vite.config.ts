import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'sampler',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'sampler/index.html')
      },
      output: {
        manualChunks: {
          'miff-core': ['modules/pure/ZoneSystemPure.ts'],
          'overlink': ['OverlinkPure/OverlinkZone.ts'],
          'themes': ['OverlinkPure/OverlinkThemes.ts'],
          'audio': ['OverlinkPure/AudioManager.ts'],
          'badges': ['badges/index.ts']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      'modules': resolve(__dirname, './modules'),
      'OverlinkPure': resolve(__dirname, './OverlinkPure'),
      'badges': resolve(__dirname, './badges')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});