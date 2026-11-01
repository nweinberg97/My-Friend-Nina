import { useMemo, useState } from 'react';
import { useApp } from '../../lib/store';
import { Link } from '../../lib/router';
import { Eyebrow, Page, cx } from '../../components/ui';
import { MomentBubbles, MomentLegend, useMoments } from '../../components/Moments';
import { Mic, Pen, Wind, Heart, Search, Pin, Play, LifeBuoy } from '../../components/Icons';
import { relativeDay, timeOf, addDays } from '../../lib/dates';
import { GET_IT_OUT, NOTE_TO_ME, REFLECTION_PROMPTS, pick } from '../../content/nina';
import type { Reflection } from '../../types';

const STICKY = ['#FFF1C2', '#FFD6E6', '#DCEBFF', '#D9F2DD'];

type Filter = 'all' | 'text' | 'voice' | 'guided';

function preview(r: Reflection) {
  if (r.type === 'guided') return r.guided?.express || r.guided?.noticing || 'A Get It Out session';
  if (r.type === 'voice') return r.body || 'Voice note';
  return r.body ?? '';
}

export function ReflectionRow({ r }: { r: Reflection }) {
  const Icon = r.type === 'voice' ? Mic : r.type === 'guided' ? Wind : Pen;
  return (
    <Link to={`/reflections/${r.id}`} className="flex gap-3 rounded-[20px] bg-surface p-3.5 shadow-[0_10px_24px_-20px_rgba(42,26,46,.6)] transition hover:-translate-y-0.5">
      <span className="grid size-11 shrink-0 place-items-center rounded-[14px] text-white" style={{ background: r.type === 'voice' ? '#E6005C' : r.type === 'guided' ? '#2F6FD6' : '#F05A1A' }}><Icon size={19} /></span>
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

  const { showedUp } = useMoments(21);

  return (
    <Page>
      <div className="safe-top px-5">
        <header className="pt-6">
          <Eyebrow>Your collection</Eyebrow>
          <h1 className="mt-2 font-serif text-[40px] leading-[1.05]">Reflections</h1>
          <p className="mt-2 text-[15px] text-muted">Voice notes, quick writes and little notes to you. All on this device.</p>
        </header>

        <section aria-label="Start a reflection" className="mt-6 grid grid-cols-2 gap-2.5">
          {[
            { to: '/reflections/new/voice', label: 'Voice note', sub: 'Say it out loud', Icon: Mic, bg: '#E6005C', fg: '#fff', tilt: '-rotate-1' },
            { to: '/reflections/new/write', label: 'Write something', sub: 'A line or a page', Icon: Pen, bg: '#FFC93C', fg: '#3A2A12', tilt: 'rotate-1' },
            { to: '/reflections/new/get-it-out', label: GET_IT_OUT.name, sub: 'Vent, then one small thing', Icon: Wind, bg: '#2F6FD6', fg: '#fff', tilt: 'rotate-[.6deg]' },
            { to: '/reflections/new/note', label: NOTE_TO_ME.name, sub: 'Go easy on you', Icon: Heart, bg: '#2F7D4F', fg: '#fff', tilt: '-rotate-[.6deg]' },
          ].map(({ to, label, sub, Icon, bg, fg, tilt }) => (
            <Link key={to} to={to} className={cx('block rounded-[22px] transition hover:rotate-0 hover:-translate-y-0.5 active:scale-[.98]', tilt)}>
              <span className="flex min-h-[128px] flex-col justify-between rounded-[22px] p-4 shadow-[0_14px_26px_-18px_rgba(42,26,46,.6)]" style={{ background: bg, color: fg }}>
                <span className="grid size-10 place-items-center rounded-full" style={{ background: fg === '#fff' ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.6)' }}><Icon size={20} /></span>
                <span><span className="block font-serif text-[18px] leading-tight">{label}</span><span className="block text-[13px] opacity-85">{sub}</span></span>
              </span>
            </Link>
          ))}
        </section>

        <Link to={`/reflections/new/write?prompt=${encodeURIComponent(prompt)}`} className="mt-3 block rounded-[18px] border border-dashed border-line px-4 py-3 hover:border-accent">
          <span className="text-[12px] text-muted">Today’s prompt, if you want one</span>
          <span className="block font-hand text-[24px] leading-tight">{prompt}</span>
        </Link>

        {prefs.littleMoments && (
          <section aria-labelledby="lm-h" className="mt-8 overflow-hidden rounded-[26px] bg-surface p-5 shadow-[0_16px_34px_-26px_rgba(42,26,46,.55)]">
            <div className="flex items-start gap-4">
              <div className="grid size-16 shrink-0 rotate-[-6deg] place-items-center rounded-[18px] bg-accent font-serif text-[30px] text-accent-ink shadow-[0_10px_20px_-10px_var(--accent)]">{showedUp}</div>
              <div>
                <h2 id="lm-h" className="font-serif text-[19px] leading-tight">days you showed up for you</h2>
                <p className="text-[14px] text-muted">in the last three weeks. Rest days count too.</p>
              </div>
            </div>
            <div className="mt-5"><MomentBubbles days={21} /></div>
            <div className="mt-4"><MomentLegend /></div>
          </section>
        )}

        {(pinnedNotes.length > 0 || otherNotes.length > 0) && (
          <section aria-labelledby="notes-h" className="mt-8">
            <h2 id="notes-h" className="font-serif text-[22px]">Notes to me</h2>
            <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
              {[...pinnedNotes, ...otherNotes].map((n, i) => (
                <Link key={n.id} to={`/reflections/note/${n.id}`} className="paper relative w-[230px] shrink-0 rotate-[-1.5deg] rounded-[6px] p-4 pt-5 text-[#2A1A2E] shadow-[0_14px_24px_-16px_rgba(0,0,0,.45)] odd:rotate-[1.5deg]" style={{ background: STICKY[i % STICKY.length] }}>
                  {n.pinned && <Pin size={15} className="absolute top-3 right-3 text-[#C4004E]" aria-label="Pinned" />}
                  <p className="font-hand text-[22px] leading-snug">“{n.forward || n.friendSays}”</p>
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
                  <p className="mb-2 text-[12px] font-semibold text-muted">{relativeDay(day, today)}</p>
                  <div className="flex flex-col gap-2">{items.map((r) => <ReflectionRow key={r.id} r={r} />)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link to="/support" className="mt-10 mb-2 flex items-center justify-center gap-2 text-[13px] text-muted hover:text-ink"><LifeBuoy size={15} /> Need more support?</Link>
      </div>
    </Page>
  );
}
