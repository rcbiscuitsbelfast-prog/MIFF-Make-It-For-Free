import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://rcbiscuitsbelfast-prog.github.io',
  base: '/MIFF-Make-It-For-Free',
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
  outDir: './dist',
  publicDir: './public'
});