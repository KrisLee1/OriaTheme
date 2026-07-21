# @oriatheme/editor-core

## 0.1.2

### Patch Changes

- 869996e: Improve theme editor input smoothness: pattern layer unit and number fields now buffer in-progress text and only commit Core-safe values, token fields no longer re-render the whole field tree on every revision, and editor-core reuses a single per-draft validation for snapshot diagnostics, preview, and save.

## 0.1.1

### Patch Changes

- 095f880: Add package-specific README files to every public npm tarball.
- Updated dependencies [095f880]
- Updated dependencies [1cb13aa]
  - @oriatheme/core@0.2.0
  - @oriatheme/runtime-dom@0.1.1

## 0.1.0

### Minor Changes

- 2b22ec4: Add framework-independent theme editor sessions, contract field descriptors with shared/mode scope, deterministic smart-scale helpers, and atomic multi-token edits. Shared typography, shape, spacing, control, effect, and motion edits are materialized into both complete mode token sets in one revision. Ship React and Vue as independently installable headless session bridges with frame-coalesced automatic preview, while visible editor UI is delivered as user-owned registry source instead of package CSS or a black-box component.
- 2b22ec4: Add the independent 22-family Oria base color library with ordinary CSS variables and a Tailwind CSS v4 bridge that compiles standard color utility class names while retaining Oria-owned values. Keep the 900 and 950 shades visibly chromatic instead of collapsing toward black. Finalize the unreleased `oria-standard@1` contract without `palette.*` theme fields or runtime variables, and remove base-palette editing from the editor registry.

### Patch Changes

- Updated dependencies [2b22ec4]
- Updated dependencies
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
  - @oriatheme/core@0.1.0
  - @oriatheme/runtime-dom@0.1.0
