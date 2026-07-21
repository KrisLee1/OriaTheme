# Styling components

[中文](../component-styling.md) · [Guide index](README.md)

The OriaTheme runtime validates, resolves, and writes dynamic semantic `--oria-*` CSS Variables. `@oriatheme/colors` separately provides a complete stable color foundation. Components may reference variables directly or consume them through Tailwind utilities. Semantic utilities react to theme changes; base-color utilities remain stable.

Do not create a static stylesheet or Tailwind configuration for every preset, and do not build class names from runtime theme values. Theme IDs, color modes, persistence, and View Transition remain runtime responsibilities.

## Direct CSS Variables

```css
:root {
  background: var(--oria-color-background);
  color: var(--oria-color-foreground);
}

.card {
  padding: 1.5rem;
  background: var(--oria-color-surfaceRaised);
  border: var(--oria-shape-borderWidth-default) solid var(--oria-color-border);
  border-radius: var(--oria-shape-radius-lg);
  box-shadow: var(--oria-elevation-shadow-md);
}

.primary-button {
  color: var(--oria-color-primaryForeground);
  background: var(--oria-color-primary);
}

.textured-page {
  /* The background pattern sits over the optional gradient and base color. */
  background:
    var(--oria-pattern-background, none),
    var(--oria-gradient-background, var(--oria-color-background));
}

.patterned-card {
  /* A missing optional pattern leaves a normal surface. */
  background:
    var(--oria-pattern-surface, none),
    var(--oria-color-surfaceRaised);
}
```

After a theme change, matched rules use the new values immediately. No CSS rebuild or component rerender is required.

## Stable colors and Tailwind standard names

Install and import the color library once:

```bash
# Choose one
pnpm add @oriatheme/colors
npm install @oriatheme/colors
yarn add @oriatheme/colors
bun add @oriatheme/colors
```

See [package-manager compatibility](package-managers.md) for lockfile and CLI rules.

```css
@import "tailwindcss";
@import "@oriatheme/colors/styles.css";
@import "@oriatheme/colors/tailwind.css";
```

`styles.css` provides 50–950 scales for 26 families—red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone, mauve, olive, mist, and taupe—plus inherit, current, transparent, black, and white. `tailwind.css` maps them to Tailwind v4 `--color-*` names:

```tsx
<div className="border border-slate-200 bg-blue-500 text-white">
  <span className="text-sky-300">Oria colors</span>
</div>
```

The names and utility topology are Tailwind-compatible; OriaTheme independently defines the values. Base colors are static CSS and do not enter ThemeDefinition, Storage, or runtime stylesheets.

## Tailwind semantic utilities

Map OriaTheme variables into a Tailwind CSS v4 inline theme:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--oria-color-background);
  --color-foreground: var(--oria-color-foreground);
  --color-surface: var(--oria-color-surface);
  --color-surface-raised: var(--oria-color-surfaceRaised);
  --color-primary: var(--oria-color-primary);
  --color-primary-foreground: var(--oria-color-primaryForeground);
  --color-border: var(--oria-color-border);
  --color-muted: var(--oria-color-mutedForeground);
  --radius-sm: var(--oria-shape-radius-sm);
  --radius-lg: var(--oria-shape-radius-lg);
  --shadow-md: var(--oria-elevation-shadow-md);
}
```

```tsx
<main className="min-h-screen bg-background text-foreground">
  <section className="rounded-lg border border-border bg-surface p-4">
    <button className="rounded-sm bg-primary px-4 py-2 text-primary-foreground">
      Save changes
    </button>
  </section>
</main>
```

Tailwind generates the utility once, while the final value remains a CSS Variable. Runtime changes therefore update the component immediately and participate in the [circular theme reveal](circular-theme-transition.md). Tailwind is needed only by applications that use it; OriaTheme runtime packages do not make it a consumer runtime dependency.
