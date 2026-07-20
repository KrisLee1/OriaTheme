import { onBeforeUnmount, watch } from "vue";
import type { Ref } from "vue";

export function useDetailsDismiss(details: Ref<HTMLDetailsElement | undefined>): void {
  const close = (): void => { if (details.value) details.value.open = false; };
  const onPointerDown = (event: PointerEvent): void => {
    if (!details.value?.open || details.value.contains(event.target as Node)) return;
    close();
  };
  const onKeyDown = (event: KeyboardEvent): void => { if (event.key === "Escape" && details.value?.open) close(); };
  watch(details, value => {
    if (!value) return;
    globalThis.document.addEventListener("pointerdown", onPointerDown);
    globalThis.document.addEventListener("keydown", onKeyDown);
  }, { immediate: true });
  onBeforeUnmount(() => {
    globalThis.document.removeEventListener("pointerdown", onPointerDown);
    globalThis.document.removeEventListener("keydown", onKeyDown);
  });
}
