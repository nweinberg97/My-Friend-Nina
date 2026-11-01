import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../lib/store';
import { Link, navigate } from '../../lib/router';
import { Avatar, Blobs, Button, Card, EnergySelector, Eyebrow, NinaSig, Page, Waves, cx } from '../../components/ui';
import { RitualCard, RitualSheet, suggestedSize } from '../../components/RitualSheet';
import { MomentBubbles } from '../../components/Moments';
import { Check, Mic, Pen, Settings, Sparkle, Wind, Heart, X } from '../../components/Icons';
import { encouragementFor, EVENING_GREETINGS, GREETINGS, INTENTION_PROMPT, KIND_THINGS, noteFor, pick, RETURN_LINES, STATE_META } from '../../content/nina';
import { addDays, isEvening, prettyDate } from '../../lib/dates';
import type { EnergyState, Ritual } from '../../types';

const STATE_PHOTO: Record<EnergyState | 'none', string> = {
  high: 'images/beach-pink.jpg',
  steady: 'images/seawall.jpg',
  low: 'images/chairlift.jpg',
  rest: 'images/overlook.jpg',
  none: 'images/cycling.jpg',
};
const STATE_CAPTION: Record<EnergyState, string> = { high: 'big day!', steady: 'easy does it', low: 'slow & sweet', rest: 'just breathe' };

const COUNT: Record<EnergyState, number> = { high: 4, steady: 3, low: 1, rest: 0 };

