import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'react-trellis-gallery': resolve(
				__dirname,
				process.env.CI ? '../../dist' : '../../src',
			),
		},
	},
})
