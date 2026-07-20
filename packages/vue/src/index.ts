import { inject, onUnmounted, provide, readonly, shallowRef } from "vue";
import type { App, DeepReadonly, Plugin, ShallowRef } from "vue";
import { createOriaThemeRuntime } from "@oriatheme/runtime-dom";
import type { OriaThemeConfig, OriaThemeRuntime, ThemeSnapshot } from "@oriatheme/runtime-dom";

type ContextValue = { readonly runtime: OriaThemeRuntime; readonly owned: boolean };
const ORIA_THEME_KEY = Symbol("OriaTheme");
const isRuntime = (value: OriaThemeConfig | OriaThemeRuntime): value is OriaThemeRuntime => "getSnapshot" in value;

/** Creates a Vue plugin that owns the runtime it constructs. */
export function createOriaTheme(config: OriaThemeConfig): Plugin {
  return {
    install(app: App): void {
      const runtime = createOriaThemeRuntime(config);
      app.provide(ORIA_THEME_KEY, { runtime, owned: true } satisfies ContextValue);
      runtime.start();
      app.onUnmount(() => runtime.destroy());
    }
  };
}

/** Provides either a supplied runtime or a runtime created from configuration in the current component tree. */
export function provideOriaTheme(configOrRuntime: OriaThemeConfig | OriaThemeRuntime): OriaThemeRuntime {
  const owned = !isRuntime(configOrRuntime);
  const runtime = owned ? createOriaThemeRuntime(configOrRuntime) : configOrRuntime;
  provide(ORIA_THEME_KEY, { runtime, owned } satisfies ContextValue);
  runtime.start();
  if (owned) onUnmounted(() => runtime.destroy());
  return runtime;
}

/** Subscribes a shallow ref to the runtime snapshot without reproducing runtime state in Vue. */
export function useOriaTheme(): { readonly snapshot: DeepReadonly<ShallowRef<ThemeSnapshot>>; readonly runtime: OriaThemeRuntime; readonly setTheme: OriaThemeRuntime["setTheme"]; readonly setAppearance: OriaThemeRuntime["setAppearance"] } {
  const context = inject<ContextValue | undefined>(ORIA_THEME_KEY, undefined);
  if (!context) throw new Error("useOriaTheme() requires createOriaTheme() or provideOriaTheme().");
  const snapshot = shallowRef(context.runtime.getSnapshot());
  const unsubscribe = context.runtime.subscribe((): void => { snapshot.value = context.runtime.getSnapshot(); });
  onUnmounted(unsubscribe);
  return { snapshot: readonly(snapshot) as DeepReadonly<ShallowRef<ThemeSnapshot>>, runtime: context.runtime, setTheme: context.runtime.setTheme.bind(context.runtime), setAppearance: context.runtime.setAppearance.bind(context.runtime) };
}
