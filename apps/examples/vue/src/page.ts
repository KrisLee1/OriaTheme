import { defineAsyncComponent, defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import { useOriaTheme } from "@oriatheme/vue";
import { oriaPresetThemes } from "@oriatheme/presets";
import { oriaColorFamilies, oriaColorSteps, oriaColors } from "@oriatheme/colors";
import { createThemeEditorIdentity } from "@oriatheme/editor-core";
import type { AppearanceMode, ResolvedMode, ThemeDefinition, TokenPath } from "@oriatheme/core";
import { renderThemeTokenShowcase } from "./token-showcase.js";

type EditorVisibility = "closed" | "opening" | "open" | "closing";
type PendingDiscard = { readonly kind: "close" } | { readonly kind: "theme"; readonly id: string; readonly name: string; readonly origin: { readonly x: number; readonly y: number } };
const specialColors = ["inherit", "current", "transparent", "black", "white"] as const;
const themePalettePaths = ["color.primary", "color.secondary", "color.accent", "color.selection", "color.info"] as const;
const EditorLoading = defineComponent({
  name: "EditorLoading",
  setup: () => () => h("div", { class: "editor-loading", role: "status" }, "Loading theme editor…")
});
const ThemeEditor = defineAsyncComponent({
  loader: () => import("./components/oria-theme-editor/index.js").then(module => module.ThemeEditor),
  loadingComponent: EditorLoading,
  delay: 0
});

const originFor = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

export default defineComponent({
  setup() {
    const { runtime, snapshot, setAppearance, setTheme } = useOriaTheme();
    const editorVisibility = ref<EditorVisibility>("closed");
    const editorDirty = ref(false);
    const pendingDiscard = ref<PendingDiscard>();
    const themePickerOpen = ref(false);
    const themePicker = ref<HTMLElement>();
    onMounted(() => {
      document.addEventListener("pointerdown", closeThemePickerOnOutsidePress);
      document.addEventListener("keydown", closeThemePickerOnEscape);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("pointerdown", closeThemePickerOnOutsidePress);
      document.removeEventListener("keydown", closeThemePickerOnEscape);
    });
    const editorShown = () => editorVisibility.value !== "closed";
    const editorOpen = () => editorVisibility.value === "open";
    const closeEditor = (): void => {
      if (editorVisibility.value === "opening" || globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        editorVisibility.value = "closed";
        return;
      }
      editorVisibility.value = "closing";
    };
    const finishEditorClose = (event: TransitionEvent): void => {
      if (editorVisibility.value === "closing" && event.target === event.currentTarget && event.propertyName === "transform") editorVisibility.value = "closed";
    };
    const toggleEditor = (): void => { if (editorVisibility.value === "open" || editorVisibility.value === "opening") { if (editorDirty.value) pendingDiscard.value = { kind: "close" }; else closeEditor(); } else { editorVisibility.value = "opening"; globalThis.requestAnimationFrame(() => globalThis.requestAnimationFrame(() => { editorVisibility.value = "open"; })); } };
    const withOrigin = (event: Event) => ({ animate: true, origin: originFor(event.currentTarget as HTMLElement), preservePreview: editorShown() });
    const modeButton = (mode: AppearanceMode) => h("button", {
      class: "mode-button",
      type: "button",
      "aria-label": mode,
      title: mode,
      "aria-pressed": snapshot.value.preference.appearance === mode,
      onClick: (event: Event) => setAppearance(mode, withOrigin(event))
    }, [h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, mode === "light" ? [h("circle", { cx: "12", cy: "12", r: "4" }), h("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" })] : mode === "dark" ? [h("path", { d: "M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" })] : [h("rect", { x: "3", y: "4", width: "18", height: "13", rx: "1.5" }), h("path", { d: "M8 21h8M12 17v4" })])]);
    const closeThemePickerOnOutsidePress = (event: PointerEvent): void => {
      if (themePicker.value?.contains(event.target as Node)) return;
      themePickerOpen.value = false;
    };
    const closeThemePickerOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") themePickerOpen.value = false;
    };
    const selectedTheme = (): ThemeDefinition => snapshot.value.customThemes.find(theme => theme.id === snapshot.value.preference.activeThemeId)
      ?? oriaPresetThemes.find(theme => theme.id === snapshot.value.preference.activeThemeId)
      ?? oriaPresetThemes[0]!;
    const themePalette = (theme: ThemeDefinition) => h("span", { class: "theme-picker-palette", "aria-hidden": "true" }, themePalettePaths.map(path => {
      const color = theme.modes[snapshot.value.resolvedMode][path as TokenPath];
      return h("i", { key: path, style: { backgroundColor: typeof color === "string" ? color : "transparent" } });
    }));
    const customThemes = () => [...snapshot.value.customThemes].sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0));
    const requestThemeChange = (theme: ThemeDefinition, element: HTMLElement): void => { if (theme.id === snapshot.value.preference.activeThemeId) return; const origin = originFor(element); if (editorShown() && editorDirty.value) pendingDiscard.value = { kind: "theme", id: theme.id, name: theme.name, origin }; else setTheme(theme.id, { animate: true, origin }); };
    const themeOption = (theme: ThemeDefinition) => h("button", {
      class: "theme-picker-option",
      type: "button",
      role: "option",
      "aria-selected": theme.id === selectedTheme().id,
      onClick: (event: Event) => { requestThemeChange(theme, event.currentTarget as HTMLElement); themePickerOpen.value = false; }
    }, [themePalette(theme), h("span", theme.name), theme.id === selectedTheme().id ? h("i", { class: "theme-picker-check", "aria-label": "Selected" }, "✓") : null]);

    return () => {
      const activeTheme = selectedTheme();
      const editorOptions = activeTheme.kind === "preset" ? { source: activeTheme, identity: createThemeEditorIdentity(activeTheme, [...snapshot.value.presets, ...snapshot.value.customThemes]) } : { source: activeTheme };
      const confirmDiscard = (): void => { const pending = pendingDiscard.value; if (pending?.kind === "theme") setTheme(pending.id, { animate: true, origin: pending.origin }); else if (pending?.kind === "close") closeEditor(); pendingDiscard.value = undefined; };
      const discardRequest = pendingDiscard.value ? { title: pendingDiscard.value.kind === "theme" ? `Switch to ${pendingDiscard.value.name}?` : "Close editor and discard changes?", description: pendingDiscard.value.kind === "theme" ? "Switching themes will discard the unsaved edits in the current draft." : "Your unsaved theme edits will be lost. The last saved theme will remain available.", confirmLabel: pendingDiscard.value.kind === "theme" ? "Discard and switch" : "Discard and close", onConfirm: confirmDiscard, onCancel: () => { pendingDiscard.value = undefined; } } : undefined;
      return h("div", { class: "demo-stage", "data-editor-state": editorVisibility.value }, [h("main", { class: "demo-shell" }, [
      h("nav", { class: "topbar", "aria-label": "Example navigation" }, [
        h("div", { class: "topbar-brand" }, [h("a", { class: "brand", href: "#top", "aria-label": "OriaTheme example home" }, [h("span", ["Oria", h("span", "Theme")])]), h("span", { class: "framework-pill" }, "Vue")]),
        h("div", { class: "topbar-actions" }, [
          h("div", { class: "theme-picker", "data-open": themePickerOpen.value, ref: themePicker }, [h("span", { class: "theme-picker-label", id: "theme-picker-label" }, "Theme"), h("button", { class: "theme-picker-trigger", type: "button", "aria-label": `Theme: ${activeTheme.name}`, "aria-expanded": themePickerOpen.value, "aria-haspopup": "listbox", "aria-controls": "theme-picker-options", onClick: () => { themePickerOpen.value = !themePickerOpen.value; } }, [themePalette(activeTheme), h("span", activeTheme.name), h("svg", { viewBox: "0 0 20 20", "aria-hidden": "true" }, [h("path", { d: "m5 7.5 5 5 5-5" })])]), themePickerOpen.value ? h("div", { class: "theme-picker-menu", id: "theme-picker-options", role: "listbox", "aria-labelledby": "theme-picker-label" }, [customThemes().length ? h("div", { class: "theme-picker-group" }, [h("span", "My themes"), ...customThemes().map(themeOption)]) : null, h("div", { class: "theme-picker-group" }, [h("span", "Presets"), ...oriaPresetThemes.map(theme => themeOption(theme))])]) : null]),
          h("fieldset", { class: "mode-control" }, [h("legend", "Appearance"), h("div", { "data-active": snapshot.value.preference.appearance }, [modeButton("light"), modeButton("dark"), modeButton("system")])]),
          h("button", { class: "editor-trigger", type: "button", "aria-label": editorOpen() ? "Close theme editor" : "Open theme editor", title: editorOpen() ? "Close theme editor" : "Open theme editor", "aria-expanded": editorOpen(), "aria-controls": "theme-editor-panel", onClick: toggleEditor }, [h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, editorOpen() ? [h("path", { d: "M6 6 18 18M18 6 6 18" })] : [h("path", { d: "M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5" }), h("circle", { cx: "16", cy: "7", r: "2" }), h("circle", { cx: "8", cy: "12", r: "2" }), h("circle", { cx: "13", cy: "17", r: "2" })])])
        ])
      ]),
      h("section", { class: "hero", id: "top" }, [
        h("div", { class: "hero-copy" }, [
          h("p", { class: "eyebrow" }, "Live token workspace"),
          h("h1", ["One theme.", h("br"), "Every detail in tune."]),
          h("p", "Switch the foundation once and watch color, type, shape, depth, and motion move together across a complete interface."),
          h("div", { class: "hero-status" }, [h("span", { class: "status-dot", "aria-hidden": "true" }), "OriaTheme is active ", h("span", { "aria-hidden": "true" }, "·"), ` ${snapshot.value.resolvedMode} mode`])
        ]),
        h("div", { class: "diffusion-visual", "aria-hidden": "true" }, [h("span"), h("i")])
      ]),
      h("section", { class: "showcase", "aria-label": "Component showcase" }, [
        h("article", { class: "card project-card" }, [
          h("div", [h("span", { class: "badge" }, "In focus"), h("p", { class: "card-kicker" }, "Product launch"), h("h2", ["Design once.", h("br"), "Stay coherent."]), h("p", "Semantic tokens keep every decision connected, from the quietest border to the clearest call to action.")]),
          h("div", { class: "actions" }, [h("button", { type: "button" }, "Review system"), h("button", { class: "secondary", type: "button" }, "Share")])
        ]),
        h("article", { class: "card people-card" }, [
          h("div", { class: "card-heading" }, [h("div", [h("p", { class: "card-kicker" }, "Today"), h("h2", "Team availability")]), h("button", { class: "icon-button", type: "button", "aria-label": "Add teammate" }, "+")]),
          h("label", { class: "search-control" }, [h("span", { class: "search-icon", "aria-hidden": "true" }, "⌕"), h("input", { "aria-label": "Search teammates", placeholder: "Find a teammate" })]),
          h("div", { class: "people-list" }, [
            h("div", [h("span", { class: "avatar avatar-a" }, "AK"), h("p", ["Alex Kim", h("small", "Design systems")]), h("span", { class: "presence" }, "Available")]),
            h("div", [h("span", { class: "avatar avatar-b" }, "ML"), h("p", ["Maya Lee", h("small", "Product design")]), h("span", { class: "presence" }, "Reviewing")])
          ])
        ]),
        h("article", { class: "card stats" }, [h("p", { class: "card-kicker" }, "Monthly active users"), h("strong", "48,218"), h("div", [h("span", { class: "positive" }, "↑ 18.4%"), h("span", "vs. last month")]), h("div", { class: "chart", "aria-label": "Growth trend" }, Array.from({ length: 7 }, () => h("i")))]),
        h("article", { class: "card table-card" }, [
          h("div", { class: "card-heading" }, [h("div", [h("p", { class: "card-kicker" }, "Pulse"), h("h2", "Recent activity")]), h("button", { class: "quiet-button", type: "button" }, "View all")]),
          h("table", [h("thead", [h("tr", [h("th", "Item"), h("th", "Status"), h("th", "Owner")])]), h("tbody", [
            h("tr", [h("td", "Design review"), h("td", [h("span", { class: "badge ready" }, "Ready")]), h("td", "Maya")]),
            h("tr", [h("td", "Theme audit"), h("td", [h("span", { class: "badge progress" }, "In progress")]), h("td", "Alex")])
          ])])
        ])
      ]),
      h("section", { class: "token-gallery", "aria-labelledby": "token-gallery-title" }, [
        h("header", { class: "token-heading" }, [
          h("div", [h("p", { class: "section-kicker" }, "Token contract"), h("h2", { id: "token-gallery-title" }, "See the system behind the surface.")]),
          h("p", "The base color library stays stable; semantic tokens below continue to respond to the active theme.")
        ]),
        ...renderThemeTokenShowcase(),
        h("article", { class: "token-card palette-card color-library-card" }, [
          h("div", { class: "token-card-heading" }, [h("div", [h("p", { class: "card-kicker" }, "Static color foundations"), h("h3", "Complete Oria Color Library"), h("p", "26 Tailwind-compatible families · 11 shades each · 5 special colors")]), h("code", "@oriatheme/colors")]),
          h("div", { class: "color-library-grid" }, oriaColorFamilies.map(family =>
            h("section", { class: "color-family", key: family, "aria-labelledby": `color-family-${family}` }, [
              h("div", { class: "color-family-heading" }, [h("strong", { id: `color-family-${family}` }, `${family[0]!.toUpperCase()}${family.slice(1)}`), h("code", `--oria-palette-${family}-*`)]),
              h("div", { class: "color-scale-scroll" }, [
                h("div", { class: "color-scale", role: "list", "aria-label": `${family} color scale` }, oriaColorSteps.map(step =>
                  h("div", { class: "color-swatch", key: step, role: "listitem", title: `${family}-${step}: ${oriaColors[family][step]}` }, [
                    h("i", { style: { backgroundColor: `var(--oria-palette-${family}-${step})` } }),
                    h("span", String(step)),
                    h("code", oriaColors[family][step])
                  ])
                ))
              ])
            ])
          )),
          h("section", { class: "special-colors", "aria-labelledby": "special-colors-title" }, [
            h("div", { class: "color-family-heading" }, [h("strong", { id: "special-colors-title" }, "Special colors"), h("code", "inherit · current · transparent · black · white")]),
            h("div", { class: "special-color-grid" }, specialColors.map(name => h("div", { class: "color-swatch special-color-swatch", key: name, "data-special": name }, [h("i", { style: { backgroundColor: `var(--oria-palette-${name})` } }), h("span", name), h("code", oriaColors[name])])) )
          ])
        ])
      ])
    ]), editorShown() ? h("aside", { class: "editor-panel", "data-state": editorVisibility.value, id: "theme-editor-panel", onTransitionend: finishEditorClose }, [h(ThemeEditor, {
      key: activeTheme.id,
      options: editorOptions,
      runtime,
      mode: snapshot.value.resolvedMode as ResolvedMode,
      previewFollowsAppearance: true,
      closable: true,
      discardRequest,
      onModeChange: (mode: ResolvedMode, origin: HTMLElement) => setAppearance(mode, { animate: true, origin: originFor(origin), preservePreview: true }),
      onDirtyChange: (dirty: boolean) => { editorDirty.value = dirty; },
      onClose: closeEditor,
      onSave: (result: { ok: boolean; theme?: ThemeDefinition }) => { if (result.ok && result.theme) setTheme(result.theme.id); }
    })]) : null]);
    };
  }
});
