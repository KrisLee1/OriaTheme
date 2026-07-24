import { createApp } from "vue";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { createOriaTheme } from "@oriatheme/vue";
import { migrateOriaStandardV1ToV2 } from "@oriatheme/core";
import { oriaPresetThemes } from "@oriatheme/presets";
import "@oriatheme/colors/styles.css";
import "./styles.css";
import App from "./page.js";

bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });

createApp(App).use(createOriaTheme({ presets: oriaPresetThemes, defaultThemeId: "oria-default", migrations: [migrateOriaStandardV1ToV2] })).mount("#app");
