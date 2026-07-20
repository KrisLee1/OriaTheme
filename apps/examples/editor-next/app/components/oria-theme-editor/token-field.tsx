import type { ReactElement } from "react";
import type { TokenFieldProps } from "./types";
import { ColorField } from "./fields/color-field"; import { DimensionField } from "./fields/dimension-field"; import { NumberField } from "./fields/number-field"; import { FontFamilyField } from "./fields/font-family-field"; import { FontWeightField } from "./fields/font-weight-field"; import { DurationField } from "./fields/duration-field"; import { EasingField } from "./fields/easing-field"; import { ShadowField } from "./fields/shadow-field"; import { GradientField } from "./fields/gradient-field";
const fields = { color: ColorField, dimension: DimensionField, number: NumberField, fontFamily: FontFamilyField, fontWeight: FontWeightField, duration: DurationField, cubicBezier: EasingField, shadow: ShadowField, gradient: GradientField } as const;
export function TokenField(props: TokenFieldProps): ReactElement { const Component = fields[props.field.type]; return <Component {...props} />; }
