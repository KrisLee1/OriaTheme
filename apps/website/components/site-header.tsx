"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Monitor, Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useRef, useState } from "react";
import { useOriaTheme } from "@oriatheme/react";
import type { AppearanceMode, ResolvedMode, ThemeDefinition, TokenPath } from "@oriatheme/core";
import { oriaPresetCatalog } from "@oriatheme/presets";
import { useEditorPanel } from "@/components/editor-panel-provider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCopy, type Locale } from "@/lib/i18n";
import { githubRepoUrl } from "@/lib/site";

const themePalettePaths = ["color.primary", "color.secondary", "color.accent", "color.selection", "color.info"] as const;
const appearanceIcons = { light: Sun, dark: Moon, system: Monitor } as const;
type Copy = ReturnType<typeof getCopy>;

/** lucide-react ≥1.0 removed brand icons; the GitHub mark ships as a local fill SVG. */
function GithubIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>;
}

function ThemePaletteIcon({ theme, mode }: { readonly theme: ThemeDefinition; readonly mode: ResolvedMode }) {
  return <span className="theme-picker-palette" aria-hidden="true">{themePalettePaths.map(path => {
    const color = theme.modes[mode][path as TokenPath];
    return <i key={path} style={{ backgroundColor: typeof color === "string" ? color : "transparent" }} />;
  })}</span>;
}

