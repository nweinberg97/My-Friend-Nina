import { useState } from 'react';
import { useApp } from '../../lib/store';
import { navigate, Link } from '../../lib/router';
import { cx, STATE_COLOR } from '../../components/ui';
import { Check, StateIcon, Mic, Wind, Heart, Sparkle, Moon } from '../../components/Icons';
import { DAILY_NOTES, STATE_META } from '../../content/nina';
import type { EnergyState } from '../../types';

const PREVIEW: Record<EnergyState, { note: string; photo: string; cap: string; rituals: [string, string, string][]; extra?: boolean }> = {
  high: { note: DAILY_NOTES.high[2], photo: 'images/beach-pink.jpg', cap: 'big day!', rituals: [['Move', 'Get outside', '30-minute walk'], ['Connect', 'Connect with someone', 'Have a real conversation'], ['Nourish', 'Make something nourishing', 'Cook a proper meal']] },
  steady: { note: DAILY_NOTES.steady[3], photo: 'images/seawall.jpg', cap: 'easy does it', rituals: [['Nourish', 'Hydration moment', 'Have a full glass of water'], ['Move', 'Get outside', '10-minute walk']] },
  low: { note: DAILY_NOTES.low[3], photo: 'images/chairlift.jpg', cap: 'slow & sweet', rituals: [['Move', 'Get outside', 'Step outside']] },
  rest: { note: DAILY_NOTES.rest[0], photo: 'images/overlook.jpg', cap: 'just breathe', rituals: [], extra: true },
};
const PILL: Record<string, string> = { Move: '#E6005C', Nourish: '#F05A1A', Connect: '#2F6FD6' };

