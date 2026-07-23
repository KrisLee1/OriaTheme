"use client";

import { useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { useOriaTheme } from "@oriatheme/react";
import { oriaPresetCatalog } from "@oriatheme/presets";
import type { ThemeDefinition, TokenPath } from "@oriatheme/core";
import { useEditorPanel } from "@/components/editor-panel-provider";
import { getCopy, type Locale } from "@/lib/i18n";
import { Reveal } from "./reveal";

const palettePaths = ["color.primary", "color.secondary", "color.accent", "color.selection", "color.info"] as const;
/** Ambient drift speed of the preset marquee, px/s. */
const marqueeSpeed = 48;

function PresetPalette({ theme, mode }: { readonly theme: ThemeDefinition; readonly mode: "light" | "dark" }) {
  return <span className="home-preset-palette" aria-hidden="true">{palettePaths.map(path => {
    const color = theme.modes[mode][path as TokenPath];
    return <i key={path} style={{ backgroundColor: typeof color === "string" ? color : "transparent" }} />;
  })}</span>;
}

function PresetList({ themes, mode, activeId, activeLabel, hidden, onSelect }: {
  readonly themes: readonly ThemeDefinition[];
  readonly mode: "light" | "dark";
  readonly activeId: string;
  readonly activeLabel: string;
  readonly hidden?: boolean;
  readonly onSelect: (themeId: string, origin: HTMLElement) => void;
}) {
  return <ul className="home-preset-list" aria-hidden={hidden || undefined}>{themes.map(theme => {
    const isActive = theme.id === activeId;
    return <li key={theme.id}>
      <button className="home-preset-card" type="button" aria-pressed={isActive} tabIndex={hidden ? -1 : 0} onClick={event => onSelect(theme.id, event.currentTarget)}>
        <PresetPalette theme={theme} mode={mode} />
        <span className="home-preset-name">{theme.name}{isActive ? <span className="home-preset-active">{activeLabel}</span> : null}</span>
      </button>
    </li>;
  })}</ul>;
}

export function HomePresets({ locale }: { readonly locale: Locale }) {
  const { snapshot } = useOriaTheme();
  const { requestThemeChange } = useEditorPanel();
  const copy = getCopy(locale).home.presets;
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef(0);
  const offsetRef = useRef(0);
  const speedRef = useRef(0);
  const pausedRef = useRef(false);
  const themes = oriaPresetCatalog.map(({ theme }) => theme);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = (): void => {
      const list = track.querySelector<HTMLElement>(".home-preset-list");
      if (!list) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      wrapRef.current = list.scrollWidth + gap;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Drift at a constant speed, but ease toward pause/resume so hover never
  // hard-cuts the motion; the offset wraps at exactly one list width + gap.
  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || wrap <= 0) return;
    const target = pausedRef.current ? 0 : marqueeSpeed;
    speedRef.current += (target - speedRef.current) * Math.min(1, delta / 250);
    offsetRef.current = (offsetRef.current + (speedRef.current * delta) / 1000) % wrap;
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  });

  return <section className="home-section" aria-labelledby="home-presets-title">
    <Reveal>
      <p className="section-kicker">{copy.kicker}</p>
      <h2 className="home-section-title" id="home-presets-title">{copy.title}</h2>
      <p className="home-section-body">{copy.body}</p>
    </Reveal>
    <div
      className="home-preset-marquee"
      onPointerEnter={() => { pausedRef.current = true; }}
      onPointerLeave={() => { pausedRef.current = false; }}
      onFocusCapture={() => { pausedRef.current = true; }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) pausedRef.current = false; }}
    >
      <div className="home-preset-track" ref={trackRef}>
        <PresetList themes={themes} mode={snapshot.resolvedMode} activeId={snapshot.preference.activeThemeId} activeLabel={copy.activeLabel} onSelect={requestThemeChange} />
        <PresetList themes={themes} mode={snapshot.resolvedMode} activeId={snapshot.preference.activeThemeId} activeLabel={copy.activeLabel} hidden onSelect={requestThemeChange} />
      </div>
    </div>
  </section>;
}
