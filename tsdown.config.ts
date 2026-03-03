import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['./src/index.ts'],
	format: ['esm', 'cjs'],
	platform: 'neutral',
	dts: true,
	clean: true,
	sourcemap: true,
	external: ['react', 'react-dom', 'react-window', '@zag-js/floating-panel', '@zag-js/react'],
})
