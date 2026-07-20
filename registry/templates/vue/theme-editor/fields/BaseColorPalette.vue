<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { oriaColorFamilies, oriaColorSteps, oriaColors } from "@oriatheme/colors";

interface BaseColorEntry { readonly family: string; readonly step: string; readonly name: string; readonly value: string }
type PaletteView = "swatches" | "compact";
const props = defineProps<{ id: string; label: string; value: string }>();
const emit = defineEmits<{ select: [value: string] }>();
const baseColors: readonly BaseColorEntry[] = Object.freeze([
  ...oriaColorFamilies.flatMap(family => oriaColorSteps.map(step => ({ family, step: String(step), name: `${family}-${step}`, value: oriaColors[family][step] }))),
  { family: "basic", step: "black", name: "black", value: oriaColors.black },
  { family: "basic", step: "white", name: "white", value: oriaColors.white },
]);
const titleCase = (value: string): string => `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
const trigger = ref<HTMLButtonElement>();
const popover = ref<HTMLDivElement>();
const search = ref<HTMLInputElement>();
const open = ref(false);
const query = ref("");
const view = ref<PaletteView>("swatches");
const placement = ref<"above" | "below">("below");
const position = ref<Record<string, string>>({});
const terms = computed(() => query.value.trim().toLowerCase().split(/\s+/).filter(Boolean));
const groups = computed(() => {
  const grouped = new Map<string, BaseColorEntry[]>();
  for (const color of baseColors) {
    const haystack = `${color.family} ${color.step} ${color.name} ${color.value}`.toLowerCase();
    if (!terms.value.every(term => haystack.includes(term))) continue;
    grouped.set(color.family, [...(grouped.get(color.family) ?? []), color]);
  }
  return [...grouped.entries()];
});
const resultCount = computed(() => groups.value.reduce((count, [, colors]) => count + colors.length, 0));
const updatePosition = (): void => {
  if (!trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const gap = 8;
  const margin = 8;
  const width = Math.min(352, globalThis.innerWidth - margin * 2);
  const below = Math.max(0, globalThis.innerHeight - rect.bottom - gap - margin);
  const above = Math.max(0, rect.top - gap - margin);
  placement.value = below < 280 && above > below ? "above" : "below";
  const left = Math.min(Math.max(margin, rect.right - width), Math.max(margin, globalThis.innerWidth - width - margin));
  position.value = {
    left: `${left}px`, width: `${width}px`, maxHeight: `${Math.min(420, placement.value === "below" ? below : above)}px`,
    ...(placement.value === "below" ? { top: `${rect.bottom + gap}px` } : { bottom: `${globalThis.innerHeight - rect.top + gap}px` }),
  };
};
const close = (restoreFocus = true): void => {
  open.value = false;
  query.value = "";
  if (restoreFocus) globalThis.requestAnimationFrame(() => trigger.value?.focus());
};
const toggle = async (): Promise<void> => {
  if (open.value) { close(); return; }
  open.value = true;
  await nextTick();
  updatePosition();
  search.value?.focus({ preventScroll: true });
};
const onPointerDown = (event: PointerEvent): void => {
  const target = event.target as Node;
  if (trigger.value?.contains(target) || popover.value?.contains(target)) return;
  close(false);
};
const onKeyDown = (event: KeyboardEvent): void => { if (event.key === "Escape" && open.value) { event.preventDefault(); close(); } };
watch(open, active => {
  if (active) {
    globalThis.addEventListener("resize", updatePosition);
    globalThis.addEventListener("scroll", updatePosition, true);
    globalThis.document.addEventListener("pointerdown", onPointerDown);
    globalThis.document.addEventListener("keydown", onKeyDown);
  } else {
    globalThis.removeEventListener("resize", updatePosition);
    globalThis.removeEventListener("scroll", updatePosition, true);
    globalThis.document.removeEventListener("pointerdown", onPointerDown);
    globalThis.document.removeEventListener("keydown", onKeyDown);
  }
});
onBeforeUnmount(() => {
  globalThis.removeEventListener("resize", updatePosition);
  globalThis.removeEventListener("scroll", updatePosition, true);
  globalThis.document.removeEventListener("pointerdown", onPointerDown);
  globalThis.document.removeEventListener("keydown", onKeyDown);
});
const select = (color: BaseColorEntry): void => { emit("select", color.value); close(); };
</script>

<template>
  <div data-oria-editor-base-palette>
    <button ref="trigger" type="button" aria-haspopup="dialog" :aria-expanded="open" :aria-controls="`${id}-dialog`" :aria-label="`Choose ${label} from the base color library`" title="Base color library" @click="toggle">
      <span data-oria-editor-palette-icon aria-hidden="true"><i /><i /><i /><i /><i /></span>
    </button>
    <Teleport to="body">
      <div v-if="open" ref="popover" :id="`${id}-dialog`" role="dialog" :aria-labelledby="`${id}-title`" data-oria-editor-palette-popover :data-placement="placement" data-state="open" :style="position">
        <div data-oria-editor-palette-content>
          <header data-oria-editor-palette-header>
            <div><h2 :id="`${id}-title`">Base colors</h2><p>Choose a stable color for {{ label }}.</p></div>
            <div data-oria-editor-palette-view :data-view="view" role="group" aria-label="Color display">
              <button type="button" aria-label="Show circle swatches" title="Circle swatches" :aria-pressed="view === 'swatches'" @click="view = 'swatches'"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="6" cy="6" r="2.25" /><circle cx="14" cy="6" r="2.25" /><circle cx="6" cy="14" r="2.25" /><circle cx="14" cy="14" r="2.25" /></svg></button>
              <button type="button" aria-label="Show compact color scales" title="Compact color scales" :aria-pressed="view === 'compact'" @click="view = 'compact'"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="3" rx="1.5" /><rect x="3" y="8.5" width="14" height="3" rx="1.5" /><rect x="3" y="13" width="14" height="3" rx="1.5" /></svg></button>
            </div>
          </header>
          <label data-oria-editor-palette-search :for="`${id}-search`"><span class="oria-editor-visually-hidden">Search base colors</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input ref="search" :id="`${id}-search`" v-model="query" type="search" placeholder="Search family, shade, or hex" autocomplete="off" /></label>
          <p data-oria-editor-palette-count aria-live="polite">{{ resultCount }} {{ resultCount === 1 ? "color" : "colors" }}</p>
          <div data-oria-editor-palette-groups :data-view="view">
            <section v-for="[family, colors] in groups" :key="family" :aria-labelledby="view === 'swatches' ? `${id}-${family}` : undefined" :aria-label="view === 'compact' ? titleCase(family) : undefined">
              <h3 v-if="view === 'swatches'" :id="`${id}-${family}`">{{ titleCase(family) }}</h3>
              <div data-oria-editor-palette-grid><button v-for="color in colors" :key="color.name" type="button" :aria-label="`${titleCase(color.name)}, ${color.value}`" :aria-pressed="value.toLowerCase() === color.value.toLowerCase()" :title="view === 'swatches' ? `${color.name} · ${color.value}` : color.value" @click="select(color)"><span :style="{ backgroundColor: color.value }" aria-hidden="true"><i v-if="value.toLowerCase() === color.value.toLowerCase()">✓</i></span><small v-if="view === 'swatches'">{{ color.step }}</small></button></div>
            </section>
            <p v-if="resultCount === 0" data-oria-editor-palette-empty>No base colors match “{{ query }}”.</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
