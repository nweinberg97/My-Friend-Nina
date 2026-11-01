import { useState } from 'react';
import { useApp } from '../../lib/store';
import { Button, Eyebrow, Page, cx } from '../../components/ui';
import { RitualCard, RitualEditor, RitualSheet, suggestedSize } from '../../components/RitualSheet';
import { Plus, Check } from '../../components/Icons';
import { NINA_PICKS, PILLARS, PILLAR_COLOR } from '../../content/rituals';
import { PillarIcon } from '../../components/Icons';
import type { PillarId, Ritual } from '../../types';

export function Rituals() {
  const { data, mood, saveRitual, toast, checkin } = useApp();
  const [filter, setFilter] = useState<PillarId | 'all'>('all');
  const [open, setOpen] = useState<Ritual | undefined>();
  const [editing, setEditing] = useState<Ritual | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [view, setView] = useState<'mine' | 'library' | 'archived'>('mine');

  const active = data.rituals.filter((r) => !r.archived);
  const mine = active.filter((r) => r.selected);
  const library = active.filter((r) => !r.selected);
  const archived = data.rituals.filter((r) => r.archived);
  const list = (view === 'mine' ? mine : view === 'library' ? library : archived).filter((r) => filter === 'all' || r.pillarId === filter);

  const editRitual = (r: Ritual) => { setOpen(undefined); setEditing(r); setEditorOpen(true); };

  return (
    <Page>
      <div className="safe-top px-5">
        <header className="pt-6">
          <Eyebrow>Four pillars, any size</Eyebrow>
          <h1 className="mt-2 font-serif text-[40px] leading-[1.05]">Rituals</h1>
          <p className="mt-2 text-[15px] text-muted">
            {mood === 'rest' && checkin ? 'Rest day. These are here if you want them, not because you have to.' : 'Little things that make you feel like you. Pick any size. They all count.'}
          </p>
        </header>

        {/* Nina's picks */}
        <section aria-labelledby="picks-h" className="mt-7">
          <h2 id="picks-h" className="font-serif text-[22px]">Nina’s picks</h2>
          <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
            {NINA_PICKS.map((p) => {
              const r = data.rituals.find((x) => x.id === p.ritualId);
              if (!r) return null;
              return (
                <button key={p.ritualId} onClick={() => setOpen(r)} className="group relative h-[230px] w-[190px] shrink-0 snap-start overflow-hidden rounded-[22px] text-left">
                  <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                    <p className="font-serif text-[20px] leading-tight">{p.title}</p>
                    <p className="mt-1 text-[12.5px] leading-snug text-white/90">{p.note}</p>
                  </div>
                  {r.selected && <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-white/90 text-[#2B2625]" aria-label="In your rituals"><Check size={15} /></span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* view toggle */}
        <div role="tablist" aria-label="Ritual collections" className="mt-6 flex rounded-[14px] border border-line bg-surface p-1">
          {([['mine', `Mine (${mine.length})`], ['library', `Library (${library.length})`], ['archived', 'Archived']] as const).map(([v, label]) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cx('min-h-10 flex-1 rounded-[10px] text-[14px] font-medium transition', view === v ? 'bg-accent text-accent-ink' : 'text-muted')}>{label}</button>
          ))}
        </div>

        {/* pillar filter */}
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {[{ id: 'all' as const, short: 'All' }, ...PILLARS].map((p) => {
            const on = filter === p.id;
            const c = p.id === 'all' ? { solid: 'var(--accent)', tint: 'var(--soft)' } : PILLAR_COLOR[p.id as PillarId];
            return (
              <button key={p.id} aria-pressed={on} onClick={() => setFilter(p.id)} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition" style={on ? { background: c.solid, color: '#fff' } : { background: c.tint, color: '#2A1A2E' }}>
                {p.id !== 'all' && <PillarIcon pillar={p.id as PillarId} size={15} />}{p.short}
              </button>
            );
          })}
        </div>

        <section className="mt-4 flex flex-col gap-2" aria-live="polite">
          {list.length === 0 && (
            <div className="rounded-[18px] border border-dashed border-line p-6 text-center">
              {view === 'mine' ? (
                <>
                  <p className="font-serif text-[20px]">{archived.length && !active.length ? 'Everything’s archived.' : 'Your little collection is looking pretty empty.'}</p>
                  <p className="mt-1 text-[14px] text-muted">Want to add a few things?</p>
                  <Button variant="soft" className="mt-4" onClick={() => setView(library.length ? 'library' : 'archived')}>{library.length ? 'Browse the library' : 'Restore archived'}</Button>
                </>
              ) : view === 'library' ? (
                <p className="text-[15px] text-muted">You’ve added everything in this pillar. Overachiever. (Lovingly.)</p>
              ) : (
                <p className="text-[15px] text-muted">Nothing archived.</p>
              )}
            </div>
          )}
          {list.map((r) =>
            view === 'library' ? (
              <div key={r.id} className="flex items-center gap-3 rounded-[20px] bg-surface p-3.5 shadow-[0_10px_24px_-20px_rgba(42,26,46,.6)]">
                <span className="grid size-12 shrink-0 place-items-center rounded-[16px]" style={{ background: PILLAR_COLOR[r.pillarId].tint, color: PILLAR_COLOR[r.pillarId].solid }}><PillarIcon pillar={r.pillarId} size={22} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold" style={{ color: PILLAR_COLOR[r.pillarId].text }}>{PILLARS.find((p) => p.id === r.pillarId)?.short}</p>
                  <p className="text-[16px] font-medium">{r.name}</p>
                  <p className="truncate text-[14px] text-muted">{r.sizes.full}, or {r.sizes.tiny.toLowerCase()}</p>
                </div>
                <Button variant="soft" className="min-h-10 px-3" onClick={() => { saveRitual({ ...r, selected: true }); toast(`${r.name} added`); }} aria-label={`Add ${r.name}`}><Plus size={18} /> Add</Button>
              </div>
            ) : (
              <RitualCard key={r.id} ritual={r} size={view === 'mine' && mood !== 'rest' ? suggestedSize(mood) : undefined} onOpen={() => setOpen(r)} />
            ),
          )}
        </section>

        <Button variant="line" full className="mt-5" onClick={() => { setEditing(undefined); setEditorOpen(true); }}><Plus size={18} /> Make your own ritual</Button>
      </div>

      <RitualSheet ritual={open} open={!!open} onClose={() => setOpen(undefined)} onEdit={editRitual} />
      <RitualEditor initial={editing} open={editorOpen} onClose={() => setEditorOpen(false)} />
    </Page>
  );
}
