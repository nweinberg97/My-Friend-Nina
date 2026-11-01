export type EnergyState = 'high' | 'steady' | 'low' | 'rest';
export type RitualSize = 'full' | 'small' | 'tiny';
export type PillarId = 'nourish' | 'move' | 'connect' | 'recharge';

export interface Pillar {
  id: PillarId;
  name: string;
  short: string;
  blurb: string;
}

export interface Ritual {
  id: string;
  pillarId: PillarId;
  name: string;
  description: string;
  sizes: Record<RitualSize, string>;
  ninaNote?: string;
  selected: boolean;
  archived: boolean;
  custom: boolean;
}

export interface RitualCompletion {
  id: string;
  ritualId: string;
  size: RitualSize;
  date: string; // local YYYY-MM-DD
  at: string; // ISO
}

export interface StateChange {
  state: EnergyState;
  at: string;
}

export interface DailyCheckIn {
  date: string;
  timezone: string;
  state: EnergyState;
  intention?: string;
  history: StateChange[];
  kindThing?: string;
}

export type ReflectionType = 'text' | 'voice' | 'guided';

export interface GuidedAnswers {
  mode?: 'say' | 'write' | 'unsure';
  express?: string;
  noticing?: string;
  nextStep?: string;
}

export interface Reflection {
  id: string;
  type: ReflectionType;
  title?: string;
  body?: string;
  prompt?: string;
  audioId?: string;
  audioMime?: string;
  durationSec?: number;
  guided?: GuidedAnswers;
  state?: EnergyState;
  pinned: boolean;
  sample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteToMe {
  id: string;
  lookBack: string;
  friendSays: string;
  forward: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prefs {
  name?: string;
  wants: string[];
  onboarded: boolean;
  privacyAccepted: boolean;
  littleMoments: boolean;
  demo: boolean;
  createdAt: string;
}

export interface Meta {
  schemaVersion: number;
  lastOpenedAt?: string;
  previousOpenedAt?: string;
}

export interface AppData {
  checkins: Record<string, DailyCheckIn>;
  rituals: Ritual[];
  completions: RitualCompletion[];
  reflections: Reflection[];
  notes: NoteToMe[];
}
