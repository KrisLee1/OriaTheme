import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useOriaTheme } from "@oriatheme/react";
import { oriaPresetThemes } from "@oriatheme/presets";
import { oriaColorFamilies, oriaColorSteps, oriaColors } from "@oriatheme/colors";
import { createThemeEditorIdentity } from "@oriatheme/editor-core";
import type { AppearanceMode, ResolvedMode, ThemeDefinition, TokenPath } from "@oriatheme/core";
import { ThemeTokenShowcase } from "./token-showcase.js";

const ThemeEditor = lazy(() => import("./components/oria-theme-editor/index.js")
  .then(module => ({ default: module.ThemeEditor })));

type EditorVisibility = "closed" | "opening" | "open" | "closing";
type PendingDiscard = { readonly kind: "close" } | { readonly kind: "theme"; readonly id: string; readonly name: string; readonly origin: { readonly x: number; readonly y: number } };

const specialColors = ["inherit", "current", "transparent", "black", "white"] as const;
const themePalettePaths = ["color.primary", "color.secondary", "color.accent", "color.selection", "color.info"] as const;

function ThemePaletteIcon({ theme, mode }: { readonly theme: ThemeDefinition; readonly mode: ResolvedMode }) {
  return <span className="theme-picker-palette" aria-hidden="true">{themePalettePaths.map(path => {
    const color = theme.modes[mode][path as TokenPath];
    return <i key={path} style={{ backgroundColor: typeof color === "string" ? color : "transparent" }} />;
  })}</span>;
}

