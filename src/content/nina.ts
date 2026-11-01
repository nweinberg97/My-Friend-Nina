// Nina's content library.
// EVERY line in this file is [DRAFT — NINA TO APPROVE]. Nothing here is a real
// quote from Nina or a claim about her life. Swap freely once she's reviewed it.
// In production this becomes a CMS feed with the same shape.
import type { EnergyState } from '../types';

export interface ContentItem {
  id: string;
  body: string;
  states?: EnergyState[];
  approved: boolean;
}

export const STATE_META: Record<
  EnergyState,
  { label: string; short: string; feel: string; sizeHint: string }
> = {
  high: { label: 'High energy', short: 'High', feel: "Ready for more today", sizeHint: 'Full sizes suggested' },
  steady: { label: 'Steady', short: 'Steady', feel: 'A pretty normal day', sizeHint: 'Small or full' },
  low: { label: 'Low battery', short: 'Low', feel: 'Keeping it simple', sizeHint: 'Tiny or small' },
  rest: { label: 'Rest', short: 'Rest', feel: 'No plan needed', sizeHint: 'No checklist today' },
};

export const GREETINGS = [
  "Morning! What's the vibe today?",
  'Okay, how are we actually doing?',
  'New day. No need to make it a big thing.',
  "Hey you. Let's start here.",
  'Hi hi. Quick check-in?',
];

export const EVENING_GREETINGS = [
  'Hey. How did today treat you?',
  "Evening check-in. No wrong answers.",
  "Still here? Love that. How's it going?",
];

// One main daily note per state, rotated by date.
export const DAILY_NOTES: Record<EnergyState, string[]> = {
  high: [
    "Okay, we're feeling good. What's something you've been wanting to do? Maybe today's the day.",
    "Love a day when things are clicking. Enjoy it. No need to turn it into a competition.",
    "Use the good energy, but don't spend it all before lunch. Future you would like some too.",
    "Big day energy. Go do the thing, then come back and tell me how it went.",
  ],
  steady: [
    'A pretty normal day is actually a lovely thing. Let\'s not overlook it.',
    "Nothing to prove today. Just find your rhythm and get on with it.",
    'Nothing dramatic needed. Keep doing the little things that make you feel like you.',
    "Steady is underrated. Coffee, a walk, one nice thing for yourself. Done.",
  ],
  low: [
    "Okay, low battery day. We are not fixing your whole life today. Water, something with protein, maybe five minutes outside. That counts.",
    "Let's keep things simple. Something to eat, a little fresh air if you feel like it, and absolutely no unnecessary drama.",
    "Not every day is a big day. Pick something small and let that be enough.",
    "Let's not make today harder than it needs to be. One little thing. We'll call that a win.",
  ],
  rest: [
    "Nothing's due today. Your only job is to be a person.",
    "You don't need to earn a quiet day. Just have one.",
    "Cancel the imaginary expectations. Today's allowed to look different.",
    'Today doesn\'t need a plan. Do what feels kind to you. That\'s enough.',
  ],
};

