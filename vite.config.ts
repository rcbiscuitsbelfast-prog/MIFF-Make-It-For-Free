import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const samplerRoot = resolve(__dirname, 'sampler');
  const hasSampler = fs.existsSync(samplerRoot) && fs.existsSync(resolve(samplerRoot, 'index.html'));
  const root = hasSampler ? 'sampler' : '.';
  const inputHtml = hasSampler ? resolve(__dirname, 'sampler/index.html') : resolve(__dirname, 'index.html');

  const chunkCandidates: Record<string, string> = {
    'miff-core': 'modules/pure/ZoneSystemPure.ts',
    'overlink': 'OverlinkPure/OverlinkZone.ts',
    'themes': 'OverlinkPure/OverlinkThemes.ts',
    'audio': 'OverlinkPure/AudioManager.ts',
    'badges': 'badges/index.ts'
  };
  const manualChunks: Record<string, string[]> = {};
  for (const [chunkName, relPath] of Object.entries(chunkCandidates)) {
    const absPath = resolve(__dirname, relPath);
    if (fs.existsSync(absPath)) {
      manualChunks[chunkName] = [relPath];
    }
  }

  const outDir = hasSampler ? '../dist' : 'dist';

  return {
  root,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: inputHtml
      },
      output: {
        manualChunks: Object.keys(manualChunks).length ? manualChunks : undefined
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
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || mode)
  }
};
});