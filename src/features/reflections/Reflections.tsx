import { useMemo, useState } from 'react';
import { Sheet, NinaSig } from '../../components/ui';
import { useApp } from '../../lib/store';
import { Link } from '../../lib/router';
import { Eyebrow, Page, SiteLink, cx } from '../../components/ui';
import { Mic, Pen, Wind, Heart, Search, Pin, Play, LifeBuoy } from '../../components/Icons';
import { relativeDay, timeOf, addDays } from '../../lib/dates';
import { GET_IT_OUT, NOTE_TO_ME, REFLECTION_PROMPTS, REMINDERS, ENCOURAGEMENTS, pick } from '../../content/nina';
import type { Reflection } from '../../types';

type Filter = 'all' | 'text' | 'voice' | 'guided';

function preview(r: Reflection) {
  if (r.type === 'guided') return r.guided?.express || r.guided?.noticing || 'A Get It Out session';
  if (r.type === 'voice') return r.body || 'Voice note';
  return r.body ?? '';
}

export function ReflectionRow({ r }: { r: Reflection }) {
  const Icon = r.type === 'voice' ? Mic : r.type === 'guided' ? Wind : Pen;
  return (
    <Link to={`/reflections/${r.id}`} className="flex gap-3 rounded-[18px] border border-line bg-surface p-4 hover:border-accent">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-soft text-accent-text"><Icon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[12px] text-muted">
          {r.type === 'voice' ? 'Voice note' : r.type === 'guided' ? 'Get It Out' : 'Written'} · {timeOf(r.createdAt)}
          {r.pinned && <Pin size={13} className="text-accent-text" aria-label="Pinned" />}
          {r.sample && <span className="rounded-full bg-soft px-1.5 text-[10px]">sample</span>}
        </span>
        {r.title && <span className="block truncate text-[16px] font-medium">{r.title}</span>}
        <span className={cx('line-clamp-2 text-[14px] leading-snug', r.title ? 'text-muted' : 'text-ink')}>{preview(r)}</span>
        {r.type === 'voice' && r.durationSec ? <span className="mt-1 inline-flex items-center gap-1 text-[12px] text-accent-text"><Play size={11} /> {Math.round(r.durationSec)}s</span> : null}
      </span>
    </Link>
  );
}

