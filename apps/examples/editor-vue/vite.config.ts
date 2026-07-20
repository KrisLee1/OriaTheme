import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const dependency = (name: string): string => fileURLToPath(new URL(`./node_modules/@oriatheme/${name}`, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: ["colors", "core", "editor-core", "runtime-dom", "vue-editor"].map(name => ({
      find: new RegExp(`^@oriatheme/${name}$`),
      replacement: dependency(name),
    })),
  },
});
