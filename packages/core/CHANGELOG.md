# @oriatheme/core

## 0.4.0

### Minor Changes

- 7ee24b5: Adopt complete OKLCH values for the v2 default theme, official presets, migrations, seed generation, and the public base-color library while retaining validation compatibility for existing static HEX, RGB, HSL, and named-color custom themes.

  Add stable per-theme `@oriatheme/presets/<theme-slug>` entry points so applications can ship only their selected official presets without evaluating the root catalog.

  Upgrade the React and Vue source-editor registry item with OKLCH-aware color controls and shared Copy/Download TypeScript actions that produce paste-ready `.oria-theme.ts` files and `ThemeDefinition` constants alongside the existing JSON actions.

### Patch Changes

- 7ee24b5: Refine every official preset's shape and elevation language with restrained radius scales, complete theme-specific shadow hierarchies, and material-only inner highlights. Make Line Art fully opaque, neutralize the default theme's surfaces without changing the legacy v1 default, and improve Glass dark-mode surface separation around its softer blue primary.

## 0.3.0

### Minor Changes

- Make `oria-standard@2` the default and only standard contract (breaking change, ADR-0019). `oriaStandardContract` and `oriaDefaultTheme` now refer to v2: 134 source tokens with lowercase dot paths, kebab-case CSS output, and declared derived variables (`--oria-radius-*`, `--oria-control-height-*`, `--oria-control-padding-x-*`). v1 remains available as explicit migration input through the legacy exports `oriaStandardContractV1`, `oriaDefaultThemeV1`, and `migrateOriaStandardV1ToV2()`. Contract validation now enforces the v2 integer control-multiplier rule. See the v1→v2 migration guide.

## 0.2.0

### Minor Changes

- 1cb13aa: Add the Punchcard official preset: a warm-paper dashboard with ink outlines, hard shadows, yellow, pink, and sky-blue stat surfaces, and an optional structured dot pattern. Add the `pattern.dot` Token Contract capability with safe validation and CSS compilation. Rename the first four official display names to Default, Ocean, Forest, and Aurora while preserving their stable IDs and named exports.

### Patch Changes

- 095f880: Add package-specific README files to every public npm tarball.

## 0.1.0

### Minor Changes

- 2b22ec4: Extend structured gradient values with `repeating-linear`, `repeating-radial`, and `conic` variants plus nine-grid and structured percentage origins, including validation and safe CSS compilation while preserving existing linear, radial, and five-position theme data.
- 2b22ec4: Add the independent 22-family Oria base color library with ordinary CSS variables and a Tailwind CSS v4 bridge that compiles standard color utility class names while retaining Oria-owned values. Keep the 900 and 950 shades visibly chromatic instead of collapsing toward black. Finalize the unreleased `oria-standard@1` contract without `palette.*` theme fields or runtime variables, and remove base-palette editing from the editor registry.

### Patch Changes

- 2b22ec4: Add the complete 36-theme official preset catalog and named preset exports, including the black-and-white outline-first Line Art theme. Remove the overlapping System Glass preset before the initial release and consolidate its role into a redesigned Glass theme with layered edge highlights, inset light bands, backdrop material, and accessible semantic surfaces. Keep the runtime catalog minimal with only theme references and categories while retaining descriptions, research, ordering, and release workflow information in documentation. Redesign every official theme as an independent light/dark visual system and calibrate its full radius scale and semantic colors. Redesign Oria Default around cool-white floating surfaces, a bright cyan-blue focus color, restrained single-edge highlights, and a coordinated cool data palette; give Glass a prismatic chart sequence whose feedback colors are an accessible subset. Move Minimalism to a black and dark-gray monochrome system.
- 2b22ec4: Prepare the v1 theme contract, optional preset collection, DOM runtime, framework adapters, bootstrap support, and release verification artifacts.
