import type { ActiveThemeSnapshotV1, PersistedThemeStateV1, ThemeStorage } from "./types.js";

type LocalStorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

/** Creates a browser LocalStorage adapter without accessing it until an operation is requested. */
export function createLocalStorageThemeStorage(storageKey: string): ThemeStorage {
  const stateKey = `${storageKey}:state:v1`;
  const getStorage = (): LocalStorageLike => {
    const storage = (globalThis as { localStorage?: LocalStorageLike }).localStorage;
    if (!storage) throw new Error("localStorage is unavailable.");
    return storage;
  };
  return {
    read(): unknown | null { const raw = getStorage().getItem(stateKey); return raw === null ? null : JSON.parse(raw) as unknown; },
    write(state: PersistedThemeStateV1): void { getStorage().setItem(stateKey, JSON.stringify(state)); },
    clear(): void { getStorage().removeItem(stateKey); }
  };
}

export function writeActiveSnapshot(storageKey: string, snapshot: ActiveThemeSnapshotV1): void {
  const storage = (globalThis as { localStorage?: LocalStorageLike }).localStorage;
  if (!storage) return;
  storage.setItem(`${storageKey}:active:v1`, JSON.stringify(snapshot));
}
