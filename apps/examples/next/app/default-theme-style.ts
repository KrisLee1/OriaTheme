import { oriaDefaultTheme, resolveTheme } from "@oriatheme/core";

type CssVariables = Readonly<Record<`--${string}`, string>>;

function declarations(variables: CssVariables): string {
  return Object.entries(variables).map(([name, value]) => `${name}:${value}`).join(";");
}

const light = resolveTheme(oriaDefaultTheme, "light");
const dark = resolveTheme(oriaDefaultTheme, "dark");

/**
 * Static first-visit fallback for SSR. Every name and value has already passed
 * Core validation and resolution; the storage bootstrap and runtime override it.
 */
export const defaultThemeCss = `:root{${declarations(light.variables)};color-scheme:light}@media(prefers-color-scheme:dark){:root{${declarations(dark.variables)};color-scheme:dark}}`;
