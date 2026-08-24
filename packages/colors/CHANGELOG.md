# @oriatheme/colors

## 0.2.0

### Minor Changes

- 7ee24b5: Adopt complete OKLCH values for the v2 default theme, official presets, migrations, seed generation, and the public base-color library while retaining validation compatibility for existing static HEX, RGB, HSL, and named-color custom themes.

  Add stable per-theme `@oriatheme/presets/<theme-slug>` entry points so applications can ship only their selected official presets without evaluating the root catalog.

  Upgrade the React and Vue source-editor registry item with OKLCH-aware color controls and shared Copy/Download TypeScript actions that produce paste-ready `.oria-theme.ts` files and `ThemeDefinition` constants alongside the existing JSON actions.

## 0.1.1

### Patch Changes

- 095f880: Add package-specific README files to every public npm tarball.

## 0.1.0

### Minor Changes

- 2b22ec4: Add the independent 22-family Oria base color library with ordinary CSS variables and a Tailwind CSS v4 bridge that compiles standard color utility class names while retaining Oria-owned values. Keep the 900 and 950 shades visibly chromatic instead of collapsing toward black. Finalize the unreleased `oria-standard@1` contract without `palette.*` theme fields or runtime variables, and remove base-palette editing from the editor registry.
