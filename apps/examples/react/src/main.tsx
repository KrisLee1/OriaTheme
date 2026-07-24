import { createRoot } from "react-dom/client";
import { OriaThemeProvider } from "@oriatheme/react";
import { migrateOriaStandardV1ToV2 } from "@oriatheme/core";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { DemoPage } from "./page.js";
import "@oriatheme/colors/styles.css";
import "../../styles.css";

bootstrapTheme({ contract: { name: "oria-standard", version: 2 } });

createRoot(document.querySelector("#root")!).render(<OriaThemeProvider config={{ presets: oriaPresetThemes, defaultThemeId: "oria-default", migrations: [migrateOriaStandardV1ToV2], transition: {type: "view-transition", duration: 360}  }}><DemoPage framework="React" /></OriaThemeProvider>);
