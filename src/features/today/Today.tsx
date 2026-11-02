import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../lib/store';
import { Link, navigate } from '../../lib/router';
import { Avatar, Blobs, Button, Card, EnergySelector, Eyebrow, NinaSig, Page, SiteLink, Waves, cx } from '../../components/ui';
import { RitualCard, RitualSheet, suggestedSize } from '../../components/RitualSheet';
import { Check, Mic, Pen, Settings, Sparkle, Wind, Heart, X } from '../../components/Icons';
import { encouragementFor, EVENING_GREETINGS, GREETINGS, INTENTION_PROMPT, KIND_THINGS, noteFor, pick, RETURN_LINES, STATE_META } from '../../content/nina';
import { addDays, isEvening, prettyDate } from '../../lib/dates';
import type { EnergyState, Ritual } from '../../types';

const COUNT: Record<EnergyState, number> = { high: 4, steady: 3, low: 1, rest: 0 };

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
          <span className="flex items-center gap-2 font-serif text-[20px] italic"><img src="nina-n.svg" alt="" className="size-8 rounded-[9px]" />my friend <span className="text-accent-text">nina</span></span>
          <span className="flex items-center gap-1">
            <SiteLink />
            <Link to="/settings" className="grid size-11 place-items-center rounded-full text-muted hover:bg-soft/60" ariaLabel="Settings"><Settings size={21} /></Link>
          </span>
        </div>

        <header className="anim-rise pt-2">
          <Eyebrow>{prettyDate(today)}</Eyebrow>
          <h1 className="mt-2 font-serif text-[38px] leading-[1.05]">{greeting.replace(/\?$/, firstName + '?').replace(/\.$/, firstName + '.')}</h1>
        </header>

        {showReturn && (
          <div className="anim-rise mt-5 flex items-start gap-3 rounded-[18px] bg-soft/80 p-4">
            <Avatar size={36} />
            <p className="flex-1 text-[15px] leading-relaxed">{pick(RETURN_LINES, today)}</p>
            <button onClick={() => setDismissBack(true)} aria-label="Dismiss" className="grid size-9 place-items-center rounded-full text-muted"><X size={18} /></button>
          </div>
        )}

        {/* Nina's note */}
        <section aria-label="Nina's note for today" className="paper anim-rise relative mt-6 overflow-hidden rounded-[22px] border border-line bg-surface p-5" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-3">
            <Avatar size={38} />
            <div>
              <p className="text-[14px] font-medium">A note from Nina</p>
              <p className="text-[12px] text-muted">{state ? `for a ${STATE_META[state].label.toLowerCase()} day` : 'for whatever today is'}</p>
            </div>
          </div>
          <p className="mt-4 font-serif text-[22px] leading-snug">
            {state ? noteFor(state, today) : "Before anything else: how are you, really? Pick whatever's true. I'll meet you there."}
          </p>
          <div className="mt-2 text-right"><NinaSig /></div>
          {mood === 'rest' && state && <Waves className="absolute inset-x-0 bottom-0 h-8 text-accent opacity-20" />}
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
          {state && <p className="mt-2 text-[13px] text-muted" aria-live="polite">{STATE_META[state].feel}. {STATE_META[state].sizeHint.replace(/\.$/, "")}.</p>}
        </section>

        {state && (
          <>
            {/* Intention */}
            {state !== 'rest' && (
              <section aria-label="Today's intention" className="mt-8">
                {checkin?.intention && !editingIntent ? (
                  <button onClick={() => setEditingIntent(true)} className="group flex w-full items-start gap-3 rounded-[18px] border border-dashed border-line px-4 py-3 text-left hover:border-accent">
                    <Sparkle size={18} className="mt-1 shrink-0 text-accent-text" />
                    <span className="flex-1"><span className="block text-[12px] text-muted">Making room for</span><span className="font-serif text-[19px] leading-tight">{checkin.intention}</span></span>
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

            {/* Encouragement */}
            {enc && (
              <section aria-label="A little reminder" className="postit mt-10 -rotate-1 p-5">
                <p className="postit-title flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] uppercase"><Sparkle size={14} /> A little reminder</p>
                <p className="mt-2 font-serif text-[21px] leading-snug">{enc.body}</p>
                <p className="mt-2 text-right font-hand text-[22px]">— Nina</p>
              </section>
            )}

            {/* Quick reflection: keep it, or let it out */}
            <section aria-labelledby="ref-h" className="mt-8">
              <h2 id="ref-h" className="font-serif text-[24px]">Anything on your mind?</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/reflections/new/write" className="flex min-h-[112px] flex-col justify-between rounded-[18px] bg-surface p-4 ring-1 ring-line hover:ring-accent">
                  <Pen size={20} className="text-accent-text" />
                  <span><span className="block text-[16px] font-medium">Journal it</span><span className="block text-[13px] leading-snug text-muted">Talk or type. Keep it for later.</span></span>
                </Link>
                <Link to="/reflections/new/get-it-out" className="flex min-h-[112px] flex-col justify-between rounded-[18px] bg-[#241A27] p-4 text-[#FFF3F6]">
                  <Wind size={20} />
                  <span><span className="block text-[16px] font-medium">Get it out</span><span className="block text-[13px] leading-snug text-[#CDB7C6]">Just vent. Then let it go.</span></span>
                </Link>
              </div>
            </section>

            {/* gentle week */}
            {prefs.littleMoments && (
              <section aria-label="Your week" className="mt-8 mb-4">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Little moments this week</p>
                <div className="mt-3 flex justify-between">
                  {weekDays.map((d) => {
                    const ci = data.checkins[d];
                    const moments = data.completions.filter((c) => c.date === d).length + data.reflections.filter((r) => r.createdAt.slice(0, 10) === d).length;
                    const isToday = d === today;
                    return (
                      <div key={d} className="flex flex-col items-center gap-1.5">
                        <span className={cx('grid size-9 place-items-center rounded-full text-[11px]', moments > 0 ? 'bg-pink text-white' : ci?.state === 'rest' ? 'bg-blush text-ink' : 'border border-line text-muted', isToday && 'ring-2 ring-accent/30 ring-offset-2 ring-offset-bg')} title={moments ? `${moments} little moments` : ci?.state === 'rest' ? 'Rest day' : ''}>
                          {moments > 0 ? moments : ci?.state === 'rest' ? '~' : ''}
                        </span>
                        <span className={cx('text-[11px]', isToday ? 'font-semibold text-ink' : 'text-muted')}>{new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[13px] text-muted">No streaks here. Rest days are part of the rhythm.</p>
              </section>
            )}
          </>
        )}
      </div>
      <RitualSheet ritual={open} open={!!open} onClose={() => setOpen(undefined)} />
    </Page>
  );
}
