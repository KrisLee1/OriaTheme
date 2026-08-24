---
"@oriatheme/core": minor
"@oriatheme/colors": minor
"@oriatheme/presets": minor
"@oriatheme/cli": minor
---

Adopt complete OKLCH values for the v2 default theme, official presets, migrations, seed generation, and the public base-color library while retaining validation compatibility for existing static HEX, RGB, HSL, and named-color custom themes.

Add stable per-theme `@oriatheme/presets/<theme-slug>` entry points so applications can ship only their selected official presets without evaluating the root catalog.

Upgrade the React and Vue source-editor registry item with OKLCH-aware color controls and shared Copy/Download TypeScript actions that produce paste-ready `.oria-theme.ts` files and `ThemeDefinition` constants alongside the existing JSON actions.
