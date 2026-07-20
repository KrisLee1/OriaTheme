"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import type { OriaThemeConfig, OriaThemeRuntime, ThemeSnapshot } from "@oriatheme/runtime-dom";

type ContextValue = { readonly runtime: OriaThemeRuntime; readonly owned: boolean };
const OriaThemeContext = createContext<ContextValue | null>(null);

export interface OriaThemeProviderProps { readonly config: OriaThemeConfig; readonly runtime?: OriaThemeRuntime; readonly children: ReactNode }

/** Mounts one runtime instance and exposes its external store to React descendants. */
export function OriaThemeProvider({ config, runtime: externalRuntime, children }: OriaThemeProviderProps): ReactElement {
  const created = useRef<OriaThemeRuntime | null>(null);
  if (!externalRuntime && !created.current) created.current = createOriaThemeRuntime(config);
  const runtime = externalRuntime ?? created.current!;
  const owned = externalRuntime === undefined;
  useEffect(() => { runtime.start(); return (): void => { if (owned) runtime.destroy(); }; }, [runtime, owned]);
  return <OriaThemeContext.Provider value={{ runtime, owned }}>{children}</OriaThemeContext.Provider>;
}

function requireContext(): ContextValue {
  const context = useContext(OriaThemeContext);
  if (!context) throw new Error("OriaTheme hooks must be used within an OriaThemeProvider.");
  return context;
}

/** Selects a snapshot value while preserving reference equality for equal selections. */
export function useThemeSnapshot<T>(selector: (snapshot: ThemeSnapshot) => T, isEqual: (left: T, right: T) => boolean = Object.is): T {
  const { runtime } = requireContext();
  const cache = useRef<{ selector: typeof selector; value: T; initialized: boolean } | null>(null);
  const getSnapshot = useCallback((): T => {
    const next = selector(runtime.getSnapshot());
    const previous = cache.current;
    if (!previous || previous.selector !== selector || !previous.initialized || !isEqual(previous.value, next)) {
      const updated = { selector, value: next, initialized: true };
      cache.current = updated;
      return updated.value;
    }
    return previous.value;
  }, [runtime, selector, isEqual]);
  const subscribe = useCallback((listener: () => void): (() => void) => runtime.subscribe(listener), [runtime]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const identity = (snapshot: ThemeSnapshot): ThemeSnapshot => snapshot;

/** Returns the runtime and its full immutable snapshot. */
export function useOriaTheme(): { readonly snapshot: ThemeSnapshot; readonly runtime: OriaThemeRuntime; readonly setTheme: OriaThemeRuntime["setTheme"]; readonly setAppearance: OriaThemeRuntime["setAppearance"] } {
  const { runtime } = requireContext();
  const snapshot = useThemeSnapshot(identity);
  return { snapshot, runtime, setTheme: runtime.setTheme.bind(runtime), setAppearance: runtime.setAppearance.bind(runtime) };
}
