// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://tech-vexy.github.io',
	base: '/',
	integrations: [mdx(), sitemap()],
	build: {
		inlineStylesheets: 'auto',
	},
	compressHTML: true,
	vite: {
		build: {
			minify: 'esbuild',
			cssMinify: true,
		},
	},
	security: {
		checkOrigin: true,
	},
});
