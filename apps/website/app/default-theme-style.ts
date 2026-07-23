import { oriaDefaultTheme, resolveTheme } from "@oriatheme/core";

type CssVariables = Readonly<Record<`--${string}`, string>>;

function declarations(variables: CssVariables): string {
  return Object.entries(variables).map(([name, value]) => `${name}:${value}`).join(";");
}

const light = resolveTheme(oriaDefaultTheme, "light");
const dark = resolveTheme(oriaDefaultTheme, "dark");

/** SSR-safe, fully resolved fallback before the client runtime takes ownership. */
export const defaultThemeCss = `:root{${declarations(light.variables)};color-scheme:light}@media(prefers-color-scheme:dark){:root{${declarations(dark.variables)};color-scheme:dark}}`;
