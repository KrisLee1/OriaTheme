import en from "../public/locales/en/common.json";
import zh from "../public/locales/zh/common.json";

export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
type Copy = typeof en;

const dictionaries: Readonly<Record<Locale, Copy>> = { en, zh };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getCopy(locale: Locale): Copy { return dictionaries[locale]; }
