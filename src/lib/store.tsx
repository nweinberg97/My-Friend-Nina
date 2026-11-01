import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppData, DailyCheckIn, EnergyState, Meta, NoteToMe, Prefs, Reflection, Ritual, RitualCompletion, RitualSize } from '../types';
import { storage, SCHEMA_VERSION } from './db';
import { localDate, timezone, uid, daysBetween } from './dates';
import { starterRituals } from '../content/rituals';
import { buildDemo } from '../data/demoSeed';

const emptyData = (): AppData => ({ checkins: {}, rituals: starterRituals(), completions: [], reflections: [], notes: [] });
const defaultPrefs = (): Prefs => ({ wants: [], onboarded: false, privacyAccepted: false, littleMoments: true, demo: false, createdAt: new Date().toISOString() });

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

interface Ctx {
  status: 'loading' | 'ready' | 'error';
  storageWarning: boolean;
  today: string;
  prefs: Prefs;
  data: AppData;
  awayDays: number;
  checkin?: DailyCheckIn;
  mood: EnergyState;
  setPrefs: (p: Partial<Prefs>) => void;
  setEnergy: (s: EnergyState) => void;
  setIntention: (t: string) => void;
  setKindThing: (t?: string) => void;
  completeRitual: (ritualId: string, size: RitualSize) => RitualCompletion;
  undoCompletion: (id: string) => void;
  saveRitual: (r: Ritual) => void;
  addReflection: (r: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt' | 'pinned'> & { pinned?: boolean }, audio?: Blob) => Promise<Reflection>;
  updateReflection: (id: string, patch: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  addNote: (n: Omit<NoteToMe, 'id' | 'createdAt' | 'updatedAt'>) => NoteToMe;
  updateNote: (id: string, patch: Partial<NoteToMe>) => void;
  deleteNote: (id: string) => void;
  loadDemo: () => Promise<void>;
  startFresh: () => Promise<void>;
  deleteEverything: () => Promise<void>;
  exportData: () => Promise<void>;
  getAudio: (id: string) => Promise<Blob | undefined>;
  toasts: Toast[];
  toast: (message: string, action?: Toast['action']) => void;
  dismissToast: (id: number) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Ctx['status']>('loading');
  const [storageWarning, setStorageWarning] = useState(false);
  const [prefs, setPrefsState] = useState<Prefs>(defaultPrefs);
  const [data, setData] = useState<AppData>(emptyData);
  const [today, setToday] = useState(localDate());
  const [awayDays, setAwayDays] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((message: string, action?: Toast['action']) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, action }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 5500 : 3200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // ---- load + schema check ----
  useEffect(() => {
    (async () => {
      const p = storage.loadPrefs();
      const meta = storage.loadMeta();
      if (meta && meta.schemaVersion > SCHEMA_VERSION) {
        setStatus('error');
        return;
      }
      try {
        const stored = await storage.loadData();
        const base = emptyData();
        setData({
          checkins: stored.checkins ?? base.checkins,
          rituals: stored.rituals?.length ? stored.rituals : base.rituals,
          completions: stored.completions ?? [],
          reflections: stored.reflections ?? [],
          notes: stored.notes ?? [],
        });
      } catch {
        setStorageWarning(true);
      }
      if (p) setPrefsState({ ...defaultPrefs(), ...p });
      const now = new Date().toISOString();
      if (meta?.lastOpenedAt) setAwayDays(daysBetween(localDate(new Date(meta.lastOpenedAt)), localDate()));
      const nextMeta: Meta = { schemaVersion: SCHEMA_VERSION, lastOpenedAt: now, previousOpenedAt: meta?.lastOpenedAt };
      storage.saveMeta(nextMeta);
      storage.requestPersistence();
      setStatus('ready');
    })();
  }, []);

  // ---- midnight rollover: check when the app regains focus ----
  useEffect(() => {
    const check = () => setToday((t) => (t !== localDate() ? localDate() : t));
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    const i = window.setInterval(check, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
      window.clearInterval(i);
    };
  }, []);

  const persist = useCallback(<K extends keyof AppData>(key: K, value: AppData[K]) => {
    storage.saveCollection(key, value).catch(() => setStorageWarning(true));
  }, []);

  const update = useCallback(<K extends keyof AppData>(key: K, fn: (v: AppData[K]) => AppData[K]) => {
    setData((d) => {
      const v = fn(d[key]);
      persist(key, v);
      return { ...d, [key]: v };
    });
  }, [persist]);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((p) => {
      const n = { ...p, ...patch };
      storage.savePrefs(n);
      return n;
    });
  }, []);

  const checkin = data.checkins[today];
  const mood: EnergyState = checkin?.state ?? 'steady';

  const setEnergy = useCallback((s: EnergyState) => {
    update('checkins', (c) => {
      const prev = c[today];
      const at = new Date().toISOString();
      const next: DailyCheckIn = prev
        ? { ...prev, state: s, history: [...prev.history, { state: s, at }] }
        : { date: today, timezone: timezone(), state: s, history: [{ state: s, at }] };
      return { ...c, [today]: next };
    });
  }, [today, update]);

  const patchCheckin = useCallback((patch: Partial<DailyCheckIn>) => {
    update('checkins', (c) => {
      const prev = c[today] ?? { date: today, timezone: timezone(), state: 'steady' as EnergyState, history: [] };
      return { ...c, [today]: { ...prev, ...patch } };
    });
  }, [today, update]);

