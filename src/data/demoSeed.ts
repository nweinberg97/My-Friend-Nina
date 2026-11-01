// Illustrative sample data for stakeholder demos: ~3 weeks of a fictional
// user's history. This is NOT Nina's personal history.
import type { AppData, DailyCheckIn, EnergyState, NoteToMe, Reflection, RitualCompletion, RitualSize } from '../types';
import { starterRituals } from '../content/rituals';
import { addDays, localDate, timezone } from '../lib/dates';
import { placeholderWav } from '../lib/audio';

const PATTERN: (EnergyState | null)[] = [
  'steady', 'high', 'high', 'steady', 'low', null, 'rest',
  'steady', 'steady', 'high', 'low', 'low', 'rest', null,
  'steady', 'high', 'steady', null, 'low', 'steady', 'high',
];

const SIZE_FOR: Record<EnergyState, RitualSize[]> = {
  high: ['full', 'full', 'small'],
  steady: ['small', 'full', 'small'],
  low: ['tiny', 'tiny', 'small'],
  rest: ['tiny'],
};

const INTENTIONS = ['A long walk after work', 'Call Mom back', 'Actually eat lunch sitting down', 'Bed before 11', 'Nothing. And that is fine.', 'Seawall run with Jess', 'Finish the book'];

function iso(date: string, hour: number, min = 12) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hour, min).toISOString();
}

export function buildDemo(): { data: AppData; audio: { id: string; blob: Blob }[] } {
  const today = localDate();
  const start = addDays(today, -PATTERN.length);
  const rituals = starterRituals();
  rituals.find((r) => r.id === 'r-connect-voice')!.selected = true;
  rituals.find((r) => r.id === 'r-recharge-read')!.selected = true;
  rituals.push({
    id: 'r-custom-plunge', pillarId: 'move', name: 'Cold dip', description: 'Ocean, cold shower, or just cold water on your face.',
    sizes: { full: 'Ocean dip with friends', small: '30-second cold shower', tiny: 'Cold water on your face' },
    selected: true, archived: false, custom: true,
  });
  const selected = rituals.filter((r) => r.selected);

  const checkins: Record<string, DailyCheckIn> = {};
  const completions: RitualCompletion[] = [];

  PATTERN.forEach((state, i) => {
    if (!state) return;
    const date = addDays(start, i);
    const history = [{ state, at: iso(date, 8, 5) }];
    if (i === 4) history.unshift({ state: 'steady', at: iso(date, 7, 40) });
    if (i === 11) history.push({ state: 'rest', at: iso(date, 15, 10) }, { state: 'low', at: iso(date, 19, 2) });
    checkins[date] = {
      date, timezone: timezone(), state: history[history.length - 1].state, history,
      intention: i % 3 === 0 ? INTENTIONS[i % INTENTIONS.length] : undefined,
      kindThing: state === 'rest' ? 'A long shower with your good playlist' : undefined,
    };
    const sizes = SIZE_FOR[state];
    const count = state === 'high' ? 4 : state === 'steady' ? 3 : state === 'low' ? 1 + (i % 2) : 0;
    for (let k = 0; k < count; k++) {
      const r = selected[(i + k * 3) % selected.length];
      completions.push({ id: `c-demo-${i}-${k}`, ritualId: r.id, size: sizes[k % sizes.length], date, at: iso(date, 9 + k * 3) });
    }
  });

  const d = (i: number) => addDays(start, i);
  const reflections: Reflection[] = [
    { id: 'rf-demo-1', type: 'text', title: 'First proper sunny day', body: 'Walked the long way home just because. Forgot how much I love the smell of the water. Note to self: do that more.', prompt: 'What made you smile today?', state: 'high', pinned: true, sample: true, createdAt: iso(d(2), 18), updatedAt: iso(d(2), 18) },
    { id: 'rf-demo-2', type: 'text', body: 'Work was a lot. I ate lunch at my desk again. Tomorrow I am going to at least sit outside for ten minutes.', prompt: 'What would make tomorrow feel a little easier?', state: 'low', pinned: false, sample: true, createdAt: iso(d(4), 21), updatedAt: iso(d(4), 21) },
    { id: 'rf-demo-3', type: 'voice', title: 'Driving home thoughts', audioId: 'aud-demo-1', audioMime: 'audio/wav', durationSec: 6, state: 'steady', pinned: false, sample: true, createdAt: iso(d(8), 17, 40), updatedAt: iso(d(8), 17, 40) },
    { id: 'rf-demo-4', type: 'guided', title: 'Get It Out', guided: { mode: 'write', express: "Feeling behind on everything. Friends are doing big things and I'm just… here. Tired of comparing.", noticing: 'Tight chest. Mostly tired, not actually sad.', nextStep: 'reach' }, state: 'low', pinned: false, sample: true, createdAt: iso(d(10), 20), updatedAt: iso(d(10), 20) },
    { id: 'rf-demo-5', type: 'text', title: 'Rest day, no guilt', body: 'Did basically nothing. Read on the couch, made soup. It was perfect actually.', state: 'rest', pinned: true, sample: true, createdAt: iso(d(12), 19), updatedAt: iso(d(12), 19) },
    { id: 'rf-demo-6', type: 'voice', title: 'Morning ramble', audioId: 'aud-demo-2', audioMime: 'audio/wav', durationSec: 5, state: 'high', pinned: false, sample: true, createdAt: iso(d(15), 7, 30), updatedAt: iso(d(15), 7, 30) },
    { id: 'rf-demo-7', type: 'guided', title: 'Get It Out', guided: { mode: 'say', express: 'Awkward conversation with a coworker on loop in my head.', noticing: "Probably not as big a deal as my brain says. They're stressed too.", nextStep: 'break' }, state: 'steady', pinned: false, sample: true, createdAt: iso(d(16), 13), updatedAt: iso(d(16), 13) },
    { id: 'rf-demo-8', type: 'text', title: 'Little wins', body: 'Three good things: the barista remembered my order, I finally stretched, and Jess sent a voice note that made me cry laughing.', prompt: 'What made you smile today?', state: 'high', pinned: false, sample: true, createdAt: iso(d(20), 21), updatedAt: iso(d(20), 21) },
  ];

  const notes: NoteToMe[] = [
    { id: 'nt-demo-1', lookBack: 'Not working out as much as I planned this month.', friendSays: "You've had a heavy month. Your body isn't a project you're failing at. Walks count.", forward: 'Ten-minute walks count. That is the whole plan.', pinned: true, createdAt: iso(d(6), 21), updatedAt: iso(d(6), 21) },
    { id: 'nt-demo-2', lookBack: 'Being slow to reply to everyone.', friendSays: "Your real friends get it. You'd never be mad at them for this.", forward: 'One message a day, no apologising for the delay.', pinned: false, createdAt: iso(d(14), 22), updatedAt: iso(d(14), 22) },
  ];

  return {
    data: { checkins, rituals, completions, reflections, notes },
    audio: [
      { id: 'aud-demo-1', blob: placeholderWav(6, 0) },
      { id: 'aud-demo-2', blob: placeholderWav(5, 2) },
    ],
  };
}
