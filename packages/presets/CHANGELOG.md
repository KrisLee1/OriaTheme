# @oriatheme/presets

## 0.4.0

### Minor Changes

- Rebuild all 41 official presets as native `oria-standard@2` themes (breaking change). Every export (`oriaPresetThemes`, the named themes, `oriaPresetCatalog`) now targets the v2 contract and requires the v2-capable Core and Runtime; v1 no longer ships official presets. Preset IDs and display names are unchanged. Geometry is normalized to the v2 model — a single `space`/`radius` source, fixed radius multiples, and integer control multipliers — so individual presets can differ visually from their v1 rendering.

### Patch Changes

- Updated dependencies
  - @oriatheme/core@0.3.0

## 0.3.0

### Minor Changes

- 869996e: Breaking: rename the Document Canvas preset to Manuscript, including its stable ID (`oria-document-canvas` → `oria-manuscript`) and named export (`oriaDocumentCanvasTheme` → `oriaManuscriptTheme`); token data is unchanged (ADR-0016). Persisted selections of the old ID fall back to the default theme under existing runtime semantics, and consumers must update imports and ID-based references. Also reorder the preview catalog: Manuscript now follows Default, with the Mono–Memphis visual-style group right after it; all remaining presets keep their previous relative order.

### Patch Changes

- 869996e: Retune Glass from the maintainer's editor export: translucent raised surfaces and thinner borders in both modes, a neutral near-black dark glass with solid surface gradient, two-stop accent gradients, no background gradient, and a bright dark selection. The three resulting contrast warnings (alpha raised surfaces in both modes, dark selection ratio) are documented as an intentional exception in the preset catalog.
- 869996e: Retune preset patterns: Punchcard dots are larger and more widely spaced in both modes, Sketchbook moves to a dot `pattern.background` with a 1px grid `pattern.surface`, and Theorem gains a paper-grain `pattern.background` in both modes.

## 0.2.0

### Minor Changes

- 1cb13aa: Add the Golden Bazaar preset with sunlit gold, coral, and indigo storefront styling.
- 1cb13aa: Add the Punchcard official preset: a warm-paper dashboard with ink outlines, hard shadows, yellow, pink, and sky-blue stat surfaces, and an optional structured dot pattern. Add the `pattern.dot` Token Contract capability with safe validation and CSS compilation. Rename the first four official display names to Default, Ocean, Forest, and Aurora while preserving their stable IDs and named exports.
- 1cb13aa: Add the Sketchbook preset with hand-drawn paper, ink, and pastel note styling.
- 1cb13aa: Add the Soft Clay preset for thick, rounded cream control surfaces with directional highlights and shadows.

### Patch Changes

- 1cb13aa: Refresh Document Canvas with a cool-gray paper surface, graphite controls, restrained elevation, monospaced display typography, and safe optional paper texture.
- 095f880: Add package-specific README files to every public npm tarball.
- Updated dependencies [095f880]
- Updated dependencies [1cb13aa]
  - @oriatheme/core@0.2.0

## 0.1.0

### Minor Changes

- 2b22ec4: Add the complete 36-theme official preset catalog and named preset exports, including the black-and-white outline-first Line Art theme. Remove the overlapping System Glass preset before the initial release and consolidate its role into a redesigned Glass theme with layered edge highlights, inset light bands, backdrop material, and accessible semantic surfaces. Keep the runtime catalog minimal with only theme references and categories while retaining descriptions, research, ordering, and release workflow information in documentation. Redesign every official theme as an independent light/dark visual system and calibrate its full radius scale and semantic colors. Redesign Oria Default around cool-white floating surfaces, a bright cyan-blue focus color, restrained single-edge highlights, and a coordinated cool data palette; give Glass a prismatic chart sequence whose feedback colors are an accessible subset. Move Minimalism to a black and dark-gray monochrome system.

### Patch Changes

- 2b22ec4: Add the independent 22-family Oria base color library with ordinary CSS variables and a Tailwind CSS v4 bridge that compiles standard color utility class names while retaining Oria-owned values. Keep the 900 and 950 shades visibly chromatic instead of collapsing toward black. Finalize the unreleased `oria-standard@1` contract without `palette.*` theme fields or runtime variables, and remove base-palette editing from the editor registry.
- 2b22ec4: Prepare the v1 theme contract, optional preset collection, DOM runtime, framework adapters, bootstrap support, and release verification artifacts.
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
  - @oriatheme/core@0.1.0