// The underlying insights, written entirely in Nina's voice. Never labelled
// or numbered in the UI — they surface as "a little reminder".
export const ENCOURAGEMENTS: { id: string; theme: string; body: string; states: EnergyState[] }[] = [
  { id: 'learn-1', theme: 'learning', states: ['high', 'steady'], body: "You're not supposed to be brilliant at everything on the first go. That's literally why it's called learning." },
  { id: 'learn-2', theme: 'learning', states: ['steady', 'low'], body: "Bad at it right now? Cool. That's just the beginning part. Everyone has one." },
  { id: 'notice-1', theme: 'notice', states: ['steady', 'low', 'rest'], body: "That coffee was good. The sun came out. Someone made you laugh. Don't let your brain skip over all of that." },
  { id: 'notice-2', theme: 'notice', states: ['high', 'rest'], body: "Hot shower, a good song, the mountains doing their thing. Honestly? You've got a lot going for you today." },
  { id: 'notice-3', theme: 'notice', states: ['steady', 'high'], body: "Scrolling other people's highlight reels is a great way to forget your own life is pretty nice. Just saying." },
  { id: 'hope-1', theme: 'hope', states: ['low', 'steady'], body: "Okay, things are a bit messy. Fair. Now what's one little thing we can actually do about it?" },
  { id: 'hope-2', theme: 'hope', states: ['high', 'steady'], body: "Feeling hopeful is great. Feeling hopeful and doing one small thing about it? Even better." },
  { id: 'curious-1', theme: 'curious', states: ['low', 'rest', 'steady'], body: "Instead of giving yourself a hard time, maybe just get curious. What's actually going on here?" },
  { id: 'curious-2', theme: 'curious', states: ['low', 'rest'], body: "Where are you feeling it? Shoulders? Jaw? Stomach? You don't have to fix it. Just notice." },
  { id: 'present-1', theme: 'present', states: ['high', 'steady'], body: "Put the phone down for a minute. The person in front of you is probably more interesting than whatever's on your feed." },
  { id: 'present-2', theme: 'present', states: ['rest', 'low'], body: "Slow down. Look up. What can you hear right now? That's it, that's the whole exercise." },
  { id: 'grace-1', theme: 'grace', states: ['steady', 'high'], body: "Not every weird interaction needs a full investigation. People have their own stuff going on too." },
  { id: 'grace-2', theme: 'grace', states: ['low', 'steady'], body: "Holding a grudge is like carrying someone else's backpack up the Grind. Put it down. Your legs will thank you." },
  { id: 'kind-1', theme: 'kind', states: ['low', 'rest', 'steady'], body: "You wouldn't speak to your best friend like that. So let's retire that particular way of talking to yourself." },
  { id: 'kind-2', theme: 'kind', states: ['high', 'steady'], body: "Do one nice thing for someone today just because. It's sneakily one of the best feelings ever." },
  { id: 'room-1', theme: 'room', states: ['steady', 'low', 'rest'], body: "Something ending doesn't mean everything is over. Sometimes it just means there's room for something else." },
  { id: 'room-2', theme: 'room', states: ['high', 'steady'], body: "There's room for you. You don't have to beat anyone to get your turn." },
  { id: 'room-3', theme: 'room', states: ['rest', 'low'], body: "What you've got right now? It's enough. You're enough. Okay, back to resting." },
];

export const COMPLETION_LINES = [
  'There we go.',
  'Small but mighty.',
  'Look at you, showing up.',
  "That's one thing you did for yourself.",
  'Honestly, that counts.',
  'Love that for you.',
  'Small and done beats big and someday.',
];

export const INTENTION_PROMPT = "What's one thing you'd like to make a little room for today?";

export const REFLECTION_PROMPTS = [
  "What's something you've been thinking about a lot lately?",
  'What made you smile today?',
  'What would make tomorrow feel a little easier?',
  "What's something you're giving yourself a hard time about?",
  'What do you want to make more room for?',
  'Who have you been meaning to check in with?',
  "What's one thing you're ready to stop carrying around?",
  'What was the best ten minutes of your day?',
];

export const KIND_THINGS = [
  'A long shower with your good playlist',
  'Something warm to drink, sitting down',
  'Text someone who makes you laugh',
  'Lie on the floor. Genuinely underrated.',
  'Step outside for one breath of fresh air',
  'An early night, no guilt attached',
];

export const RETURN_LINES = [
  "Hey, you're back. No catching up required. What kind of day is it today?",
  "Hi! Life happens. No catch-up homework. We start from today.",
];

export const GET_IT_OUT = {
  name: 'Get It Out',
  tagline: 'Vent first. Figure it out later (or don\'t).',
  open: "Okay, what's taking up space in your head right now?",
  express: 'Go on. Get it out. No need to make it sound pretty.',
  pause: "Okay. Take a second. What's the main thing you're noticing right now?",
  pauseHint: 'A feeling, a word, where it sits in your body. Totally optional.',
  choose: "What's one little thing that might make the next hour feel a bit easier?",
  finish: "That's enough for now. You don't need to solve the entire thing today.",
  options: [
    { id: 'ritual', label: 'Do one tiny ritual' },
    { id: 'break', label: 'Take a proper break' },
    { id: 'reach', label: 'Reach out to someone' },
    { id: 'leave', label: 'Leave it here for now' },
  ],
};

export const NOTE_TO_ME = {
  name: 'A Little Note to Me',
  tagline: 'Let yourself off the hook. Then decide how you want to talk to you.',
  lookBack: "What have you been giving yourself a hard time about?",
  friend: 'If your best friend told you this, what would you say to them?',
  forward: "What's one little thing you'd like to do differently from here?",
  saved: 'Pinned. Read it on the days you need it.',
};

export const NINA_INTRO = {
  hello: "Hey, I'm Nina.",
  welcome: 'Welcome to your little corner of the internet.',
  body: "No pressure to have a perfect routine here. We're just figuring out what feels good, one day at a time.",
};

export function pick<T>(list: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

export function noteFor(state: EnergyState, date: string): string {
  return pick(DAILY_NOTES[state], date + state);
}

export function encouragementFor(state: EnergyState, date: string) {
  const pool = ENCOURAGEMENTS.filter((e) => e.states.includes(state));
  return pick(pool, date + ':enc:' + state);
}
