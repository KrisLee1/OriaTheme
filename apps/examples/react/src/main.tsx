import { createRoot } from "react-dom/client";
import { OriaThemeProvider } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import { bootstrapTheme } from "@oriatheme/runtime-dom";
import { DemoPage } from "./page.js";
import "@oriatheme/colors/styles.css";
import "../../styles.css";

bootstrapTheme();

createRoot(document.querySelector("#root")!).render(<OriaThemeProvider config={{ presets: oriaPresetThemes, defaultThemeId: "oria-default", transition: {type: "view-transition", duration: 400}  }}><DemoPage framework="React" /></OriaThemeProvider>);
