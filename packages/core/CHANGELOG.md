# @oriatheme/core

## 0.1.0

### Minor Changes

- 2b22ec4: Extend structured gradient values with `repeating-linear`, `repeating-radial`, and `conic` variants plus nine-grid and structured percentage origins, including validation and safe CSS compilation while preserving existing linear, radial, and five-position theme data.
- 2b22ec4: Add the independent 22-family Oria base color library with ordinary CSS variables and a Tailwind CSS v4 bridge that compiles standard color utility class names while retaining Oria-owned values. Keep the 900 and 950 shades visibly chromatic instead of collapsing toward black. Finalize the unreleased `oria-standard@1` contract without `palette.*` theme fields or runtime variables, and remove base-palette editing from the editor registry.

### Patch Changes

- 2b22ec4: Add the complete 36-theme official preset catalog and named preset exports, including the black-and-white outline-first Line Art theme. Remove the overlapping System Glass preset before the initial release and consolidate its role into a redesigned Glass theme with layered edge highlights, inset light bands, backdrop material, and accessible semantic surfaces. Keep the runtime catalog minimal with only theme references and categories while retaining descriptions, research, ordering, and release workflow information in documentation. Redesign every official theme as an independent light/dark visual system and calibrate its full radius scale and semantic colors. Redesign Oria Default around cool-white floating surfaces, a bright cyan-blue focus color, restrained single-edge highlights, and a coordinated cool data palette; give Glass a prismatic chart sequence whose feedback colors are an accessible subset. Move Minimalism to a black and dark-gray monochrome system.
- 2b22ec4: Prepare the v1 theme contract, optional preset collection, DOM runtime, framework adapters, bootstrap support, and release verification artifacts.
