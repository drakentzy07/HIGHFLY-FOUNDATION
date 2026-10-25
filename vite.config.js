import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  // GitHub Pages project-site path; local dev keeps root '/'.
  base: process.env.GITHUB_ACTIONS ? "/HIGHFLY-FOUNDATION/" : "/",
  build: { outDir: "dist", sourcemap: false, assetsInlineLimit: 4096,
    rollupOptions: { input: { main: resolve("index.html"), nativeProbe: resolve("native-probe.html") } } }
});