function AppearanceIcon({ mode }: { readonly mode: AppearanceMode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{mode === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></> : mode === "dark" ? <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" /> : <><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M8 21h8M12 17v4" /></>}</svg>;
}

function ColorLibrary() {
  return <article className="token-card palette-card color-library-card"><div className="token-card-heading"><div><p className="card-kicker">Static color foundations</p><h3>Complete Oria Color Library</h3><p>26 Tailwind-compatible families · 11 shades each · 5 special colors</p></div><code>@oriatheme/colors</code></div><div className="color-library-grid">{oriaColorFamilies.map(family => <section className="color-family" key={family} aria-labelledby={`color-family-${family}`}><div className="color-family-heading"><strong id={`color-family-${family}`}>{family[0]!.toUpperCase()}{family.slice(1)}</strong><code>--oria-palette-{family}-*</code></div><div className="color-scale-scroll"><div className="color-scale" role="list" aria-label={`${family} color scale`}>{oriaColorSteps.map(step => <div className="color-swatch" role="listitem" key={step} title={`${family}-${step}: ${oriaColors[family][step]}`}><i style={{ backgroundColor: `var(--oria-palette-${family}-${step})` }} /><span>{step}</span><code>{oriaColors[family][step]}</code></div>)}</div></div></section>)}</div><section className="special-colors" aria-labelledby="special-colors-title"><div className="color-family-heading"><strong id="special-colors-title">Special colors</strong><code>inherit · current · transparent · black · white</code></div><div className="special-color-grid">{specialColors.map(name => <div className="color-swatch special-color-swatch" data-special={name} key={name}><i style={{ backgroundColor: `var(--oria-palette-${name})` }} /><span>{name}</span><code>{oriaColors[name]}</code></div>)}</div></section></article>;
}

export function DemoPage({ framework }: { readonly framework: string }) {
  const { runtime, snapshot, setAppearance, setTheme } = useOriaTheme();
  const [editorVisibility, setEditorVisibility] = useState<EditorVisibility>("closed");
  const [editorDirty, setEditorDirty] = useState(false);
  const [pendingDiscard, setPendingDiscard] = useState<PendingDiscard>();
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const themePickerRef = useRef<HTMLDivElement>(null);
  const editorOpen = editorVisibility === "open";
  const editorShown = editorVisibility !== "closed";
  const closeEditor = (): void => setEditorVisibility(visibility => visibility === "opening" ? "closed" : "closing");
  useEffect(() => {
    if (editorVisibility !== "opening") return;
    let nextFrame: number | undefined;
    const frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => setEditorVisibility("open"));
    });

    return () => {
      cancelAnimationFrame(frame);
      if (nextFrame !== undefined) cancelAnimationFrame(nextFrame);
    };
  }, [editorVisibility]);
  useEffect(() => {
    if (editorVisibility !== "closing" || !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const frame = requestAnimationFrame(() => setEditorVisibility("closed"));
    return () => cancelAnimationFrame(frame);
  }, [editorVisibility]);
  useEffect(() => {
    if (!themePickerOpen) return;
    const closeOnOutsidePress = (event: PointerEvent): void => {
      if (themePickerRef.current?.contains(event.target as Node)) return;
      setThemePickerOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setThemePickerOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [themePickerOpen]);
  const originFor = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };
  const changeAppearance = (appearance: AppearanceMode, origin?: HTMLElement): void => {
    setAppearance(appearance, origin ? { animate: true, origin: originFor(origin), preservePreview: editorShown } : { preservePreview: editorShown });
  };
  const toggleEditor = (): void => {
    if (editorVisibility === "open" || editorVisibility === "opening") {
      if (editorDirty) setPendingDiscard({ kind: "close" }); else closeEditor();
      return;
    }
    setEditorVisibility("opening");
  };
  const activeTheme = snapshot.customThemes.find(theme => theme.id === snapshot.preference.activeThemeId)
    ?? oriaPresetThemes.find(theme => theme.id === snapshot.preference.activeThemeId)
    ?? oriaPresetThemes[0]!;
  const editorOptions = activeTheme.kind === "preset"
    ? { source: activeTheme, identity: createThemeEditorIdentity(activeTheme, [...snapshot.presets, ...snapshot.customThemes]) }
    : { source: activeTheme };
  const customThemes = [...snapshot.customThemes].sort((left, right) => (right.updatedAt ?? right.createdAt ?? 0) - (left.updatedAt ?? left.createdAt ?? 0));
  const requestThemeChange = (themeId: string, origin: HTMLElement): void => {
    if (themeId === snapshot.preference.activeThemeId) return;
    const name = customThemes.find(theme => theme.id === themeId)?.name ?? oriaPresetThemes.find(theme => theme.id === themeId)?.name ?? themeId;
    if (editorShown && editorDirty) { setPendingDiscard({ kind: "theme", id: themeId, name, origin: originFor(origin) }); return; }
    setTheme(themeId, { animate: true, origin: originFor(origin) });
  };
  const confirmDiscard = (): void => {
    if (pendingDiscard?.kind === "theme") setTheme(pendingDiscard.id, { animate: true, origin: pendingDiscard.origin });
    else if (pendingDiscard?.kind === "close") closeEditor();
    setPendingDiscard(undefined);
  };
  const discardRequest = pendingDiscard ? { title: pendingDiscard.kind === "theme" ? `Switch to ${pendingDiscard.name}?` : "Close editor and discard changes?", description: pendingDiscard.kind === "theme" ? "Switching themes will discard the unsaved edits in the current draft." : "Your unsaved theme edits will be lost. The last saved theme will remain available.", confirmLabel: pendingDiscard.kind === "theme" ? "Discard and switch" : "Discard and close", onConfirm: confirmDiscard, onCancel: () => setPendingDiscard(undefined) } : undefined;
  return <div className="demo-stage" data-editor-state={editorVisibility}><main className="demo-shell">
    <nav className="topbar" aria-label="Example navigation"><div className="topbar-brand"><a className="brand" href="#top" aria-label="OriaTheme example home"><span>Oria<span>Theme</span></span></a><span className="framework-pill">{framework}</span></div><div className="topbar-actions"><div className="theme-picker" data-open={themePickerOpen} ref={themePickerRef}><span className="theme-picker-label" id="theme-picker-label">Theme</span><button className="theme-picker-trigger" type="button" aria-label={`Theme: ${activeTheme.name}`} aria-expanded={themePickerOpen} aria-haspopup="listbox" aria-controls="theme-picker-options" onClick={() => setThemePickerOpen(open => !open)}><ThemePaletteIcon theme={activeTheme} mode={snapshot.resolvedMode} /><span>{activeTheme.name}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg></button>{themePickerOpen ? <div className="theme-picker-menu" id="theme-picker-options" role="listbox" aria-labelledby="theme-picker-label">{customThemes.length > 0 ? <div className="theme-picker-group"><span>My themes</span>{customThemes.map(theme => <button key={theme.id} className="theme-picker-option" type="button" role="option" aria-selected={theme.id === activeTheme.id} onClick={event => { requestThemeChange(theme.id, event.currentTarget); setThemePickerOpen(false); }}><ThemePaletteIcon theme={theme} mode={snapshot.resolvedMode} /><span>{theme.name}</span>{theme.id === activeTheme.id ? <i className="theme-picker-check" aria-label="Selected">✓</i> : null}</button>)}</div> : null}<div className="theme-picker-group"><span>Presets</span>{oriaPresetThemes.map(theme => <button key={theme.id} className="theme-picker-option" type="button" role="option" aria-selected={theme.id === activeTheme.id} onClick={event => { requestThemeChange(theme.id, event.currentTarget); setThemePickerOpen(false); }}><ThemePaletteIcon theme={theme} mode={snapshot.resolvedMode} /><span>{theme.name}</span>{theme.id === activeTheme.id ? <i className="theme-picker-check" aria-label="Selected">✓</i> : null}</button>)}</div></div> : null}</div><fieldset className="mode-control"><legend>Appearance</legend><div data-active={snapshot.preference.appearance}>{(["light", "dark", "system"] as AppearanceMode[]).map(mode => <button className="mode-button" type="button" aria-label={mode} title={mode} aria-pressed={snapshot.preference.appearance === mode} key={mode} onClick={event => changeAppearance(mode, event.currentTarget)}><AppearanceIcon mode={mode} /></button>)}</div></fieldset><button className="editor-trigger" type="button" aria-label={editorOpen ? "Close theme editor" : "Open theme editor"} title={editorOpen ? "Close theme editor" : "Open theme editor"} aria-expanded={editorOpen} aria-controls="theme-editor-panel" onClick={toggleEditor}><svg viewBox="0 0 24 24" aria-hidden="true">{editorOpen ? <path d="M6 6 18 18M18 6 6 18" /> : <><path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="13" cy="17" r="2" /></>}</svg></button></div></nav>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">Live token workspace</p><h1>One theme.<br />Every detail in tune.</h1><p>Switch the foundation once and watch color, type, shape, depth, and motion move together across a complete interface.</p><div className="hero-status"><span className="status-dot" aria-hidden="true" />OriaTheme is active <span aria-hidden="true">·</span> {snapshot.resolvedMode} mode</div></div><div className="diffusion-visual" aria-hidden="true"><span /><i /></div></section>
    <section className="showcase" aria-label="Component showcase">
      <article className="card project-card"><div><span className="badge">In focus</span><p className="card-kicker">Product launch</p><h2>Design once.<br />Stay coherent.</h2><p>Semantic tokens keep every decision connected, from the quietest border to the clearest call to action.</p></div><div className="actions"><button type="button">Review system</button><button className="secondary" type="button">Share</button></div></article>
      <article className="card people-card"><div className="card-heading"><div><p className="card-kicker">Today</p><h2>Team availability</h2></div><button className="icon-button" type="button" aria-label="Add teammate">+</button></div><label className="search-control"><span className="search-icon" aria-hidden="true">⌕</span><input aria-label="Search teammates" placeholder="Find a teammate" /></label><div className="people-list"><div><span className="avatar avatar-a">AK</span><p>Alex Kim<small>Design systems</small></p><span className="presence">Available</span></div><div><span className="avatar avatar-b">ML</span><p>Maya Lee<small>Product design</small></p><span className="presence">Reviewing</span></div></div></article>
      <article className="card stats"><p className="card-kicker">Monthly active users</p><strong>48,218</strong><div><span className="positive">↑ 18.4%</span><span>vs. last month</span></div><div className="chart" aria-label="Growth trend"><i /><i /><i /><i /><i /><i /><i /></div></article>
      <article className="card table-card"><div className="card-heading"><div><p className="card-kicker">Pulse</p><h2>Recent activity</h2></div><button className="quiet-button" type="button">View all</button></div><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th></tr></thead><tbody><tr><td>Design review</td><td><span className="badge ready">Ready</span></td><td>Maya</td></tr><tr><td>Theme audit</td><td><span className="badge progress">In progress</span></td><td>Alex</td></tr></tbody></table></article>
    </section>
    <section className="token-gallery" aria-labelledby="token-gallery-title">
      <header className="token-heading"><div><p className="section-kicker">Token contract</p><h2 id="token-gallery-title">See the system behind the surface.</h2></div><p>The base color library stays stable; semantic tokens below continue to respond to the active theme.</p></header>
      <ThemeTokenShowcase />
      <ColorLibrary />
    </section>
  </main>{editorShown ? <aside className="editor-panel" data-state={editorVisibility} id="theme-editor-panel" onTransitionEnd={event => { if (editorVisibility === "closing" && event.target === event.currentTarget && event.propertyName === "transform") setEditorVisibility("closed"); }}><Suspense fallback={<div className="editor-loading" role="status">Loading theme editor…</div>}><ThemeEditor key={activeTheme.id} options={editorOptions} runtime={runtime} mode={snapshot.resolvedMode} onModeChange={(mode, origin) => changeAppearance(mode, origin)} previewFollowsAppearance onDirtyChange={setEditorDirty} {...(discardRequest ? { discardRequest } : {})} onClose={closeEditor} onSave={result => { if (result.ok) setTheme(result.theme.id); }} /></Suspense></aside> : null}</div>;
}
