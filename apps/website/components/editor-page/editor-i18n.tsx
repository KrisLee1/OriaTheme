"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getCopy, type Locale } from "@/lib/i18n";

type EditorCopy = ReturnType<typeof getCopy>["editor"];
const EditorI18nContext = createContext<EditorCopy | null>(null);

export function EditorI18nProvider({ locale, children }: { readonly locale: Locale; readonly children: ReactNode }) {
  return <EditorI18nContext.Provider value={getCopy(locale).editor}>{children}</EditorI18nContext.Provider>;
}

export function useEditorCopy(): EditorCopy {
  const copy = useContext(EditorI18nContext);
  if (!copy) throw new Error("useEditorCopy must be used within EditorI18nProvider");
  return copy;
}

export function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/gu, (_, key: string) => String(values[key] ?? `{${key}}`));
}
