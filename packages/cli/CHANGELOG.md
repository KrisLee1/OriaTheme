# @oriatheme/cli

## 0.1.2

### Patch Changes

- 869996e: Improve theme editor input smoothness: pattern layer unit and number fields now buffer in-progress text and only commit Core-safe values, token fields no longer re-render the whole field tree on every revision, and editor-core reuses a single per-draft validation for snapshot diagnostics, preview, and save.

## 0.1.1

### Patch Changes

- 095f880: Add package-specific README files to every public npm tarball.

## 0.1.0

### Minor Changes

- Publish the first public OriaTheme release at a consistent `0.1.0` version across all packages.

### Patch Changes

- 2b22ec4: Add the verified source-component installer for the React and Vue theme editor registry. It supports bundled, local, and HTTPS registries; validates schema, paths, hashes, and size limits; records installation baselines; and provides dry-run, explicit overwrite, and three-way diff safety controls without executing registry scripts.
