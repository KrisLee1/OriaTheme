# @oriatheme/tailwind

Static Tailwind CSS v4 bridge for `oria-standard@2` runtime variables. Oria stays the canonical source: the runtime never emits Tailwind's unprefixed theme namespace, and this package maps known `--oria-*` variables into `@theme inline` at build time. Tailwind is only a build/test dependency of this package — Core and Runtime never depend on it.

## Install

```bash
npm install @oriatheme/tailwind
```

## Use

Import the default bridge after Tailwind and the Oria color library:

```css
@import "tailwindcss";
@import "@oriatheme/colors/styles.css";
@import "@oriatheme/colors/tailwind.css";
@import "@oriatheme/tailwind/oria.css";
```

This provides utilities such as `bg-background`, `text-primary-foreground`, `text-base`, `font-semibold`, `p-4`, `rounded-lg`, `shadow-md`, `blur-lg` and the explicit Oria utilities `backdrop-oria-*`, `duration-oria-*`, `ease-oria-*`, `bg-oria-canvas`, `bg-oria-surface`, `inset-shadow-oria` and `shadow-highlight`.

A custom runtime CSS variable prefix needs a prebuilt static bridge; CSS variable names cannot be concatenated at runtime:

```ts
import { generateOriaTailwindBridge } from "@oriatheme/tailwind";

const bridge = generateOriaTailwindBridge({ prefix: "acme" });
```

## Documentation

- [Token Contract v2](https://github.com/KrisLee1/OriaTheme/blob/main/docs/specifications/token-contract-v2.md)
- [Component styling](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/component-styling.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)
