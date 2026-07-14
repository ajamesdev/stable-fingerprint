import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const entry = fileURLToPath(new URL('../src/index.ts', import.meta.url));

export default defineConfig({
	plugins: [tailwindcss()],
	// serve the library source directly during development
	server: { fs: { allow: [root] } },
	resolve: { alias: { fingerprinter: entry } }
});
