import { createApp } from "vue";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import "@oriatheme/colors/styles.css";
import App from "./page.js";
import "../../styles.css";

bootstrapTheme();

createApp(App).use(createOriaTheme({ presets: oriaPresetThemes, defaultThemeId: "oria-default", transition: {type: "view-transition", duration: 420}  })).mount("#app");