function LocaleSelect({ locale, onValueChange, copy, mobile = false }: { readonly locale: Locale; readonly onValueChange: (locale: Locale) => void; readonly copy: Copy; readonly mobile?: boolean }) {
  return <Select value={locale} onValueChange={value => onValueChange(value as Locale)}><SelectTrigger aria-label={copy.header.language} className={cn("h-[calc(var(--oria-control-height-md)-var(--oria-spacing-1))] border-0 bg-[color-mix(in_srgb,var(--oria-color-muted)_56%,transparent)] text-xs font-semibold text-[var(--oria-color-mutedForeground)] shadow-none hover:bg-[var(--oria-color-muted)]", mobile ? "w-full justify-self-stretch" : "w-[5.8rem]")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="zh">{copy.languages.zh}</SelectItem><SelectItem value="en">{copy.languages.en}</SelectItem></SelectContent></Select>;
}

function ThemeSelect({ copy, activeTheme, customThemes, resolvedMode, onThemeChange, triggerRef, mobile = false }: { readonly copy: Copy; readonly activeTheme: ThemeDefinition; readonly customThemes: readonly ThemeDefinition[]; readonly resolvedMode: ResolvedMode; readonly onThemeChange: (themeId: string, origin: HTMLElement | null) => void; readonly triggerRef?: React.RefObject<HTMLButtonElement | null>; readonly mobile?: boolean }) {
  return <Select value={activeTheme.id} onValueChange={themeId => onThemeChange(themeId, triggerRef?.current ?? null)}>
    <SelectTrigger ref={triggerRef} aria-label={`Theme: ${activeTheme.name}`} className={cn("h-[calc(var(--oria-control-height-md)-var(--oria-spacing-1))] border-0 bg-[color-mix(in_srgb,var(--oria-color-muted)_56%,transparent)] text-[var(--oria-color-foreground)] shadow-none hover:bg-[var(--oria-color-muted)]", mobile ? "w-full justify-self-stretch" : "w-[clamp(10rem,18vw,14rem)]")}>
      <ThemePaletteIcon theme={activeTheme} mode={resolvedMode} /><SelectValue />
    </SelectTrigger>
    <SelectContent className="max-h-[min(28rem,calc(100vh-var(--oria-spacing-8)))]"><SelectGroup>{customThemes.length > 0 ? <><SelectLabel>{copy.header.themes}</SelectLabel>{customThemes.map(theme => <SelectItem key={theme.id} value={theme.id} text={theme.name}><ThemePaletteIcon theme={theme} mode={resolvedMode} /></SelectItem>)}<SelectSeparator /></> : null}<SelectLabel>{copy.header.presets}</SelectLabel>{oriaPresetCatalog.map(({ theme }) => <SelectItem key={theme.id} value={theme.id} text={theme.name}><ThemePaletteIcon theme={theme} mode={resolvedMode} /></SelectItem>)}</SelectGroup></SelectContent>
  </Select>;
}

function AppearanceControl({ copy, appearance, onChange }: { readonly copy: Copy; readonly appearance: AppearanceMode; readonly onChange: (mode: AppearanceMode, origin: HTMLElement) => void }) {
  return <fieldset className="mode-control"><legend>{copy.header.appearance}</legend><div data-active={appearance}>{(["light", "dark", "system"] as AppearanceMode[]).map(mode => { const Icon = appearanceIcons[mode]; return <button className="mode-button" type="button" aria-label={mode} title={mode} aria-pressed={appearance === mode} key={mode} onClick={event => onChange(mode, event.currentTarget)}><Icon /></button>; })}</div></fieldset>;
}

export function SiteHeader({ locale }: { readonly locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const { snapshot } = useOriaTheme();
  const { activeTheme, changeAppearance, customThemes, editorVisibility, requestThemeChange, toggleEditor } = useEditorPanel();
  const [menuOpen, setMenuOpen] = useState(false);
  const themeTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileThemeTriggerRef = useRef<HTMLButtonElement>(null);
  const copy = getCopy(locale);
  const isEditor = pathname === `/${locale}/editor`;
  const routes = [[copy.nav.home, `/${locale}`], [copy.nav.docs, `/${locale}/docs`], [copy.nav.editor, `/${locale}/editor`]] as const;
  const isRouteActive = (href: string): boolean => href === `/${locale}` ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const selectLocale = (nextLocale: Locale): void => {
    const suffix = pathname.replace(new RegExp(`^/${locale}`), "") || "";
    router.push(`/${nextLocale}${suffix}`);
  };
  const changeTheme = (themeId: string, origin: HTMLElement | null): void => requestThemeChange(themeId, origin ?? document.body);

  return <header className="topbar site-topbar">
    <div className="topbar-brand"><Link href={`/${locale}`} className="brand" aria-label="OriaTheme home"><span>Oria<span>Theme</span></span></Link></div>
    <nav className="site-navigation hidden md:flex" aria-label={copy.header.navigation}>{routes.map(([label, href]) => <Link key={href} href={href} className={cn("site-navigation-link", isRouteActive(href) && "is-active")}>{label}</Link>)}</nav>
    <div className="topbar-actions hidden md:flex">
      <LocaleSelect locale={locale} onValueChange={selectLocale} copy={copy} />
      <ThemeSelect copy={copy} activeTheme={activeTheme} customThemes={customThemes} resolvedMode={snapshot.resolvedMode} onThemeChange={changeTheme} triggerRef={themeTriggerRef} />
      <AppearanceControl copy={copy} appearance={snapshot.preference.appearance} onChange={changeAppearance} />
      <a className="site-github-link" href={githubRepoUrl} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><GithubIcon /></a>
      {isEditor ? <button className="editor-trigger" type="button" aria-label={editorVisibility === "open" ? copy.header.closeEditor : copy.header.openEditor} title={editorVisibility === "open" ? copy.header.closeEditor : copy.header.openEditor} aria-expanded={editorVisibility === "open"} aria-controls="theme-editor-panel" onClick={toggleEditor}><SlidersHorizontal aria-hidden="true" /></button> : null}
    </div>
    <Button variant="ghost" size="sm" className="site-mobile-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)}><Menu size={18} /><span className="sr-only">Menu</span></Button>
    <div id="mobile-navigation" className={cn("overflow-hidden transition-[max-height] duration-300 md:hidden", menuOpen ? "max-h-96 border-t border-[var(--oria-color-border)]" : "max-h-0")}>
      <nav className="grid gap-1 py-3" aria-label="Mobile navigation">{routes.map(([label, href]) => <Link key={href} onClick={() => setMenuOpen(false)} href={href} className={cn("site-navigation-link", isRouteActive(href) && "is-active")}>{label}</Link>)}<a href={githubRepoUrl} target="_blank" rel="noreferrer" className="site-navigation-link">GitHub</a></nav>
      <div className="site-mobile-controls grid gap-2 pb-3">
        <ThemeSelect copy={copy} activeTheme={activeTheme} customThemes={customThemes} resolvedMode={snapshot.resolvedMode} onThemeChange={changeTheme} triggerRef={mobileThemeTriggerRef} mobile />
        <AppearanceControl copy={copy} appearance={snapshot.preference.appearance} onChange={changeAppearance} />
        <LocaleSelect locale={locale} onValueChange={selectLocale} copy={copy} mobile />
      </div>
    </div>
  </header>;
}