function MiniToday({ state }: { state: EnergyState }) {
  const p = PREVIEW[state];
  return (
    <div data-mood={state} className="mood-surface relative mx-auto h-[560px] w-[290px] overflow-hidden rounded-[44px] border-[9px] border-[#1d1420] bg-bg text-ink shadow-[0_40px_70px_-30px_rgba(0,0,0,.6)]">
      <div className="absolute -top-12 -right-10 size-44 rounded-full bg-accent-3 opacity-40 blur-2xl" />
      <div className="relative px-4 pt-8">
        <p className="text-[10px] font-medium text-muted">Saturday, November 1</p>
        <p className="font-serif text-[22px] leading-[1.05]">Okay, how are we actually doing?</p>
        <div className="sky relative mt-3 overflow-hidden rounded-[20px] p-3.5 pb-4">
          <div className="polaroid absolute top-2.5 right-2.5 w-[58px] rotate-[6deg]" style={{ padding: '4px 4px 16px' }}>
            <img src={p.photo} alt="" className="aspect-[4/5] w-full rounded-[2px] object-cover" />
            <span className="absolute inset-x-0 bottom-0.5 text-center font-hand text-[10px] text-[#2A1A2E]">{p.cap}</span>
          </div>
          <p className="text-[9px] font-semibold text-white/85">A note from Nina</p>
          <p className="mt-7 font-serif text-[14px] leading-[1.2] text-white">{p.note}</p>
          <p className="mt-1 font-hand text-[15px] text-white">love, Nina</p>
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-1">
          {(['high', 'steady', 'low', 'rest'] as EnergyState[]).map((s) => (
            <div key={s} className="flex flex-col items-center gap-0.5 rounded-[10px] py-1.5 text-[8px] font-semibold" style={s === state ? { background: STATE_COLOR[s].solid, color: '#fff' } : { background: STATE_COLOR[s].tint }}>
              <StateIcon state={s} size={12} />{STATE_META[s].short}
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {p.rituals.map(([pillar, n, s], i) => (
            <div key={n} className="flex items-center gap-2 rounded-[12px] bg-surface p-2 shadow-[0_6px_14px_-12px_rgba(0,0,0,.5)]">
              <span className="grid size-6 place-items-center rounded-[8px] text-white" style={{ background: PILL[pillar] }}>{i === 0 ? <Check size={12} /> : <Sparkle size={11} />}</span>
              <span><span className="block text-[10px] font-semibold">{n}</span><span className="block text-[9px] text-muted">{s}</span></span>
            </div>
          ))}
          {p.extra && (
            <div className="rounded-[14px] bg-soft p-3 text-center">
              <Moon size={16} className="mx-auto text-accent" />
              <p className="mt-1 font-serif text-[13px]">No checklist today.</p>
              <p className="text-[9px] text-muted">One kind thing, if you feel like it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const RIBBON = ['meet yourself where you are', 'small counts fully', 'rest is part of the rhythm', 'no streaks, no guilt', 'tiny is not a consolation prize', 'you set the bar'];

export function Landing() {
  const { prefs, loadDemo } = useApp();
  const [preview, setPreview] = useState<EnergyState>('high');
  const enter = () => navigate(prefs.onboarded ? '/today' : '/welcome');
  const demo = async () => { await loadDemo(); navigate('/today'); };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div data-mood="high" className="min-h-dvh overflow-x-hidden bg-[#FFF6FA] text-plum">
      <header className="safe-top sticky top-0 z-30 bg-[#FFF6FA]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#/" className="font-serif text-[22px] font-extrabold tracking-tight" aria-label="My Friend Nina home">my friend <span className="font-hand text-[28px] font-bold text-pink">nina</span></a>
          <nav className="flex items-center gap-1 text-[14px] font-medium">
            <a href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how'); }} className="hidden rounded-full px-3 py-2 hover:bg-bubblegum sm:block">How it works</a>
            <a href="#nina" onClick={(e) => { e.preventDefault(); scrollTo('nina'); }} className="hidden rounded-full px-3 py-2 hover:bg-bubblegum sm:block">About Nina</a>
            <button onClick={enter} className="ml-1 min-h-11 rounded-full bg-pink px-5 font-semibold text-white shadow-[0_8px_18px_-10px_#E6005C] hover:bg-pink-deep">Open the app</button>
          </nav>
        </div>
      </header>

      {/* hero: Nina's photos are the memorable thing */}
      <section className="relative">
        <div aria-hidden="true" className="anim-drift absolute -top-24 right-[-8%] size-[420px] rounded-full bg-sunshine opacity-45 blur-3xl" />
        <div aria-hidden="true" className="anim-drift absolute top-[40%] left-[-12%] size-[360px] rounded-full bg-[#FF8FB8] opacity-40 blur-3xl" style={{ animationDelay: '-5s' }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-8 pb-20 md:grid-cols-[1.05fr_.95fr] md:pt-16 md:pb-28">
          <div className="anim-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-pink-deep shadow-sm"><Heart size={15} /> A daily companion from Vancouver</p>
            <h1 className="mt-5 font-serif text-[52px] leading-[.95] font-extrabold sm:text-[72px] md:text-[86px]">Hey. Let’s make today a little more yours.</h1>
            <p className="mt-6 max-w-md text-[18px] leading-relaxed text-[#5B4658]">A little space to check in, find your rhythm, and take care of yourself. Whatever kind of day you’re having.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={enter} className="min-h-14 rounded-[16px] bg-pink px-8 text-[17px] font-semibold text-white shadow-[0_14px_28px_-14px_#E6005C] transition hover:-translate-y-0.5 hover:bg-pink-deep">Come on in</button>
              <button onClick={() => scrollTo('nina')} className="min-h-14 rounded-[16px] bg-white px-8 text-[17px] font-semibold text-plum shadow-sm transition hover:-translate-y-0.5">Get to know us</button>
            </div>
            <button onClick={demo} className="mt-5 text-[15px] font-medium text-[#6B5866] underline decoration-pink/50 decoration-2 underline-offset-4 hover:text-plum">Or look around with three weeks of sample data</button>
          </div>

          <div className="relative mx-auto h-[460px] w-full max-w-[440px] sm:h-[520px]">
            <figure className="polaroid absolute top-0 left-[4%] w-[58%] rotate-[-7deg]">
              <img src="images/chairlift.jpg" alt="Nina on a chairlift above the North Shore mountains, eyes closed, smiling" className="aspect-[4/5] w-full rounded-[3px] object-cover" />
              <figcaption className="absolute inset-x-0 bottom-1 text-center font-hand text-[21px]">up we go</figcaption>
            </figure>
            <figure className="polaroid absolute top-[12%] right-0 w-[50%] rotate-[6deg]">
              <img src="images/beach-pink.jpg" alt="Nina in a hot pink swimsuit at a beach pop-up" className="aspect-[4/5] w-full rounded-[3px] object-cover" />
              <figcaption className="absolute inset-x-0 bottom-1 text-center font-hand text-[21px]">pink, always</figcaption>
            </figure>
            <figure className="polaroid absolute bottom-0 left-[22%] w-[52%] rotate-[-2deg]">
              <img src="images/seawall.jpg" alt="Nina laughing on the Vancouver seawall" className="aspect-[5/4] w-full rounded-[3px] object-cover" />
              <figcaption className="absolute inset-x-0 bottom-1 text-center font-hand text-[21px]">seawall days</figcaption>
            </figure>
            <div className="absolute top-[52%] -left-2 grid size-24 rotate-[-12deg] place-items-center rounded-full bg-sunshine text-center font-serif text-[15px] leading-[1.05] text-plum shadow-lg">small<br />counts<br />fully</div>
          </div>
        </div>
      </section>

      {/* ribbon */}
      <div className="relative -rotate-[1.2deg] bg-pink py-4 text-white shadow-[0_10px_30px_-18px_#E6005C]" aria-hidden="true">
        <div className="anim-marquee flex w-max gap-8 font-serif text-[22px] whitespace-nowrap">
          {[...RIBBON, ...RIBBON].map((t, i) => <span key={i} className="flex items-center gap-8">{t}<Sparkle size={18} /></span>)}
        </div>
      </div>

      {/* philosophy */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <h2 className="max-w-3xl font-serif text-[40px] leading-[1.02] font-extrabold sm:text-[56px]">Some days you’re ready to take on the world. Some days getting through it is plenty.</h2>
        <p className="mt-4 max-w-xl text-[17px] text-[#5B4658]">Both are allowed here. That’s kind of the whole point.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { h: 'Meet yourself where you are', b: 'You tell the app what kind of day it is. It changes to fit you, not the other way round.', bg: '#E6005C', fg: '#fff' },
            { h: 'Small counts fully', b: 'Every ritual comes in Full, Small or Tiny. A glass of water is a real win. Tiny counts the same.', bg: '#FFC93C', fg: '#2A1A2E' },
            { h: 'No guilt, ever', b: 'No streaks to break. No red X’s. No “you missed yesterday.” Rest days are part of the rhythm.', bg: '#2F6FD6', fg: '#fff' },
          ].map((c, i) => (
            <div key={c.h} className={cx('rounded-[28px] p-7 shadow-[0_20px_40px_-28px_rgba(42,26,46,.7)]', i === 1 ? 'md:translate-y-6' : '')} style={{ background: c.bg, color: c.fg }}>
              <h3 className="font-serif text-[28px] leading-tight">{c.h}</h3>
              <p className="mt-3 text-[16px] leading-relaxed opacity-90">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works: a real sequence, so it's numbered */}
      <section id="how" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-serif text-[40px] leading-tight font-extrabold sm:text-[52px]">Thirty seconds on a busy day.</h2>
          <p className="mt-2 text-[17px] text-[#5B4658]">Longer if you feel like it.</p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Check in', b: 'High energy, steady, low battery or rest. One tap.', c: '#E6005C', icon: <StateIcon state="high" size={22} /> },
              { t: 'Watch it change', b: 'Colours, suggestions and Nina’s note all shift to match your day.', c: '#2F6FD6', icon: <Sparkle size={22} /> },
              { t: 'Pick your rituals', b: 'Full, Small or Tiny. They all count the same. Obviously.', c: '#F05A1A', icon: <Check size={22} /> },
              { t: 'Reflect if you want', b: 'Voice notes, quick writes, or a “get it out” vent. Saved on your phone.', c: '#2F7D4F', icon: <Mic size={22} /> },
            ].map((s, i) => (
              <li key={s.t} className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-[16px] text-white" style={{ background: s.c }}>{s.icon}</span>
                  <span className="font-serif text-[44px] leading-none" style={{ color: s.c }}>{i + 1}</span>
                </div>
                <h3 className="mt-4 font-serif text-[26px]">{s.t}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-[#5B4658]">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* adaptive */}
      <section className="relative overflow-hidden bg-plum text-white">
        <div aria-hidden="true" className="absolute -right-24 -bottom-24 size-[420px] rounded-full opacity-40 blur-3xl transition-colors duration-700" style={{ background: STATE_COLOR[preview].solid }} />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-serif text-[42px] leading-[1.02] font-extrabold sm:text-[56px]">Four kinds of days. Zero wrong answers.</h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/80">Pick your energy and the whole app takes on its colour. Rest isn’t a pause button. It’s its own calm, complete little world.</p>
            <div role="tablist" aria-label="Preview an energy state" className="mt-8 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
              {(['high', 'steady', 'low', 'rest'] as EnergyState[]).map((s) => (
                <button key={s} role="tab" aria-selected={preview === s} onClick={() => setPreview(s)} className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-3 text-[14px] font-semibold transition" style={preview === s ? { background: STATE_COLOR[s].solid, color: '#fff' } : { background: 'rgba(255,255,255,.08)', color: '#fff' }}>
                  <StateIcon state={s} size={18} />{STATE_META[s].short}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[15px] text-white/70">{STATE_META[preview].feel}. {STATE_META[preview].sizeHint}.</p>
          </div>
          <div role="tabpanel" aria-label={`${STATE_META[preview].label} preview`}>
            <MiniToday state={preview} />
          </div>
        </div>
      </section>

      {/* Nina's world */}
      <section id="nina" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <div className="relative h-[420px]">
            <figure className="polaroid absolute top-0 left-0 w-[55%] rotate-[-5deg]">
              <img src="images/overlook.jpg" alt="Nina on a rocky lookout above the ocean and islands" className="aspect-[4/5] w-full rounded-[3px] object-cover" />
              <figcaption className="absolute inset-x-0 bottom-1 text-center font-hand text-[20px]">summit snacks</figcaption>
            </figure>
            <figure className="polaroid absolute right-0 bottom-0 w-[56%] rotate-[4deg]">
              <img src="images/cycling.jpg" alt="Nina on a morning bike ride" className="aspect-[4/3] w-full rounded-[3px] object-cover" />
              <figcaption className="absolute inset-x-0 bottom-1 text-center font-hand text-[20px]">morning ride</figcaption>
            </figure>
          </div>
          <div>
            <p className="font-hand text-[30px] text-pink">your friend, Nina</p>
            <h2 className="mt-1 font-serif text-[42px] leading-[1.02] font-extrabold sm:text-[54px]">Not a coach. Not a guru. Just a friend who gets it.</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-[#5B4658]">Nina is a Vancouver lifestyle creator who spends her days somewhere between a mountain summit, a seawall run and a very honest chat from the driver’s seat. This app is her energy in your pocket: practical, funny, and totally fine with you having a couch day.</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-bubblegum px-3 py-1.5 text-[13px] font-medium text-pink-deep"><Wind size={14} /> Prototype. Nina’s words are drafts until she signs off.</p>
          </div>
        </div>
      </section>

      {/* closing */}
      <section className="relative overflow-hidden bg-pink text-white">
        <div aria-hidden="true" className="anim-drift absolute -top-20 -left-16 size-80 rounded-full bg-sunshine opacity-50 blur-3xl" />
        <div aria-hidden="true" className="anim-drift absolute -right-16 -bottom-24 size-80 rounded-full bg-tangerine opacity-50 blur-3xl" style={{ animationDelay: '-7s' }} />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="font-serif text-[48px] leading-none font-extrabold sm:text-[72px]">Okay, let’s start with today.</h2>
          <p className="mt-3 font-hand text-[30px]">see you in there, Nina</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={enter} className="min-h-14 rounded-[16px] bg-white px-8 text-[17px] font-semibold text-pink-deep shadow-lg transition hover:-translate-y-0.5">Open My Friend Nina</button>
            <button onClick={demo} className="min-h-14 rounded-[16px] border-2 border-white/70 px-7 text-[17px] font-semibold transition hover:bg-white/10">Try it with sample data</button>
          </div>
        </div>
      </section>

      <footer className="bg-[#FFF6FA]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-[14px] text-[#5B4658] md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-[22px] font-extrabold text-plum">my friend <span className="font-hand text-[26px] font-bold text-pink">nina</span></p>
            <p className="mt-2 max-w-sm">Nina is a friend, not a professional. Nothing here is medical or mental-health advice. Everything you save stays on your device.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium" aria-label="Footer">
            <Link to="/about" className="hover:text-plum">About</Link>
            <Link to="/privacy" className="hover:text-plum">Privacy</Link>
            <Link to="/support" className="hover:text-plum">Need more support?</Link>
          </nav>
        </div>
        <p className="border-t border-[#F5DCE6] py-4 text-center text-[12px] text-[#6B5866]">Interactive prototype. Photos are placeholders until Nina approves her assets.</p>
      </footer>
    </div>
  );
}