export function Reflections() {
  const { data, prefs, today } = useApp();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const pinnedNotes = data.notes.filter((n) => n.pinned);
  const otherNotes = data.notes.filter((n) => !n.pinned);
  const prompt = pick(REFLECTION_PROMPTS, today + 'prompt');
  const [reminder, setReminder] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.reflections
      .filter((r) => filter === 'all' || r.type === filter)
      .filter((r) => !needle || [r.title, r.body, r.prompt, r.guided?.express, r.guided?.noticing].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data.reflections, q, filter]);

  const groups = useMemo(() => {
    const m = new Map<string, Reflection[]>();
    filtered.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      m.set(key, [...(m.get(key) ?? []), r]);
    });
    return [...m.entries()];
  }, [filtered]);

  const days = Array.from({ length: 21 }, (_, i) => addDays(today, i - 20));
  const momentDays = days.filter((d) => data.completions.some((c) => c.date === d) || data.reflections.some((r) => r.createdAt.slice(0, 10) === d)).length;

  return (
    <Page>
      <div className="safe-top px-5">
        <header className="relative pt-6">
          <SiteLink className="absolute top-4 right-0" />
          <Eyebrow>Your collection</Eyebrow>
          <h1 className="mt-2 font-serif text-[40px] leading-[1.05]">Reflections</h1>
          <p className="mt-2 text-[15px] text-muted">Everything you’ve said, written and noticed. All on this device.</p>
        </header>

        <section aria-label="Start a reflection" className="mt-6 flex flex-col gap-3">
          {/* Journal: thoughts worth keeping */}
          <div className="rounded-[24px] bg-surface p-5 ring-1 ring-line">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-accent-text"><Pen size={20} /></span>
              <div>
                <p className="font-serif text-[24px] leading-tight">Journal</p>
                <p className="mt-0.5 text-[14px] leading-snug text-muted">Thoughts worth keeping. Saved here so you can read them back later.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/reflections/new/voice" className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-accent text-[15px] font-medium text-accent-ink"><Mic size={18} /> Talk</Link>
              <Link to="/reflections/new/write" className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-line text-[15px] font-medium hover:border-accent"><Pen size={18} /> Type</Link>
            </div>
          </div>
          {/* Get It Out: venting, let go by default */}
          <Link to="/reflections/new/get-it-out" className="relative flex items-center gap-3 overflow-hidden rounded-[24px] bg-[#241A27] p-5 text-[#FFF3F6]">
            <span aria-hidden="true" className="absolute -right-10 -bottom-16 size-44 rounded-full bg-[#7A3366] opacity-60 blur-2xl" />
            <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/10"><Wind size={20} /></span>
            <span className="relative flex-1">
              <span className="block font-serif text-[24px] leading-tight">Get it out</span>
              <span className="mt-0.5 block text-[14px] leading-snug text-[#CDB7C6]">Head too loud? Just vent. Messy is fine, and nothing’s saved unless you want it.</span>
            </span>
          </Link>
          <Link to="/reflections/new/note" className="flex min-h-14 items-center gap-3 rounded-[18px] px-2 text-[15px] hover:bg-soft/40">
            <Heart size={20} className="text-accent-text" />
            <span className="flex-1"><span className="font-medium">{NOTE_TO_ME.name}</span> <span className="text-muted">· when you’re being hard on yourself</span></span>
          </Link>
        </section>

        <Link to={`/reflections/new/write?prompt=${encodeURIComponent(prompt)}`} className="mt-3 block rounded-[18px] border border-dashed border-line px-4 py-3 hover:border-accent">
          <span className="text-[12px] text-muted">Today’s prompt, if you want one</span>
          <span className="mt-0.5 block font-serif text-[19px] italic leading-snug">{prompt}</span>
        </Link>

        <section aria-labelledby="rem-h" className="mt-8">
          <h2 id="rem-h" className="font-serif text-[22px] leading-tight">Little reminders from Nina</h2>
          <p className="mt-0.5 text-[13px] text-muted">For when you need one. Tap to read.</p>
          <div className="no-scrollbar -mx-5 mt-2 flex snap-x gap-4 overflow-x-auto px-5 pt-4 pb-4">
            {REMINDERS.map((r, i) => (
              <button key={r.theme} onClick={() => setReminder(i)} className={cx('postit flex h-[178px] w-[178px] shrink-0 snap-start flex-col justify-between p-4 text-left transition hover:-translate-y-0.5', i % 2 ? 'rotate-[1.5deg]' : '-rotate-[1.5deg]')} style={{ backgroundColor: r.tint, color: r.ink }}>
                <span className="font-serif text-[22px] leading-[1.1]">{r.title}</span>
                <span className="line-clamp-2 text-[13px] leading-snug opacity-80">{r.body}</span>
              </button>
            ))}
          </div>
        </section>

        {prefs.littleMoments && (
          <section aria-label="Little moments, last three weeks" className="mt-8">
            <h2 className="font-serif text-[22px] leading-tight">Little moments</h2>
            <p className="mt-0.5 text-[13px] text-muted">{momentDays} days you did something for you</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {days.map((d) => {
                const n = data.completions.filter((c) => c.date === d).length + data.reflections.filter((r) => r.createdAt.slice(0, 10) === d).length;
                const rest = data.checkins[d]?.state === 'rest';
                return (
                  <div key={d} title={`${relativeDay(d, today)}${n ? ` · ${n} moments` : rest ? ' · rest day' : ''}`} className={cx('aspect-square rounded-[10px]', n >= 4 ? 'bg-pink' : n >= 2 ? 'bg-pink/65' : n === 1 ? 'bg-pink/35' : rest ? 'bg-blush' : 'bg-line/50', d === today && 'ring-2 ring-pink/40 ring-offset-2 ring-offset-bg')} />
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-muted">Pale squares aren’t misses. They’re just days. Rest days get their own colour.</p>
          </section>
        )}

        {(pinnedNotes.length > 0 || otherNotes.length > 0) && (
          <section aria-labelledby="notes-h" className="mt-8">
            <h2 id="notes-h" className="font-serif text-[22px]">Notes to me</h2>
            <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
              {[...pinnedNotes, ...otherNotes].map((n) => (
                <Link key={n.id} to={`/reflections/note/${n.id}`} className="relative w-[240px] shrink-0 rounded-[18px] bg-surface p-4 text-ink shadow-[0_8px_20px_-14px_rgba(42,30,44,.35)] ring-1 ring-line">
                  {n.pinned && <Pin size={15} className="absolute top-3 right-3 text-[#C4004E]" aria-label="Pinned" />}
                  <p className="font-serif text-[18px] leading-snug">“{n.forward || n.friendSays}”</p>
                  <p className="mt-2 text-[12px] opacity-70">{relativeDay(n.createdAt.slice(0, 10), today)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="hist-h" className="mt-8">
          <h2 id="hist-h" className="font-serif text-[22px]">Everything so far</h2>
          <div className="mt-3 flex items-center gap-2 rounded-[14px] border border-line bg-surface px-3">
            <Search size={18} className="text-muted" />
            <label htmlFor="search" className="sr-only">Search reflections</label>
            <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your reflections" className="min-h-12 flex-1 bg-transparent text-[16px] outline-none" />
          </div>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
            {([['all', 'All'], ['text', 'Written'], ['voice', 'Voice'], ['guided', 'Get It Out']] as [Filter, string][]).map(([f, l]) => (
              <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={cx('min-h-10 shrink-0 rounded-full border px-4 text-[14px]', filter === f ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface')}>{l}</button>
            ))}
          </div>

          {data.reflections.length === 0 ? (
            <div className="mt-4 rounded-[18px] border border-dashed border-line p-6 text-center">
              <p className="font-serif text-[20px]">Nothing here yet.</p>
              <p className="mt-1 text-[14px] text-muted">Whenever you feel like getting something out, this is your space.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="mt-4 text-center text-[15px] text-muted">Nothing matches that. Try another word?</p>
          ) : (
            <div className="mt-4 space-y-6">
              {groups.map(([day, items]) => (
                <div key={day}>
                  <p className="mb-2 text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{relativeDay(day, today)}</p>
                  <div className="flex flex-col gap-2">{items.map((r) => <ReflectionRow key={r.id} r={r} />)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link to="/support" className="mt-10 mb-2 flex items-center justify-center gap-2 text-[13px] text-muted hover:text-ink"><LifeBuoy size={15} /> Need more support?</Link>
      </div>
      <Sheet open={reminder !== null} onClose={() => setReminder(null)} title="A little reminder">
        {reminder !== null && (() => {
          const r = REMINDERS[reminder];
          const more = ENCOURAGEMENTS.filter((e) => e.theme === r.theme);
          return (
            <div className="pt-2">
              <div className="postit mx-1 mt-3 -rotate-1 p-6" style={{ backgroundColor: r.tint, color: r.ink }}>
                <p className="font-serif text-[32px] leading-[1.08]">{r.title}</p>
                <p className="mt-3 text-[17px] leading-relaxed">{r.body}</p>
                <p className="mt-3 text-right font-hand text-[24px]">— Nina</p>
              </div>
              {more.length > 0 && (
                <div className="mt-5 space-y-3">
                  <p className="text-[13px] text-muted">You might also see these on Today:</p>
                  {more.map((m) => <p key={m.id} className="rounded-[14px] bg-soft/60 px-4 py-3 font-serif text-[17px] italic leading-snug">“{m.body}”</p>)}
                </div>
              )}
              <div className="mt-6 flex gap-2">
                <Link to="/reflections/new/write" className="flex min-h-12 flex-1 items-center justify-center rounded-[14px] bg-accent text-[15px] font-medium text-accent-ink">Write about it</Link>
                <button onClick={() => setReminder((reminder + 1) % REMINDERS.length)} className="min-h-12 flex-1 rounded-[14px] border border-line text-[15px]">Next reminder</button>
              </div>
            </div>
          );
        })()}
      </Sheet>
    </Page>
  );
}
