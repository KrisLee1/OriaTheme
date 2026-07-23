import path from "node:path";
import { fileURLToPath } from "node:url";

const packageNames = ["colors", "core", "editor-core", "presets", "react", "react-editor", "runtime-dom"];
const websiteDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * The editor page intentionally shares the maintained Next example's visual
 * composition. Resolve every OriaTheme import in that composition to the
 * website's published dependency graph, so it has one React context/runtime.
 */
const nextConfig = {
  output: "export",
  webpack(config) {
    for (const name of packageNames) {
      config.resolve.alias[`@oriatheme/${name}$`] = path.join(websiteDirectory, "node_modules", "@oriatheme", name, "dist", "index.js");
    }
    return config;
  },
};

export default nextConfig;
