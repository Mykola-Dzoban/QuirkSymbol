/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		headers: {
			// Firebase Auth signInWithPopup потребує збереження зв'язку з opener-вікном.
			'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
		},
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.{ts,tsx}'],
	},
});
