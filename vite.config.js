import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `VITE_BASE_PATH` is set by the deploy workflow to `/<repo-name>/` so the built
 * assets resolve under the GitHub Pages project-site subpath. Defaults to `/`
 * for local dev and `npm run build:local`.
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
  },
  publicDir: 'public',
  plugins: [react({ include: /\.jsx$/ })],
});
