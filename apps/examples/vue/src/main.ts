import { createApp } from "vue";
import { createOriaTheme } from "@oriatheme/vue";
import { migrateOriaStandardV1ToV2 } from "@oriatheme/core";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import "@oriatheme/colors/styles.css";
import App from "./page.js";
import "../../styles.css";

bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });

createApp(App).use(createOriaTheme({ presets: oriaPresetThemes, defaultThemeId: "oria-default", migrations: [migrateOriaStandardV1ToV2], transition: {type: "view-transition", duration: 360}  })).mount("#app");
