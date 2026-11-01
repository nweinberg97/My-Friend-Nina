// Four pillars + starter ritual library. [DRAFT — NINA TO APPROVE]
// Suggested activities, never prescriptions. No calorie targets, no punishment workouts.
import type { Pillar, PillarId, Ritual } from '../types';

export const PILLARS: Pillar[] = [
  { id: 'nourish', name: 'Nourish & Hydrate', short: 'Nourish', blurb: 'Feed yourself like someone you like.' },
  { id: 'move', name: 'Gentle Vessel Movement', short: 'Move', blurb: "Movement you'd actually choose." },
  { id: 'connect', name: 'Mindset & Connection', short: 'Connect', blurb: 'Your head, your people.' },
  { id: 'recharge', name: 'Rest & Recharge', short: 'Recharge', blurb: 'Downtime counts as time well spent.' },
];

export const PILLAR_BY_ID = Object.fromEntries(PILLARS.map((p) => [p.id, p])) as Record<PillarId, Pillar>;

type Seed = Omit<Ritual, 'selected' | 'archived' | 'custom'> & { selected?: boolean };

const SEED: Seed[] = [
  // Nourish & Hydrate
  { id: 'r-nourish-meal', pillarId: 'nourish', name: 'Make something nourishing', description: 'Real food, made by you, for you.', sizes: { full: 'Cook a proper meal', small: 'Make a simple snack', tiny: 'Choose something to eat' }, ninaNote: 'Eggs on toast is a meal. I will not be taking questions.', selected: true },
  { id: 'r-nourish-water', pillarId: 'nourish', name: 'Hydration moment', description: 'Your vessel is mostly water. Top it up.', sizes: { full: 'Fill and finish a water bottle', small: 'Have a full glass of water', tiny: 'Take a few sips' }, selected: true },
  { id: 'r-nourish-mindful', pillarId: 'nourish', name: 'Sit-down meal', description: 'Eat without a screen for once.', sizes: { full: 'Sit down, no distractions', small: 'Take a few slow bites', tiny: 'Pause before eating' } },
  { id: 'r-nourish-kitchen', pillarId: 'nourish', name: 'Kitchen reset', description: 'Make tomorrow-you a little happier.', sizes: { full: 'Prep ingredients for tomorrow', small: 'Clear one small area', tiny: 'Put away one thing' } },
  // Gentle Vessel Movement
  { id: 'r-move-outside', pillarId: 'move', name: 'Get outside', description: 'Fresh air fixes more than it should.', sizes: { full: '30-minute walk', small: '10-minute walk', tiny: 'Step outside' }, ninaNote: 'Seawall, side street, your balcony. Outside is outside.', selected: true },
  { id: 'r-move-body', pillarId: 'move', name: 'Move your body', description: 'Any movement you actually enjoy.', sizes: { full: '30-minute movement session', small: '10 minutes of movement', tiny: 'Stretch it out' }, selected: true },
  { id: 'r-move-mobility', pillarId: 'move', name: 'Mobility moment', description: 'Unstiffen the desk body.', sizes: { full: '10-minute mobility flow', small: '3-minute stretch', tiny: 'Change position and roll your shoulders' } },
  { id: 'r-move-play', pillarId: 'move', name: 'Play something', description: 'Movement that feels like fun, not homework.', sizes: { full: 'Join a class, game or adventure', small: 'Dance to one song', tiny: 'Put on a song you love' }, ninaNote: 'Kitchen dance parties are a legitimate sport.' },
  // Mindset & Connection
  { id: 'r-connect-good', pillarId: 'connect', name: 'Good stuff moment', description: 'Catch the nice things before they slip by.', sizes: { full: 'Write three good things', small: 'Write one good thing', tiny: 'Notice one good moment' }, selected: true },
  { id: 'r-connect-voice', pillarId: 'connect', name: 'Voice note to self', description: 'Talk it out like you would on a drive.', sizes: { full: 'Record a 3-minute reflection', small: 'Record 30 seconds', tiny: 'Say one sentence out loud' }, ninaNote: 'Car-confessional energy, minus the car.' },
  { id: 'r-connect-people', pillarId: 'connect', name: 'Connect with someone', description: 'Your people are part of your vessel too.', sizes: { full: 'Have a real conversation', small: 'Send a thoughtful message', tiny: 'Think of someone you appreciate' }, selected: true },
  { id: 'r-connect-reset', pillarId: 'connect', name: 'Personal reset', description: 'A little space to hear yourself think.', sizes: { full: 'Journal for 10 minutes', small: 'Write three lines', tiny: 'Take one quiet moment' } },
  // Rest & Recharge
  { id: 'r-recharge-wind', pillarId: 'recharge', name: 'Evening wind-down', description: 'Land the day gently.', sizes: { full: '30 minutes screen-free', small: '10-minute wind-down', tiny: 'Put your phone down' }, ninaNote: "Phone across the room. You'll survive, I promise.", selected: true },
  { id: 'r-recharge-read', pillarId: 'recharge', name: 'Read something', description: 'Words that aren\'t a feed.', sizes: { full: 'Read for 20 minutes', small: 'Read for 5 minutes', tiny: 'Read one page' } },
  { id: 'r-recharge-calm', pillarId: 'recharge', name: 'A calm moment', description: 'Do nothing on purpose.', sizes: { full: 'Spend time on something relaxing', small: 'Take a short break', tiny: 'Sit quietly for a moment' } },
  { id: 'r-recharge-space', pillarId: 'recharge', name: 'Make space', description: 'Tidy space, slightly tidier head.', sizes: { full: 'Reset a room', small: 'Tidy one surface', tiny: 'Put away one thing' } },
];

export function starterRituals(): Ritual[] {
  return SEED.map((r) => ({ ...r, selected: !!r.selected, archived: false, custom: false }));
}

// Nina's Picks [DRAFT — NINA TO APPROVE]. Commentary is illustrative and
// must not be presented as Nina's real routine until she writes or approves it.
export const NINA_PICKS: { ritualId: string; image: string; title: string; note: string }[] = [
  { ritualId: 'r-move-outside', image: 'images/seawall.jpg', title: 'Get outside', note: 'If in doubt, go outside. Even for five minutes.' },
  { ritualId: 'r-move-play', image: 'images/cycling.jpg', title: 'Play something', note: "Pick the movement that feels like recess, not a punishment." },
  { ritualId: 'r-connect-voice', image: 'images/blazer.jpg', title: 'Voice note to self', note: 'Talk it out. You always sound wiser than you think.' },
  { ritualId: 'r-recharge-calm', image: 'images/overlook.jpg', title: 'A calm moment', note: "Find a view, any view, and just look at it for a minute." },
];

export const SIZE_LABEL = { full: 'Full', small: 'Small', tiny: 'Tiny' } as const;
