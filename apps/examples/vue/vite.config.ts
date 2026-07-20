import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const dependency = (name: string): string => fileURLToPath(new URL(`./node_modules/@oriatheme/${name}`, import.meta.url));
const oriaDependencies = ["@oriatheme/colors", "@oriatheme/core", "@oriatheme/editor-core", "@oriatheme/runtime-dom", "@oriatheme/vue-editor"];

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: ["colors", "core", "editor-core", "runtime-dom", "vue-editor"].map(name => ({
      find: new RegExp(`^@oriatheme/${name}$`),
      replacement: dependency(name),
    })),
  },
  // Keep linked workspace packages out of Vite's dependency cache and watch their
  // rebuilt dist files, so public API additions are available without a stale-module
  // white screen during development.
  optimizeDeps: { exclude: oriaDependencies, force: true },
  server: {
    watch: {
      ignored: (path): boolean => path.includes("/node_modules/") && !path.includes("/node_modules/@oriatheme/"),
    },
  },
});
