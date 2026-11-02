import { useState } from 'react';
import { useApp } from '../../lib/store';
import { navigate, Link } from '../../lib/router';
import { Button, cx } from '../../components/ui';
import { Arrow, Check, StateIcon, Mic, Pen, Wind } from '../../components/Icons';
import { DAILY_NOTES, REMINDERS, STATE_META } from '../../content/nina';
import { PhoneStage } from './PhoneStage';
import type { EnergyState } from '../../types';

// A taped photo-booth print, the scrapbook language used across the brand
function Polaroid({ src, alt, caption, tape = '#FF9EC4', className }: { src: string; alt: string; caption: string; tape?: string; className?: string }) {
  return (
    <figure className={cx('relative bg-white p-3 pb-0 shadow-[0_30px_60px_-30px_rgba(42,30,44,.55),0_2px_6px_rgba(42,30,44,.08)]', className)}>
      <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 rounded-[2px] opacity-80" style={{ background: tape }} />
      <img src={src} alt={alt} className="aspect-[4/5] w-full object-cover" />
      <figcaption className="py-3 text-center font-hand text-[26px] leading-none text-pink-deep">{caption}</figcaption>
    </figure>
  );
}

const PREVIEW: Record<EnergyState, { note: string; rituals: [string, string][]; extra?: string }> = {
  high: { note: DAILY_NOTES.high[2], rituals: [['Get outside', '30-minute walk'], ['Move your body', '30-minute session'], ['Connect with someone', 'Have a real conversation']] },
  steady: { note: DAILY_NOTES.steady[2], rituals: [['Hydration moment', 'Have a full glass of water'], ['Get outside', '10-minute walk']] },
  low: { note: DAILY_NOTES.low[3], rituals: [['Get outside', 'Step outside']] },
  rest: { note: DAILY_NOTES.rest[0], rituals: [], extra: 'One kind thing, if you feel like it' },
};

