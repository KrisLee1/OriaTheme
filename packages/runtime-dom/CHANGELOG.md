# @oriatheme/runtime-dom

## 0.2.0

### Minor Changes

- Default to the `oria-standard@2` contract and add explicit persisted-theme migrations (breaking change). A runtime configured without a contract now resolves v2 and emits kebab-case variables. Persisted v1 custom themes are rejected unless the caller registers `migrations: [migrateOriaStandardV1ToV2]`; registered themes are migrated, fully revalidated, atomically applied, and written back to storage. Bootstrap accepts an exact contract ref so stale v1 snapshots are rejected and the static fallback is kept.

### Patch Changes

- Updated dependencies
  - @oriatheme/core@0.3.0

## 0.1.2

### Patch Changes

- f0b1aa9: Remove the first-paint bootstrap stylesheet after a successful runtime apply so optional gradient and pattern variables from a previous theme cannot remain in the cascade.

## 0.1.1

### Patch Changes

- 095f880: Add package-specific README files to every public npm tarball.
- Updated dependencies [095f880]
- Updated dependencies [1cb13aa]
  - @oriatheme/core@0.2.0

## 0.1.0

### Minor Changes

- Publish the first public OriaTheme release at a consistent `0.1.0` version across all packages.

### Patch Changes

- 2b22ec4: Prepare the v1 theme contract, optional preset collection, DOM runtime, framework adapters, bootstrap support, and release verification artifacts.
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
- Updated dependencies [2b22ec4]
  - @oriatheme/core@0.1.0
