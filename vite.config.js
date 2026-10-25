import { defineConfig } from "vite";
export default defineConfig({
  // GitHub Pages project-site path; local dev keeps root '/'.
  base: process.env.GITHUB_ACTIONS ? "/HIGHFLY-FOUNDATION/" : "/",
  build: { outDir: "dist", sourcemap: false, assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 7500 }
});