function MiniToday({ state }: { state: EnergyState }) {
  const p = PREVIEW[state];
  return (
    <div data-mood={state} className="mood-surface relative mx-auto h-[540px] w-[280px] overflow-hidden rounded-[42px] border-[8px] border-[#0A0A0C] bg-bg text-ink shadow-[0_0_0_3px_#CFC3C8,0_30px_60px_-25px_rgba(42,30,44,.5)]">
      <div className="absolute -top-10 -right-10 size-44 rounded-full bg-glow opacity-90 blur-2xl" />
      <div className="absolute top-32 -left-14 size-36 rounded-full bg-glow-2 opacity-80 blur-2xl" />
      <div className="relative px-5 pt-9">
        <p className="text-[10px] font-medium tracking-[0.14em] text-muted uppercase">Saturday, November 1</p>
        <p className="mt-1 font-serif text-[24px] leading-tight">Okay, how are we actually doing?</p>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {(['high', 'steady', 'low', 'rest'] as EnergyState[]).map((s) => (
            <div key={s} className={cx('flex flex-col items-center gap-1 rounded-[10px] border py-1.5 text-[8px] font-medium', s === state ? 'border-transparent bg-accent text-accent-ink' : 'border-line bg-surface')}>
              <StateIcon state={s} size={13} />
              {STATE_META[s].short}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-[14px] border border-line bg-surface p-3">
          <p className="text-[11px] leading-snug">{p.note}</p>
          <p className="mt-1 text-right font-hand text-[15px] text-accent-text">— Nina</p>
        </div>
        <p className="mt-3 text-[9px] font-semibold tracking-[0.14em] text-muted uppercase">{state === 'rest' ? 'Today' : 'For today'}</p>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {p.rituals.map(([n, s], i) => (
            <div key={n} className={cx('flex items-center gap-2 rounded-[12px] border p-2', i === 0 && state !== 'low' ? 'border-transparent bg-soft/80' : 'border-line bg-surface')}>
              <span className={cx('grid size-5 place-items-center rounded-full border', i === 0 && state !== 'low' ? 'border-accent bg-accent text-accent-ink' : 'border-line text-transparent')}><Check size={11} /></span>
              <span><span className="block text-[10px] font-medium">{n}</span><span className="block text-[9px] text-muted">{s}</span></span>
            </div>
          ))}
          {p.extra && (
            <div className="rounded-[12px] border border-dashed border-line bg-surface/60 p-3 text-center">
              <p className="font-serif text-[15px]">{p.extra}</p>
              <p className="mt-1 text-[9px] text-muted">A long shower · An early night · Lie on the floor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const { prefs } = useApp();
  const [preview, setPreview] = useState<EnergyState>('high');
  const enter = () => navigate(prefs.onboarded ? '/today' : '/welcome');

  return (
    <div data-mood="high" className="min-h-dvh bg-oat text-espresso">
      {/* header */}
      <header className="safe-top sticky top-0 z-30 bg-oat/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#/" className="font-serif text-[22px] italic" aria-label="My Friend Nina home">my friend <span className="text-pink">nina</span></a>
          <nav className="flex items-center gap-1 text-[14px]">
            <a href="#how" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }} className="hidden rounded-full px-3 py-2 hover:bg-blush sm:block">How it works</a>
            <a href="#nina" onClick={(e) => { e.preventDefault(); document.getElementById('nina')?.scrollIntoView({ behavior: 'smooth' }); }} className="hidden rounded-full px-3 py-2 hover:bg-blush sm:block">About Nina</a>
            <button onClick={enter} className="ml-1 min-h-11 rounded-full bg-espresso px-5 font-semibold text-white shadow-[0_8px_18px_-10px_rgba(42,30,44,.7)] hover:bg-black">Open the app</button>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="anim-drift absolute -top-32 right-[-10%] size-[460px] rounded-full bg-blush opacity-80 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pt-6 pb-16 md:grid-cols-[1.1fr_.9fr] md:pt-14 md:pb-24">
          <div className="anim-rise">
            <p className="text-[12px] font-medium tracking-[0.18em] text-[#6E5F6C] uppercase">A daily companion · Vancouver</p>
            <h1 className="mt-4 font-serif text-[48px] leading-[1.02] sm:text-[64px] md:text-[78px]">
              Hey. Let’s make today a little more <em className="text-pink">yours.</em>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[#5E4F5C]">
              A little space to check in, find your rhythm, and take care of yourself. Whatever kind of day you’re having.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button onClick={enter} className="group inline-flex min-h-[60px] items-center gap-3 rounded-full bg-pink py-2 pr-2 pl-8 text-[17px] font-semibold text-white shadow-[0_18px_36px_-14px_rgba(230,0,92,.75)] transition hover:-translate-y-0.5 hover:bg-pink-deep active:translate-y-0">
                Come on in
                <span className="grid size-11 place-items-center rounded-full bg-white text-pink transition group-hover:translate-x-0.5"><Arrow size={18} /></span>
              </button>
              <a href="#nina" onClick={(e) => { e.preventDefault(); document.getElementById('nina')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex min-h-11 items-center text-[16px] font-medium text-espresso underline decoration-pink decoration-2 underline-offset-[6px] hover:text-pink-deep">Meet Nina first</a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[420px]">
            <Polaroid src="images/seawall.jpg" alt="Nina laughing mid-run on the Vancouver seawall on a sunny day" caption="meet yourself where you are" className="rotate-[2deg]" />
            <div className="absolute -top-6 -right-4 grid size-24 rotate-12 place-items-center rounded-full bg-pink text-center text-[12px] leading-tight font-semibold tracking-wide text-white uppercase shadow-lg">small<br />counts<br />fully</div>
          </div>
        </div>
      </section>

      {/* live prototype in a staged iPhone */}
      <section id="try" className="relative overflow-hidden bg-blush/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-[#6E5F6C] uppercase">Try it right here</p>
            <h2 className="mt-3 font-serif text-[40px] leading-tight sm:text-[52px]">See how it fits into your day.</h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[#5E4F5C]">It starts like a normal day on your phone. A nudge from Nina pops up; tap it and you land right where it points. From there it’s the real prototype: check in, watch the whole app shift with your energy, finish a tiny ritual, or talk something out.</p>
            <ul className="mt-6 space-y-2 text-[15px] text-[#5E4F5C]">
              <li>• Nina asks before she sends anything, in her own words first.</li>
              <li>• Swipe up (tap the bar at the bottom) to go back to the home screen.</li>
              <li>• Everything stays in this browser. Nothing is sent anywhere.</li>
            </ul>
          </div>
          <PhoneStage />
        </div>
      </section>

      {/* philosophy */}
      <section className="bg-studio">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div className="relative mx-auto w-full max-w-[380px]">
            <Polaroid src="images/kayak.jpg" alt="Nina kayaking with a group of friends on a calm inlet" caption="the whole crew" tape="#FFC7A8" className="-rotate-2" />
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-[#6E5F6C] uppercase">The whole idea</p>
            <ol className="mt-6 space-y-8">
              {[
                ['Meet yourself where you are.', "Some days you’re ready to take on the world. Some days getting through it is plenty. Both are allowed here."],
                ['Small things count.', 'A ten-minute walk and a glass of water are real wins. Tiny counts exactly the same as full.'],
                ["There’s no one right way to show up.", 'No streaks to break, no red X’s, no guilt trips. Just you, checking in.'],
              ].map(([h, b], i) => (
                <li key={h} className="flex gap-5">
                  <span className="font-serif text-[40px] leading-none text-pink">{i + 1}</span>
                  <div>
                    <h2 className="font-serif text-[30px] leading-tight sm:text-[36px]">{h}</h2>
                    <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-[#5E4F5C]">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-[12px] font-medium tracking-[0.18em] text-[#6E5F6C] uppercase">How it works</p>
        <h2 className="mt-3 max-w-2xl font-serif text-[40px] leading-tight sm:text-[52px]">Thirty seconds on a busy day. Longer if you feel like it.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: '01', t: 'Check in', b: 'Tell it how you’re showing up: high energy, steady, low battery or rest. One tap.', icon: <StateIcon state="low" /> },
            { n: '02', t: 'Find your rhythm', b: 'The whole app shifts to match. Fewer asks on low days. A full exhale on rest days.', icon: <Wind /> },
            { n: '03', t: 'Pick your rituals', b: 'Every ritual comes in Full, Small or Tiny. They all count the same. Obviously.', icon: <Check /> },
            { n: '04', t: 'Reflect when you want', b: 'Talk it out or type it, whichever’s easier today. Saved on your phone, not ours.', icon: <Mic /> },
          ].map((s) => (
            <div key={s.n} className="rounded-[24px] border border-[#F2DDE5] bg-studio p-6">
              <div className="flex items-center justify-between text-pink">{s.icon}<span className="font-serif text-[18px] text-[#D3B4C3]">{s.n}</span></div>
              <h3 className="mt-8 font-serif text-[26px]">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5E4F5C]">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* little reminders: the mindset ideas, in Nina's words */}
      <section className="bg-studio">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="text-[12px] font-medium tracking-[0.18em] text-[#6E5F6C] uppercase">Little reminders from Nina</p>
              <h2 className="mt-3 font-serif text-[40px] leading-tight sm:text-[52px]">The pep talk you’d get from a good friend.</h2>
            </div>
            <p className="max-w-md text-[16px] leading-relaxed text-[#5E4F5C] md:justify-self-end">Small mindset shifts, woven through the app: one shows up on Today to match your energy, and they’re all in Reflections whenever you want one.</p>
          </div>
          <div className="no-scrollbar -mx-5 mt-10 flex snap-x gap-5 overflow-x-auto px-5 pt-4 pb-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {REMINDERS.slice(0, 4).map((r, i) => (
              <article key={r.theme} className={cx('postit flex min-h-[260px] w-[260px] shrink-0 snap-start flex-col justify-between p-6 lg:w-auto', i % 2 ? 'rotate-[1.5deg] lg:translate-y-6' : '-rotate-[1.5deg]')} style={{ backgroundColor: r.tint, color: r.ink }}>
                <h3 className="font-serif text-[28px] leading-[1.1]">{r.title}</h3>
                <div>
                  <p className="text-[15px] leading-relaxed opacity-90">{r.body}</p>
                  <p className="mt-3 text-right font-hand text-[22px]">— Nina</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* adaptive */}
      <section className="bg-espresso text-oat">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-[#DCC4D0] uppercase">It changes with you</p>
            <h2 className="mt-3 font-serif text-[40px] leading-tight sm:text-[52px]">Four kinds of days. <em className="text-[#F7A8C6]">Zero</em> wrong answers.</h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[#EBDBE3]">You pick your energy. The colours, the suggestions and Nina’s note all shift to match. Rest isn’t a pause button; it’s its own calm, complete little world.</p>
            <div role="tablist" aria-label="Preview an energy state" className="mt-8 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
              {(['high', 'steady', 'low', 'rest'] as EnergyState[]).map((s) => (
                <button key={s} role="tab" aria-selected={preview === s} onClick={() => setPreview(s)} className={cx('flex min-h-12 items-center justify-center gap-2 rounded-[14px] border px-3 text-[14px] font-medium transition', preview === s ? 'border-oat bg-oat text-espresso' : 'border-[#5C4659] text-oat hover:border-oat')}>
                  <StateIcon state={s} size={18} />{STATE_META[s].short}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[14px] text-[#DCC4D0]">{STATE_META[preview].feel} · {STATE_META[preview].sizeHint}</p>
          </div>
          <div role="tabpanel" aria-label={`${STATE_META[preview].label} preview`}>
            <MiniToday state={preview} />
          </div>
        </div>
      </section>

      {/* Nina's world */}
      <section id="nina" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="relative mx-auto grid w-full max-w-[520px] grid-cols-2 gap-x-4 gap-y-6 px-2 pt-4">
            <Polaroid src="images/blazer.jpg" alt="Nina smiling in a grey blazer and tall boots on a sunny street" caption="big day energy" className="-rotate-3" />
            <Polaroid src="images/ski.jpg" alt="Nina smiling on a snowy mountain in ski gear" caption="snow day" tape="#C6B3F7" className="mt-8 rotate-2" />
            <Polaroid src="images/cycling.jpg" alt="Nina cycling on a morning ride" caption="morning spin" tape="#9CC2FF" className="col-span-2 mx-auto -mt-2 w-[55%] rotate-1" />
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.18em] text-[#6E5F6C] uppercase">Your friend, Nina</p>
            <h2 className="mt-3 font-serif text-[40px] leading-tight sm:text-[52px]">Not a coach. Not a guru. Just a friend who gets it.</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-[#5E4F5C]">Nina is a Vancouver lifestyle creator who spends her days somewhere between a mountain summit, a seawall run and a very honest chat from the driver’s seat. This app is her energy in your pocket: practical, funny, and totally fine with you having a couch day.</p>
            <p className="mt-6 font-hand text-[30px] text-pink-deep">see you in there — Nina</p>
            <p className="mt-6 inline-block rounded-full bg-blush px-3 py-1 text-[12px] text-[#6E3A4E]">Prototype · Nina’s copy is a draft until she signs off</p>
          </div>
        </div>
      </section>

      {/* closing */}
      <section className="relative overflow-hidden bg-pink text-white">
        <div className="absolute -bottom-24 -left-20 size-80 rounded-full bg-[#FF4D8D] opacity-60 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="font-serif text-[46px] leading-tight sm:text-[64px]">Okay, let’s start with today.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={enter} className="group inline-flex min-h-[60px] items-center gap-3 rounded-full bg-white py-2 pr-2 pl-8 text-[17px] font-semibold text-pink-deep shadow-[0_18px_36px_-14px_rgba(42,30,44,.55)] transition hover:-translate-y-0.5">Come on in <span className="grid size-11 place-items-center rounded-full bg-pink text-white"><Arrow size={18} /></span></button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-oat">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-[14px] text-[#5E4F5C] md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-[22px] italic text-espresso">my friend <span className="text-pink">nina</span></p>
            <p className="mt-2 max-w-sm">Nina is here as a friend: real encouragement for everyday life, not professional care. Nothing here replaces medical or mental-health advice. Everything you save stays on your device.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            <Link to="/about" className="hover:text-espresso">About</Link>
            <Link to="/privacy" className="hover:text-espresso">Privacy</Link>
            <Link to="/support" className="hover:text-espresso">Need more support?</Link>
            <Link to="/about" className="hover:text-espresso">Disclaimer</Link>
          </nav>
        </div>
        <p className="border-t border-[#F2DDE5] py-4 text-center text-[12px] text-[#6E5F6C]">Interactive prototype · Not a public product yet · Photos are placeholders pending Nina’s approved assets</p>
      </footer>
    </div>
  );
}
