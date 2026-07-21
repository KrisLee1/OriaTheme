"use client";

import type { ReactNode } from "react";
import { OriaThemeProvider } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";

export function Providers({ children }: { readonly children: ReactNode }) {
  return <OriaThemeProvider config={{ presets: oriaPresetThemes, defaultThemeId: "oria-default", transition: {type: "view-transition", duration: 360} }}>{children}</OriaThemeProvider>;
}
