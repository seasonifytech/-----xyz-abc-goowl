import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  resolve: {
    alias: {
      // Add alias to help resolve together-ai package
      'together-ai': path.resolve(__dirname, 'node_modules/together-ai')
    }
  },
  optimizeDeps: {
    include: ['together-ai']
  }
});