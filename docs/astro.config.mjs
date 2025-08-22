import { defineConfig } from 'astro/config';
import markdown from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://miff-framework.github.io',
  base: '/miff',
  title: 'MIFF Framework Documentation',
  description: 'Modular, CLI-first, engine-agnostic game development framework',
  markdown: {
    remarkPlugins: [
      'remark-gfm',
      'remark-toc'
    ],
    rehypePlugins: [
      'rehype-slug',
      'rehype-autolink-headings'
    ],
    syntaxHighlight: 'prism'
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('404')
    }),
    tailwind()
  ],
  vite: {
    ssr: {
      external: ['prismjs']
    }
  },
  build: {
    assets: '_assets'
  },
  experimental: {
    assets: true
  },
  outDir: './dist',
  publicDir: './public'
});