  const setIntention = useCallback((t: string) => patchCheckin({ intention: t.trim() || undefined }), [patchCheckin]);
  const setKindThing = useCallback((t?: string) => patchCheckin({ kindThing: t }), [patchCheckin]);

  const completeRitual = useCallback((ritualId: string, size: RitualSize) => {
    const c: RitualCompletion = { id: uid('c'), ritualId, size, date: today, at: new Date().toISOString() };
    update('completions', (list) => [...list.filter((x) => !(x.ritualId === ritualId && x.date === today)), c]);
    try { navigator.vibrate?.(12); } catch { /* haptics optional */ }
    return c;
  }, [today, update]);

  const undoCompletion = useCallback((id: string) => update('completions', (l) => l.filter((x) => x.id !== id)), [update]);

  const saveRitual = useCallback((r: Ritual) => {
    update('rituals', (l) => (l.some((x) => x.id === r.id) ? l.map((x) => (x.id === r.id ? r : x)) : [...l, r]));
  }, [update]);

  const addReflection: Ctx['addReflection'] = useCallback(async (r, audio) => {
    const now = new Date().toISOString();
    let audioId: string | undefined;
    if (audio) {
      audioId = uid('aud');
      await storage.saveAudio(audioId, audio);
    }
    const full: Reflection = { pinned: false, ...r, audioId: audioId ?? r.audioId, audioMime: audio?.type ?? r.audioMime, id: uid('rf'), createdAt: now, updatedAt: now };
    update('reflections', (l) => [full, ...l]);
    return full;
  }, [update]);

  const updateReflection = useCallback((id: string, patch: Partial<Reflection>) => {
    update('reflections', (l) => l.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)));
  }, [update]);

  const deleteReflection = useCallback((id: string) => {
    setData((d) => {
      const r = d.reflections.find((x) => x.id === id);
      if (r?.audioId) storage.deleteAudio(r.audioId).catch(() => {});
      const l = d.reflections.filter((x) => x.id !== id);
      persist('reflections', l);
      return { ...d, reflections: l };
    });
  }, [persist]);

  const addNote = useCallback((n: Omit<NoteToMe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const full: NoteToMe = { ...n, id: uid('nt'), createdAt: now, updatedAt: now };
    update('notes', (l) => [full, ...l]);
    return full;
  }, [update]);
  const updateNote = useCallback((id: string, patch: Partial<NoteToMe>) => update('notes', (l) => l.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x))), [update]);
  const deleteNote = useCallback((id: string) => update('notes', (l) => l.filter((x) => x.id !== id)), [update]);

  const replaceAll = useCallback(async (d: AppData, p: Prefs) => {
    setData(d);
    setPrefsState(p);
    storage.savePrefs(p);
    for (const k of Object.keys(d) as (keyof AppData)[]) await storage.saveCollection(k, d[k] as never);
  }, []);

  const loadDemo = useCallback(async () => {
    await storage.clearEverything().catch(() => {});
    const { data: d, audio } = buildDemo();
    for (const a of audio) await storage.saveAudio(a.id, a.blob).catch(() => {});
    await replaceAll(d, { ...defaultPrefs(), name: 'Sam', wants: ['move', 'present', 'rest'], onboarded: true, privacyAccepted: true, demo: true });
    storage.saveMeta({ schemaVersion: SCHEMA_VERSION, lastOpenedAt: new Date().toISOString() });
    setAwayDays(0);
  }, [replaceAll]);

  const startFresh = useCallback(async () => {
    await storage.clearEverything().catch(() => {});
    await replaceAll(emptyData(), defaultPrefs());
    storage.saveMeta({ schemaVersion: SCHEMA_VERSION, lastOpenedAt: new Date().toISOString() });
    setAwayDays(0);
  }, [replaceAll]);

  const deleteEverything = useCallback(async () => {
    await storage.clearEverything();
    setData(emptyData());
    setPrefsState(defaultPrefs());
    setAwayDays(0);
  }, []);

  const exportData = useCallback(async () => {
    const audio = await storage.allAudio().catch(() => []);
    const payload = { app: 'My Friend Nina', exportedAt: new Date().toISOString(), schemaVersion: SCHEMA_VERSION, prefs, ...data, audioFiles: audio.map((a) => a.id) };
    const dl = (blob: Blob, name: string) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    const stamp = localDate();
    dl(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `my-friend-nina-${stamp}.json`);
    audio.forEach((a, i) => {
      const ext = a.blob.type.includes('mp4') || a.blob.type.includes('aac') ? 'm4a' : a.blob.type.includes('wav') ? 'wav' : a.blob.type.includes('ogg') ? 'ogg' : 'webm';
      setTimeout(() => dl(a.blob, `${a.id}.${ext}`), 300 * (i + 1));
    });
  }, [data, prefs]);

  const value = useMemo<Ctx>(() => ({
    status, storageWarning, today, prefs, data, awayDays, checkin, mood,
    setPrefs, setEnergy, setIntention, setKindThing, completeRitual, undoCompletion, saveRitual,
    addReflection, updateReflection, deleteReflection, addNote, updateNote, deleteNote,
    loadDemo, startFresh, deleteEverything, exportData, getAudio: storage.getAudio,
    toasts, toast, dismissToast,
  }), [status, storageWarning, today, prefs, data, awayDays, checkin, mood, setPrefs, setEnergy, setIntention, setKindThing, completeRitual, undoCompletion, saveRitual, addReflection, updateReflection, deleteReflection, addNote, updateNote, deleteNote, loadDemo, startFresh, deleteEverything, exportData, toasts, toast, dismissToast]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
