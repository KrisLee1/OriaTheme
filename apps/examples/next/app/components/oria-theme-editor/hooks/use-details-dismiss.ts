import { useEffect } from "react";
import type { RefObject } from "react";

export function useDetailsDismiss(detailsRef: RefObject<globalThis.HTMLDetailsElement | null>): void {
  useEffect(() => {
    const close = (): void => detailsRef.current?.removeAttribute("open");
    const onPointerDown = (event: globalThis.PointerEvent): void => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as globalThis.Node)) close();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape" && detailsRef.current?.open) close();
    };
    globalThis.document.addEventListener("pointerdown", onPointerDown);
    globalThis.document.addEventListener("keydown", onKeyDown);
    return () => {
      globalThis.document.removeEventListener("pointerdown", onPointerDown);
      globalThis.document.removeEventListener("keydown", onKeyDown);
    };
  }, [detailsRef]);
}
