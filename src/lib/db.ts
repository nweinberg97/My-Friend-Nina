// Local-first persistence.
// - IndexedDB "my-friend-nina": `collections` (structured data) and `audio` (voice blobs).
// - localStorage: small prefs + app metadata.
// Everything sits behind the `storage` object so a cloud-sync implementation
// can be swapped in later without touching feature code.
import type { AppData, Meta, Prefs } from '../types';

const DB_NAME = 'my-friend-nina';
const DB_VERSION = 1;
export const SCHEMA_VERSION = 1;
const PREFS_KEY = 'mfn:prefs';
const META_KEY = 'mfn:meta';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('collections')) db.createObjectStore('collections');
      if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const r = fn(s);
        t.oncomplete = () => resolve(r ? (r as IDBRequest<T>).result : undefined);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — data still lives in memory for this session */
  }
}

export const COLLECTIONS: (keyof AppData)[] = ['checkins', 'rituals', 'completions', 'reflections', 'notes'];

export const storage = {
  loadPrefs: () => readLocal<Prefs>(PREFS_KEY),
  savePrefs: (p: Prefs) => writeLocal(PREFS_KEY, p),
  loadMeta: () => readLocal<Meta>(META_KEY),
  saveMeta: (m: Meta) => writeLocal(META_KEY, m),

  async loadData(): Promise<Partial<AppData>> {
    const out: Partial<AppData> = {};
    for (const key of COLLECTIONS) {
      const v = await tx<unknown>('collections', 'readonly', (s) => s.get(key));
      if (v !== undefined) (out as Record<string, unknown>)[key] = v;
    }
    return out;
  },

  async saveCollection<K extends keyof AppData>(key: K, value: AppData[K]) {
    await tx('collections', 'readwrite', (s) => s.put(value, key));
  },

  async saveAudio(id: string, blob: Blob) {
    await tx('audio', 'readwrite', (s) => s.put(blob, id));
  },

  async getAudio(id: string): Promise<Blob | undefined> {
    return tx<Blob>('audio', 'readonly', (s) => s.get(id));
  },

  async deleteAudio(id: string) {
    await tx('audio', 'readwrite', (s) => s.delete(id));
  },

  async allAudio(): Promise<{ id: string; blob: Blob }[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const out: { id: string; blob: Blob }[] = [];
      const req = db.transaction('audio', 'readonly').objectStore('audio').openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (c) {
          out.push({ id: String(c.key), blob: c.value as Blob });
          c.continue();
        } else resolve(out);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async clearEverything() {
    try {
      localStorage.removeItem(PREFS_KEY);
      localStorage.removeItem(META_KEY);
    } catch {
      /* ignore */
    }
    await tx('collections', 'readwrite', (s) => s.clear());
    await tx('audio', 'readwrite', (s) => s.clear());
  },

  async requestPersistence() {
    try {
      if (navigator.storage?.persist) await navigator.storage.persist();
    } catch {
      /* best effort */
    }
  },
};
