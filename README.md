# My Friend Nina

A creator-led daily companion built around Vancouver lifestyle creator Nina Brennan.
This repo is the **mobile-first interactive prototype**: a landing page plus a working app, with local-first storage and no backend.

> Prototype. All copy in Nina's voice is **[DRAFT — NINA TO APPROVE]**. Photos are placeholders pending Nina's approved assets. Sample data belongs to a fictional demo user, not Nina.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173, rebuilds on change
npm run build     # static site in /dist
```

Deploy `/dist` to any static host. `vercel.json` is included; on Netlify use build command `npm run build` and publish directory `dist`.

## What's in it

- **Landing page:** hero, philosophy, how it works, an interactive preview of the four energy states, Nina's world, and the disclaimer and support footer.
- **Onboarding:** six screens, under 90 seconds. Nina's intro, how it works, what you want more of, starter rituals, privacy consent, and the first check-in.
- **Today:** greeting, Nina's daily note, the energy selector (High energy / Steady / Low battery / Rest), an optional intention, suggested rituals sized to your energy, "a little reminder", quick reflection shortcuts, and little moments this week.
- **Adaptive themes:** each state re-themes the whole UI. Rest switches to the Coastal Calm palette and replaces the checklist with an optional "one kind thing".
- **Rituals:** four pillars and 16 starter rituals, each with Full, Small and Tiny versions that all count equally. Also Nina's picks, a library, custom rituals, edit/archive/restore, and complete/undo.
- **Reflections:** written entries with optional prompts, in-browser voice notes (MediaRecorder, audio stored in IndexedDB), a **Get It Out** guided vent, **A Little Note to Me** (pinnable), search and filters, "little moments" with no streaks, and playback.
- **Settings:** export everything (JSON plus audio files), delete everything, reset demo, start fresh, About, Privacy, and Need more support (9-8-8).
- **No streaks, no guilt mechanics, no sentiment analysis, no analytics.** The user always picks their own energy state.

## Content

- Nina's copy lives in `src/content/nina.ts` and `src/content/rituals.ts`. It's shaped like a CMS feed so it can move to remote content later.
- The encouragement lines express a set of underlying insights in Nina's own voice. They are deliberately unlabeled in the UI: no frameworks, no acronyms.

## Architecture

| Area | Where |
|---|---|
| Build (esbuild + Tailwind v4) | `scripts/build.mjs` |
| Design tokens / state themes | `src/styles.css` |
| Persistence (IndexedDB + localStorage, swappable) | `src/lib/db.ts` |
| App state + actions | `src/lib/store.tsx` |
| Hash router (works on any static host) | `src/lib/router.tsx` |
| Voice recording + placeholder audio | `src/lib/audio.ts` |
| Demo seed (21 days) | `src/data/demoSeed.ts` |
| Screens | `src/features/*` |
