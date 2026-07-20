export interface SliderRange {
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
}

const scaledRange = (minimum: number, maximum: number, unit: string): SliderRange | undefined => {
  if (unit === "rem" || unit === "em") return { minimum, maximum, step: .025 };
  if (unit === "px") return { minimum: minimum * 16, maximum: maximum * 16, step: .5 };
  if (unit === "%") return { minimum: minimum * 100, maximum: maximum * 100, step: 1 };
  return undefined;
};

export function preferredDimensionUnit(path: string): string {
  if (path.startsWith("typography.letterSpacing.")) return "em";
  if (path.startsWith("shape.borderWidth.") || path.startsWith("shape.focusRing") || path.startsWith("effect.")) return "px";
  return "rem";
}

/** Stable semantic ranges keep pointer distance mapped to the same value distance for the whole drag. */
export function dimensionSliderRange(path: string, unit: string): SliderRange | undefined {
  if (path === "shape.radius.full") return undefined;
  if (path.startsWith("typography.letterSpacing.")) {
    if (unit === "rem" || unit === "em") return { minimum: -.12, maximum: .2, step: .005 };
    if (unit === "px") return { minimum: -1.92, maximum: 3.2, step: .08 };
    if (unit === "%") return { minimum: -12, maximum: 20, step: .5 };
    return undefined;
  }
  if (path.startsWith("typography.size.")) return scaledRange(.5, 10, unit);
  if (path.startsWith("shape.borderWidth.") || path.startsWith("shape.focusRing")) return scaledRange(0, .75, unit);
  if (path.startsWith("shape.radius.")) return scaledRange(0, 8, unit);
  if (path === "spacing.unit") return scaledRange(0, 1, unit);
  if (path.startsWith("spacing.")) return scaledRange(0, 8, unit);
  if (path.startsWith("control.height.")) return scaledRange(1.5, 6, unit);
  if (path.startsWith("control.paddingInline.")) return scaledRange(0, 4, unit);
  if (path.startsWith("effect.blur.") || path.startsWith("effect.backdropBlur.")) return scaledRange(0, 8, unit);
  return undefined;
}

export function numberSliderRange(path: string, minimum?: number, maximum?: number): SliderRange | undefined {
  if (minimum !== undefined && maximum !== undefined) return { minimum, maximum, step: maximum - minimum <= 1 ? .01 : .02 };
  if (path.startsWith("typography.lineHeight.")) return { minimum: .8, maximum: 2.4, step: .01 };
  return undefined;
}

export const durationSliderRange: SliderRange = Object.freeze({ minimum: 0, maximum: 1000, step: 10 });
export const fontWeightSliderRange: SliderRange = Object.freeze({ minimum: 100, maximum: 900, step: 100 });
