/*
 * The booking form's draft, kept in this browser so a refresh or an accidental close loses nothing.
 * Typed details go to localStorage; photos (files) go to IndexedDB, which can hold them. A draft older
 * than seven days is dropped, so a shared phone does not keep someone's details for long. Every call
 * fails quietly: private windows or blocked storage just mean no draft.
 */
const KEY = 'sr_booking_draft_v1';
const DB = 'sr_booking';
const STORE = 'photos';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type DraftPhotos = Record<string, Record<string, File[]>>;

export function loadDraft<T>(): T | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { savedAt?: number; data?: T };
    if (!saved.savedAt || !saved.data || Date.now() - saved.savedAt > MAX_AGE_MS) {
      clearDraft();
      return null;
    }
    return saved.data;
  } catch {
    return null;
  }
}

export function saveDraft<T>(data: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    /* storage full or blocked: no draft */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  void saveDraftPhotos({});
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Replaces the saved photos with these (garment key → part → files); `{}` clears them. */
export async function saveDraftPhotos(all: DraftPhotos): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      store.clear();
      for (const [garment, parts] of Object.entries(all)) store.put(parts, garment);
      tx.oncomplete = tx.onerror = tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}

export async function loadDraftPhotos(): Promise<DraftPhotos> {
  const db = await openDb();
  if (!db) return {};
  const out = await new Promise<DraftPhotos>((resolve) => {
    try {
      const store = db.transaction(STORE, 'readonly').objectStore(STORE);
      const keys = store.getAllKeys();
      const values = store.getAll();
      values.onsuccess = () => {
        const result: DraftPhotos = {};
        (keys.result as IDBValidKey[]).forEach((k, i) => (result[String(k)] = values.result[i]));
        resolve(result);
      };
      values.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
  db.close();
  return out;
}
