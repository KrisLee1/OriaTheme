import { createApp } from "vue";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { createOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import "@oriatheme/colors/styles.css";
import "./styles.css";
import App from "./page.js";

bootstrapTheme();

createApp(App).use(createOriaTheme({ presets: oriaPresetThemes, defaultThemeId: "oria-default" })).mount("#app");
