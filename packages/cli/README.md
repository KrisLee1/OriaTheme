# @oriatheme/cli

Install verified, user-owned React or Vue OriaTheme editor source components. The CLI validates manifests and SHA-256 hashes, refuses unsafe paths and implicit overwrites, and never runs registry scripts or a package manager.

## Install and run

Run the CLI without a global installation:

```bash
npm exec --yes --package=@oriatheme/cli@latest -- oria add theme-editor --framework react --dry-run
npm exec --yes --package=@oriatheme/cli@latest -- oria add theme-editor --framework react --yes
```

Use `--framework vue` for Vue. The CLI writes components to `components/oria-theme-editor/` by default, updates `package.json`, and leaves lockfile generation to the project's package manager.

Inspect a later update without writing files:

```bash
npm exec --yes --package=@oriatheme/cli@latest -- oria diff theme-editor --framework react
```

## Security model

Only bundled registries, local paths, and HTTPS registries are accepted. The CLI rejects manifest scripts, HTTP URLs, path traversal, symbolic-link targets, hash mismatches, and implicit overwrites.

## Documentation

- [Theme editor guide](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/theme-editors.md)
- [Package-manager compatibility](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/package-managers.md)
- [Editor component registry](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/editor-component-registry.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)
