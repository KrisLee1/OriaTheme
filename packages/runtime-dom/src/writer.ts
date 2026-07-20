import type { ResolvedTheme } from "@oriatheme/core";

interface StyleNode { textContent: string | null; setAttribute(name: string, value: string): void; remove(): void }
interface RootLike { appendChild(node: StyleNode): unknown; adoptedStyleSheets?: readonly unknown[] }
interface DocumentLike { documentElement: HTMLElement; head?: RootLike; createElement(name: string): StyleNode }
type Target = Document | ShadowRoot;
type Sheet = { replaceSync(value: string): void };

export interface DomWriter {
  apply(theme: ResolvedTheme): boolean;
  getRoot(): HTMLElement;
  destroy(): void;
}

/** Owns exactly one constructable stylesheet or fallback style node for a runtime target. */
export function createDomWriter(target: Target): DomWriter {
  const documentTarget = "documentElement" in (target as object);
  const documentLike = documentTarget ? target as unknown as DocumentLike : (target as ShadowRoot).ownerDocument as unknown as DocumentLike;
  const root = documentTarget ? documentLike.documentElement : (target as ShadowRoot).host as HTMLElement;
  const container = documentTarget ? (documentLike.head ?? documentLike.documentElement as unknown as RootLike) : target as unknown as RootLike;
  const supportsAdoption = "adoptedStyleSheets" in (target as object) && typeof (globalThis as { CSSStyleSheet?: { new(): { replaceSync(value: string): void } } }).CSSStyleSheet === "function";
  let sheet: Sheet | undefined;
  let style: StyleNode | undefined;
  let transitionStyle: StyleNode | undefined;
  let previous = "";

  const transitionCss = ':root[data-oria-transition="circle"]::view-transition-group(root){width:100vw;height:100dvh}:root[data-oria-transition="circle"]::view-transition-old(root){animation:none;z-index:1;mix-blend-mode:normal}:root[data-oria-transition="circle"]::view-transition-new(root){width:100vw;height:100dvh;animation:oria-theme-circle-reveal var(--oria-transition-duration) ease-out both;z-index:2;mix-blend-mode:normal}@keyframes oria-theme-circle-reveal{from{clip-path:circle(0 at var(--oria-transition-x) var(--oria-transition-y))}to{clip-path:circle(var(--oria-transition-radius) at var(--oria-transition-x) var(--oria-transition-y))}}';
  const ensureTransitionStyles = (): void => {
    if (transitionStyle) return;
    transitionStyle = documentLike.createElement("style"); transitionStyle.setAttribute("data-oria-theme-transition", ""); transitionStyle.textContent = transitionCss;
    (documentLike.head ?? documentLike.documentElement as unknown as RootLike).appendChild(transitionStyle);
  };
  const css = (theme: ResolvedTheme): string => {
    const selector = documentTarget ? ":root" : ":host";
    return `${selector}{${Object.entries(theme.variables).map(([name, value]) => `${name}:${value}`).join(";")};color-scheme:${theme.colorScheme}}`;
  };
  const apply = (theme: ResolvedTheme): boolean => {
    ensureTransitionStyles();
    const next = css(theme);
    if (next === previous) return false;
    if (supportsAdoption) {
      if (!sheet) {
        const Constructor = (globalThis as { CSSStyleSheet: { new(): { replaceSync(value: string): void } } }).CSSStyleSheet;
        sheet = new Constructor();
        const adopted = (target as unknown as RootLike).adoptedStyleSheets ?? [];
        (target as unknown as { adoptedStyleSheets: readonly unknown[] }).adoptedStyleSheets = [...adopted, sheet];
      }
      sheet.replaceSync(next);
    } else {
      if (!style) { style = documentLike.createElement("style"); style.setAttribute("data-oria-theme-runtime", ""); container.appendChild(style); }
      style.textContent = next;
    }
    previous = next;
    return true;
  };
  return {
    apply,
    getRoot: (): HTMLElement => root,
    destroy(): void {
      if (style) style.remove();
      if (transitionStyle) transitionStyle.remove();
      if (sheet && "adoptedStyleSheets" in (target as object)) {
        const adopted = (target as unknown as RootLike).adoptedStyleSheets ?? [];
        (target as unknown as { adoptedStyleSheets: readonly unknown[] }).adoptedStyleSheets = adopted.filter(candidate => candidate !== sheet);
      }
      style = undefined; sheet = undefined; transitionStyle = undefined; previous = "";
    }
  };
}
