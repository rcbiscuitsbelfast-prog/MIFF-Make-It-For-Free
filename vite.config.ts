import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './src/game',
  publicDir: '../../public',
  build: {
    outDir: '../../dist/game',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/game/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@miff': path.resolve(__dirname, './miff'),
      '@assets': path.resolve(__dirname, './public/assets')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
