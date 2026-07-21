# @oriatheme/colors

Stable Oria base-color scales with Tailwind-compatible family and shade topology. These colors are independent of the active theme and do not change during theme switching.

## Install

```bash
npm install @oriatheme/colors
```

## Use

```ts
import { oriaColors, toOriaColorVariable } from "@oriatheme/colors";

console.log(oriaColors.blue[500]);
console.log(toOriaColorVariable("blue", 500)); // "--oria-palette-blue-500"
```

For CSS, import `@oriatheme/colors/styles.css`. For Tailwind v4-compatible color aliases, import `@oriatheme/colors/tailwind.css` once in the application stylesheet.

## Documentation

- [Component styling guide](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/component-styling.md)
- [Package map](https://github.com/KrisLee1/OriaTheme/blob/main/docs/guides/packages.md)

## License

[Apache-2.0](https://github.com/KrisLee1/OriaTheme/blob/main/LICENSE)
