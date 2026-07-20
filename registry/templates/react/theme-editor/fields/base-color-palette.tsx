import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { createPortal } from "react-dom";
import { oriaColorFamilies, oriaColorSteps, oriaColors } from "@oriatheme/colors";

interface BaseColorEntry {
  readonly family: string;
  readonly step: string;
  readonly name: string;
  readonly value: string;
}

interface PalettePosition {
  readonly placement: "above" | "below";
  readonly style: CSSProperties & Readonly<Record<string, string | number | undefined>>;
}

type PaletteView = "swatches" | "compact";

const baseColors: readonly BaseColorEntry[] = Object.freeze([
  ...oriaColorFamilies.flatMap(family => oriaColorSteps.map(step => ({
    family,
    step: String(step),
    name: `${family}-${step}`,
    value: oriaColors[family][step],
  }))),
  { family: "basic", step: "black", name: "black", value: oriaColors.black },
  { family: "basic", step: "white", name: "white", value: oriaColors.white },
]);

const editorVariables = [
  "--oria-editor-canvas",
  "--oria-editor-surface",
  "--oria-editor-surface-raised",
  "--oria-editor-chrome",
  "--oria-editor-foreground",
  "--oria-editor-muted",
  "--oria-editor-border",
  "--oria-editor-accent",
  "--oria-editor-accent-foreground",
  "--oria-editor-danger",
  "--oria-editor-focus",
  "--oria-editor-radius-sm",
  "--oria-editor-radius-md",
  "--oria-editor-radius-lg",
  "--oria-editor-shadow-sm",
  "--oria-editor-shadow-md",
  "--oria-editor-motion-fast",
  "--oria-editor-motion-normal",
] as const;

const titleCase = (value: string): string => `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;

export function BaseColorPalette({ id, label, value, onSelect }: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onSelect: (value: string) => void;
}): ReactElement {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PalettePosition | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<PaletteView>("swatches");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const groups = useMemo(() => {
    const filtered = baseColors.filter(color => {
      const haystack = `${color.family} ${color.step} ${color.name} ${color.value}`.toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
    const grouped = new Map<string, BaseColorEntry[]>();
    for (const color of filtered) grouped.set(color.family, [...(grouped.get(color.family) ?? []), color]);
    return [...grouped.entries()];
  }, [query]);
  const resultCount = groups.reduce((count, [, colors]) => count + colors.length, 0);

  const show = (): void => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setMounted(true);
    setOpen(true);
  };

  const close = useCallback((restoreFocus = true): void => {
    setOpen(false);
    setQuery("");
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
      setPosition(null);
      closeTimerRef.current = null;
    }, 140);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updatePosition = (): void => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) {
        if (open) close(false);
        return;
      }

      const gap = 8;
      const margin = 8;
      const width = Math.min(352, Math.max(0, viewportWidth - margin * 2));
      const below = Math.max(0, viewportHeight - rect.bottom - gap - margin);
      const above = Math.max(0, rect.top - gap - margin);
      const placement = below < 280 && above > below ? "above" : "below";
      const availableHeight = placement === "below" ? below : above;
      const computed = getComputedStyle(trigger);
      const variableStyles: Record<string, string> = {};
      for (const variable of editorVariables) variableStyles[variable] = computed.getPropertyValue(variable);
      const left = Math.min(
        Math.max(margin, rect.right - width),
        Math.max(margin, viewportWidth - width - margin),
      );
      setPosition({
        placement,
        style: {
          ...variableStyles,
          top: placement === "below" ? rect.bottom + gap : undefined,
          bottom: placement === "above" ? viewportHeight - rect.top + gap : undefined,
          left,
          width,
          maxHeight: Math.min(420, availableHeight),
          colorScheme: computed.colorScheme,
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
        },
      });
    };

    updatePosition();
    const focusFrame = open ? requestAnimationFrame(() => searchRef.current?.focus()) : 0;
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) close(false);
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => {
      if (focusFrame) cancelAnimationFrame(focusFrame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [close, mounted, open]);

  const select = (color: BaseColorEntry): void => {
    onSelect(color.value);
    close();
  };

  const palette = mounted && position ? createPortal(
    <div
      ref={popoverRef}
      id={`${id}-dialog`}
      role="dialog"
      aria-labelledby={`${id}-title`}
      data-oria-editor-palette-popover
      data-placement={position.placement}
      data-state={open ? "open" : "closed"}
      style={position.style}
      onKeyDownCapture={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      }}
    >
      <div data-oria-editor-palette-content>
        <header data-oria-editor-palette-header>
          <div><h2 id={`${id}-title`}>Base colors</h2><p>Choose a stable color for {label}.</p></div>
          <div data-oria-editor-palette-view data-view={view} role="group" aria-label="Color display">
            <button type="button" aria-label="Show circle swatches" title="Circle swatches" aria-pressed={view === "swatches"} onClick={() => setView("swatches")}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="6" cy="6" r="2.25" /><circle cx="14" cy="6" r="2.25" /><circle cx="6" cy="14" r="2.25" /><circle cx="14" cy="14" r="2.25" /></svg>
            </button>
            <button type="button" aria-label="Show compact color scales" title="Compact color scales" aria-pressed={view === "compact"} onClick={() => setView("compact")}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="3" rx="1.5" /><rect x="3" y="8.5" width="14" height="3" rx="1.5" /><rect x="3" y="13" width="14" height="3" rx="1.5" /></svg>
            </button>
          </div>
        </header>
        <label data-oria-editor-palette-search htmlFor={`${id}-search`}>
          <span className="oria-editor-visually-hidden">Search base colors</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          <input ref={searchRef} id={`${id}-search`} type="search" value={query} placeholder="Search family, shade, or hex" autoComplete="off" onChange={event => setQuery(event.target.value)} />
        </label>
        <p data-oria-editor-palette-count aria-live="polite">{resultCount} {resultCount === 1 ? "color" : "colors"}</p>
        <div data-oria-editor-palette-groups data-view={view}>
          {groups.map(([family, colors]) => <section key={family} aria-labelledby={view === "swatches" ? `${id}-${family}` : undefined} aria-label={view === "compact" ? titleCase(family) : undefined}>
            {view === "swatches" ? <h3 id={`${id}-${family}`}>{titleCase(family)}</h3> : null}
            <div data-oria-editor-palette-grid>
              {colors.map(color => {
                const selected = value.toLowerCase() === color.value.toLowerCase();
                return <button key={color.name} type="button" aria-label={`${titleCase(color.name)}, ${color.value}`} aria-pressed={selected} title={view === "swatches" ? `${color.name} · ${color.value}` : color.value} onClick={() => select(color)}>
                  <span style={{ backgroundColor: color.value }} aria-hidden="true">{selected ? <i>✓</i> : null}</span>
                  {view === "swatches" ? <small>{color.step}</small> : null}
                </button>;
              })}
            </div>
          </section>)}
          {resultCount === 0 ? <p data-oria-editor-palette-empty>No base colors match “{query}”.</p> : null}
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return <div data-oria-editor-base-palette>
    <button ref={triggerRef} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-dialog`} aria-label={`Choose ${label} from the base color library`} title="Base color library" onClick={() => open ? close() : show()}>
      <span data-oria-editor-palette-icon aria-hidden="true"><i /><i /><i /><i /><i /></span>
    </button>
    {palette}
  </div>;
}