function QuickTile({ Icon, label, bg, fg }: { Icon: (p: { size?: number }) => JSX.Element; label: string; bg: string; fg: string }) {
  return (
    <span className="flex min-h-[96px] flex-col items-start justify-between rounded-[20px] p-3.5 text-[15px] font-semibold" style={{ background: bg, color: fg }}>
      <span className="grid size-9 place-items-center rounded-full" style={{ background: fg === '#fff' ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.6)' }}><Icon size={19} /></span>
      {label}
    </span>
  );
}

export function Today() {
  const { today, checkin, mood, data, prefs, awayDays, setEnergy, setIntention, setKindThing, toast } = useApp();
  const [open, setOpen] = useState<Ritual | undefined>();
  const [intent, setIntent] = useState(checkin?.intention ?? '');
  const [editingIntent, setEditingIntent] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [dismissBack, setDismissBack] = useState(false);
  useEffect(() => setIntent(checkin?.intention ?? ''), [checkin?.intention, today]);

  const state = checkin?.state;
  const greeting = pick(isEvening() ? EVENING_GREETINGS : GREETINGS, today);
  const firstName = prefs.name ? `, ${prefs.name}` : '';

  const selected = data.rituals.filter((r) => r.selected && !r.archived);
  const suggestions = useMemo(() => {
    if (!state) return [];
    // rotate by date so suggestions feel fresh, keep done ones visible
    const offset = parseInt(today.slice(-2), 10) % Math.max(1, selected.length);
    const rotated = [...selected.slice(offset), ...selected.slice(0, offset)];
    return rotated;
  }, [state, selected, today]);
  const visibleCount = state ? (showMore ? Math.min(suggestions.length, COUNT[state] + 3) : COUNT[state]) : 0;
  const doneToday = data.completions.filter((c) => c.date === today);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const showReturn = awayDays >= 3 && !dismissBack && !state;

  const saveIntent = () => {
    setIntention(intent);
    setEditingIntent(false);
    if (intent.trim()) toast('Saved. Making a little room for it.');
  };

  const enc = state ? encouragementFor(state, today) : undefined;

  return (
    <Page>
      <Blobs />
      <div className="safe-top relative px-5">
        <div className="flex h-16 items-center justify-between">
          <span className="font-serif text-[21px] font-extrabold tracking-tight">my friend <span className="font-hand text-[26px] font-bold text-accent-text">nina</span></span>
          <Link to="/settings" className="grid size-11 place-items-center rounded-full text-muted hover:bg-soft/60" ariaLabel="Settings"><Settings size={21} /></Link>
        </div>

        <header className="anim-rise pt-2">
          <p className="text-[14px] font-medium text-muted">{prettyDate(today)}</p>
          <h1 className="mt-1 font-serif text-[36px] leading-[1.02]">{greeting.replace(/\?$/, firstName + '?').replace(/\.$/, firstName + '.')}</h1>
        </header>

        {showReturn && (
          <div className="anim-rise mt-5 flex items-start gap-3 rounded-[18px] bg-soft/80 p-4">
            <Avatar size={36} />
            <p className="flex-1 text-[15px] leading-relaxed">{pick(RETURN_LINES, today)}</p>
            <button onClick={() => setDismissBack(true)} aria-label="Dismiss" className="grid size-9 place-items-center rounded-full text-muted"><X size={18} /></button>
          </div>
        )}

        {/* Nina's note: the "sky card", wearing today's colour personality */}
        <section aria-label="Nina's note for today" className="sky anim-rise relative mt-7 overflow-hidden rounded-[28px] p-5 pb-6 shadow-[0_24px_44px_-26px_var(--accent)]" style={{ animationDelay: '60ms' }}>
          <div aria-hidden="true" className="anim-drift absolute -right-10 -bottom-16 size-48 rounded-full bg-white/10" />
          <div className="polaroid relative float-right -mt-1 -mr-1 mb-2 ml-3 w-[96px] rotate-[6deg]">
            <img src={STATE_PHOTO[state ?? 'none']} alt="" className="aspect-[4/5] w-full rounded-[3px] object-cover" />
            <span className="absolute inset-x-0 bottom-1 text-center font-hand text-[16px] leading-none text-[#2A1A2E]">{state ? STATE_CAPTION[state] : 'hi you'}</span>
          </div>
          <p className="relative text-[14px] font-semibold text-white/85">A note from Nina</p>
          <p className="relative text-[13px] text-white/75">{state ? `for a ${STATE_META[state].label.toLowerCase()} day` : 'for whatever today is'}</p>
          <p className="relative mt-4 font-serif text-[24px] leading-[1.18] font-bold text-white">
            {state ? noteFor(state, today) : "Before anything else: how are you, really? Pick whatever's true. I'll meet you there."}
          </p>
          <p className="relative clear-both pt-2 font-hand text-[26px] leading-none text-white/95">love, Nina</p>
          {mood === 'rest' && state && <Waves className="absolute inset-x-0 bottom-0 h-8 text-white opacity-30" />}
        </section>

        {/* Check-in */}
        <section aria-labelledby="checkin-h" className="anim-rise mt-8" style={{ animationDelay: '120ms' }}>
          <div className="flex items-baseline justify-between">
            <h2 id="checkin-h" className="font-serif text-[24px]">{state ? 'Today I’m feeling…' : 'How are we showing up?'}</h2>
            {state && <span className="text-[13px] text-muted">change anytime</span>}
          </div>
          <div className="mt-3">
            <EnergySelector value={state} onChange={(s) => { setEnergy(s); setShowMore(false); }} compact={!!state} />
          </div>
          {state && <p className="mt-2 text-[13px] text-muted" aria-live="polite">{STATE_META[state].feel}. {STATE_META[state].sizeHint}.</p>}
        </section>

        {state && (
          <>
            {/* Intention */}
            {state !== 'rest' && (
              <section aria-label="Today's intention" className="mt-8">
                {checkin?.intention && !editingIntent ? (
                  <button onClick={() => setEditingIntent(true)} className="group flex w-full items-start gap-3 rounded-[18px] border border-dashed border-line px-4 py-3 text-left hover:border-accent">
                    <Sparkle size={18} className="mt-1 shrink-0 text-accent-text" />
                    <span className="flex-1"><span className="block text-[12px] text-muted">Making room for</span><span className="font-hand text-[24px] leading-tight">{checkin.intention}</span></span>
                    <span className="text-[13px] text-muted group-hover:text-ink">Edit</span>
                  </button>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); saveIntent(); }} className="rounded-[18px] border border-line bg-surface p-4">
                    <label htmlFor="intent" className="text-[15px] font-medium">{INTENTION_PROMPT}</label>
                    <p className="text-[13px] text-muted">Optional. No pressure.</p>
                    <input id="intent" value={intent} maxLength={80} onChange={(e) => setIntent(e.target.value)} placeholder="e.g. a walk after work" className="mt-3 w-full rounded-[12px] border border-line bg-bg px-3.5 py-3 text-[16px] outline-none focus:border-accent" />
                    <div className="mt-3 flex justify-end gap-2">
                      {checkin?.intention && <Button type="button" variant="ghost" onClick={() => { setIntent(''); setIntention(''); setEditingIntent(false); }} className="min-h-10">Clear</Button>}
                      <Button type="submit" variant="soft" className="min-h-10" disabled={!intent.trim() && !checkin?.intention}>Save</Button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {/* Rituals or Rest */}
            {state === 'rest' ? (
              <section aria-labelledby="kind-h" className="anim-rise mt-8 overflow-hidden rounded-[24px] bg-soft/80 p-5">
                <Eyebrow>Rest mode</Eyebrow>
                <h2 id="kind-h" className="mt-1 font-serif text-[28px] leading-tight">No checklist today.</h2>
                <p className="mt-1 text-[15px] text-muted">If you feel like it, one kind thing. If not, that’s the whole plan.</p>
                <div className="mt-4 flex flex-col gap-2">
                  {KIND_THINGS.slice(0, 4).map((k) => {
                    const on = checkin?.kindThing === k;
                    return (
                      <button key={k} aria-pressed={on} onClick={() => { setKindThing(on ? undefined : k); if (!on) toast('Love that. Enjoy it.'); }} className={cx('flex min-h-12 items-center gap-3 rounded-[14px] px-4 text-left text-[15px] transition', on ? 'bg-accent text-accent-ink' : 'bg-surface hover:brightness-[.98]')}>
                        <Heart size={18} className={on ? '' : 'text-accent-text'} />{k}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-[13px] text-muted">Your rituals are still in the Rituals tab if you want them. Nothing’s locked.</p>
              </section>
            ) : (
              <section aria-labelledby="rit-h" className="mt-8">
                <div className="flex items-baseline justify-between">
                  <h2 id="rit-h" className="font-serif text-[24px]">{state === 'low' ? 'Just one little thing' : 'A few for today'}</h2>
                  <Link to="/rituals" className="text-[14px] text-accent-text">All rituals</Link>
                </div>
                {selected.length === 0 ? (
                  <Card className="mt-3 p-5 text-center">
                    <p className="font-serif text-[20px]">Nothing picked yet? No problem.</p>
                    <p className="mt-1 text-[14px] text-muted">Let’s find a few little things that feel good to have around.</p>
                    <Button variant="soft" className="mt-4" onClick={() => navigate('/rituals')}>Choose some rituals</Button>
                  </Card>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    {suggestions.slice(0, visibleCount).map((r, i) => (
                      <div key={r.id} className="anim-rise" style={{ animationDelay: `${i * 50}ms` }}>
                        <RitualCard ritual={r} size={suggestedSize(state)} onOpen={() => setOpen(r)} highlight={state === 'low'} />
                      </div>
                    ))}
                    {suggestions.length > visibleCount && (
                      <button onClick={() => setShowMore(true)} className="min-h-11 rounded-[14px] text-[14px] text-muted hover:text-ink">{state === 'low' ? 'Feeling up for another? Show a couple more' : 'Show a few more'}</button>
                    )}
                  </div>
                )}
                {doneToday.length > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-[14px] text-accent-text"><Check size={16} /> {doneToday.length} thing{doneToday.length > 1 ? 's' : ''} for you today. That counts.</p>
                )}
              </section>
            )}

            {/* Encouragement: a sticky note from Nina */}
            {enc && (
              <section aria-label="A little reminder" className="relative mt-9 rotate-[-1.2deg] rounded-[6px] bg-butter p-5 pt-6 text-[#3A2A12] shadow-[0_18px_30px_-20px_rgba(120,80,0,.55)]">
                <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[2deg] rounded-[3px] bg-white/70" />
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#8A5A00]"><Sparkle size={14} /> A little reminder</p>
                <p className="mt-1 font-hand text-[27px] leading-[1.15]">{enc.body}</p>
              </section>
            )}

            {/* Quick reflection */}
            <section aria-labelledby="ref-h" className="mt-9">
              <h2 id="ref-h" className="font-serif text-[24px]">Anything on your mind?</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { to: '/reflections/new/voice', label: 'Voice note', Icon: Mic, bg: '#E6005C', fg: '#fff' },
                  { to: '/reflections/new/write', label: 'Write', Icon: Pen, bg: '#FFC93C', fg: '#3A2A12' },
                  { to: '/reflections/new/get-it-out', label: 'Get it out', Icon: Wind, bg: '#2F6FD6', fg: '#fff' },
                ].map(({ to, label, Icon, bg, fg }) => (
                  <Link key={to} to={to} className="block rounded-[20px] transition hover:-translate-y-0.5 active:scale-[.97]">
                    <QuickTile Icon={Icon} label={label} bg={bg} fg={fg} />
                  </Link>
                ))}
              </div>
            </section>

            {/* gentle week */}
            {prefs.littleMoments && (
              <section aria-labelledby="week-h" className="mt-9 mb-4 rounded-[24px] bg-surface p-4 shadow-[0_14px_30px_-24px_rgba(42,26,46,.5)]">
                <div className="flex items-baseline justify-between">
                  <h2 id="week-h" className="font-serif text-[20px]">Your week, in little moments</h2>
                </div>
                <div className="mt-3"><MomentBubbles days={7} showLabels /></div>
                <p className="mt-3 text-[13px] text-muted">No streaks. Rest days get a little moon.</p>
              </section>
            )}
          </>
        )}
      </div>
      <RitualSheet ritual={open} open={!!open} onClose={() => setOpen(undefined)} />
    </Page>
  );
}
