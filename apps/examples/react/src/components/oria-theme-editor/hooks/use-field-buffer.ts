import { useEffect, useState } from "react";
export function useFieldBuffer<T>(value: T, format: (value: T) => string, parse: (text: string) => T | undefined, commit: (value: T) => void) {
  const [text, setText] = useState(() => format(value));
  useEffect(() => setText(format(value)), [value]);
  return { text, setText: (next: string): void => { setText(next); const parsed = parse(next); if (parsed !== undefined) commit(parsed); }, reset: (): void => setText(format(value)) };
}
