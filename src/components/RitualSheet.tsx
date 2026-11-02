import { useEffect, useState } from 'react';
import type { EnergyState, PillarId, Ritual, RitualSize } from '../types';
import { useApp } from '../lib/store';
import { PILLAR_BY_ID, PILLARS, SIZE_LABEL } from '../content/rituals';
import { COMPLETION_LINES, pick } from '../content/nina';
import { Button, Sheet, cx, Eyebrow } from './ui';
import { Archive, Check, Edit, Undo } from './Icons';
import { uid } from '../lib/dates';

export function suggestedSize(state: EnergyState): RitualSize {
  return state === 'high' ? 'full' : state === 'steady' ? 'small' : 'tiny';
}

export function SizePicker({ value, onChange, ritual, suggested }: { value: RitualSize; onChange: (s: RitualSize) => void; ritual: Ritual; suggested?: RitualSize }) {
  const sizes: RitualSize[] = ['full', 'small', 'tiny'];
  return (
    <div role="radiogroup" aria-label="Pick a size" className="flex flex-col gap-2">
      {sizes.map((s) => (
        <button
          key={s}
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={cx('flex min-h-14 items-center gap-3 rounded-[14px] border px-4 text-left transition', value === s ? 'border-accent bg-soft/70' : 'border-line bg-surface hover:border-accent')}
        >
          <span className={cx('grid size-5 shrink-0 place-items-center rounded-full border-2', value === s ? 'border-accent bg-accent' : 'border-line')} aria-hidden="true">
            {value === s && <span className="size-1.5 rounded-full bg-accent-ink" />}
          </span>
          <span className="flex-1">
            <span className="block text-[12px] font-semibold tracking-[0.12em] text-muted uppercase">{SIZE_LABEL[s]}{suggested === s && <span className="ml-2 font-medium normal-case tracking-normal text-accent-text">· suggested today</span>}</span>
            <span className="block text-[15px] text-ink">{ritual.sizes[s]}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function RitualSheet({ ritual, open, onClose, onEdit }: { ritual?: Ritual; open: boolean; onClose: () => void; onEdit?: (r: Ritual) => void }) {
  const { mood, data, today, completeRitual, undoCompletion, saveRitual, toast } = useApp();
  const done = ritual ? data.completions.find((c) => c.ritualId === ritual.id && c.date === today) : undefined;
  const [size, setSize] = useState<RitualSize>(suggestedSize(mood));
  useEffect(() => { if (open) setSize(done?.size ?? suggestedSize(mood)); }, [open, ritual?.id]); // eslint-disable-line
  if (!ritual) return null;
  const pillar = PILLAR_BY_ID[ritual.pillarId];

  const complete = () => {
    const c = completeRitual(ritual.id, size);
    onClose();
    toast(pick(COMPLETION_LINES, c.id), { label: 'Undo', run: () => undoCompletion(c.id) });
  };

  return (
    <Sheet open={open} onClose={onClose} title={ritual.name}>
      <Eyebrow className="mt-1">{pillar.short}</Eyebrow>
      <h2 className="mt-1 pr-10 font-serif text-[30px] leading-[1.1]">{ritual.name}</h2>
      <p className="mt-2 text-[15px] text-muted">{ritual.description}</p>
      {ritual.ninaNote && <p className="mt-3 rounded-[14px] bg-soft/60 px-4 py-3 font-serif text-[18px] italic leading-snug text-ink">“{ritual.ninaNote}”</p>}
      <div className="mt-5">
        <p className="mb-2 text-[14px] font-medium">Pick your size. They all count the same.</p>
        <SizePicker value={size} onChange={setSize} ritual={ritual} suggested={mood === 'rest' ? undefined : suggestedSize(mood)} />
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {done ? (
          <>
            <p className="flex items-center justify-center gap-2 text-[15px] text-accent-text"><Check size={18} /> Done today ({SIZE_LABEL[done.size].toLowerCase()}). Nice.</p>
            {done.size !== size && <Button full onClick={complete}>Switch to {SIZE_LABEL[size].toLowerCase()}</Button>}
            <Button full variant="line" onClick={() => { undoCompletion(done.id); toast('Undone. No big deal.'); onClose(); }}><Undo size={18} /> Undo</Button>
          </>
        ) : (
          <Button full onClick={complete}><Check size={18} /> I did the {SIZE_LABEL[size].toLowerCase()} version</Button>
        )}
        {!ritual.selected && !ritual.archived && (
          <Button full variant="soft" onClick={() => { saveRitual({ ...ritual, selected: true }); toast('Added to your rituals'); }}>Add to my rituals</Button>
        )}
        <div className="mt-2 flex gap-2">
          {onEdit && <Button variant="ghost" className="flex-1" onClick={() => onEdit(ritual)}><Edit size={18} /> Edit</Button>}
          {!ritual.archived ? (
            <Button variant="ghost" className="flex-1" onClick={() => { saveRitual({ ...ritual, archived: true, selected: false }); toast(`${ritual.name} archived`, { label: 'Undo', run: () => saveRitual(ritual) }); onClose(); }}><Archive size={18} /> Archive</Button>
          ) : (
            <Button variant="ghost" className="flex-1" onClick={() => { saveRitual({ ...ritual, archived: false, selected: true }); toast('Back in your collection'); onClose(); }}>Restore</Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

export function RitualEditor({ initial, open, onClose }: { initial?: Ritual; open: boolean; onClose: () => void }) {
  const { saveRitual, toast } = useApp();
  const blank = (): Ritual => ({ id: uid('r-custom'), pillarId: 'move', name: '', description: '', sizes: { full: '', small: '', tiny: '' }, selected: true, archived: false, custom: true });
  const [r, setR] = useState<Ritual>(initial ?? blank());
  useEffect(() => { if (open) setR(initial ?? blank()); }, [open, initial?.id]); // eslint-disable-line
  const valid = r.name.trim() && r.sizes.full.trim() && r.sizes.small.trim() && r.sizes.tiny.trim();
  const field = 'mt-1 w-full rounded-[12px] border border-line bg-bg px-3.5 py-3 text-[16px] outline-none focus:border-accent';
  return (
    <Sheet open={open} onClose={onClose} title={initial ? 'Edit ritual' : 'New ritual'}>
      <h2 className="mt-1 font-serif text-[28px]">{initial ? 'Edit ritual' : 'Make your own'}</h2>
      <p className="mt-1 text-[14px] text-muted">Something small that makes you feel like you. Not a to-do. Not a chore.</p>
      <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (!valid) return; saveRitual({ ...r, name: r.name.trim() }); toast(initial ? 'Saved' : 'Added to your rituals'); onClose(); }}>
        <fieldset>
          <legend className="text-[14px] font-medium">Which pillar?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <button type="button" key={p.id} onClick={() => setR({ ...r, pillarId: p.id as PillarId })} aria-pressed={r.pillarId === p.id} className={cx('min-h-10 rounded-full border px-4 text-[14px]', r.pillarId === p.id ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface')}>{p.short}</button>
            ))}
          </div>
        </fieldset>
        <label className="text-[14px] font-medium">Name<input className={field} value={r.name} maxLength={40} onChange={(e) => setR({ ...r, name: e.target.value })} placeholder="e.g. Morning stretch" /></label>
        <label className="text-[14px] font-medium">One line about it <span className="font-normal text-muted">(optional)</span><input className={field} value={r.description} maxLength={80} onChange={(e) => setR({ ...r, description: e.target.value })} placeholder="Why it feels good" /></label>
        {(['full', 'small', 'tiny'] as RitualSize[]).map((s) => (
          <label key={s} className="text-[14px] font-medium">{SIZE_LABEL[s]} version<input className={field} value={r.sizes[s]} maxLength={60} onChange={(e) => setR({ ...r, sizes: { ...r.sizes, [s]: e.target.value } })} placeholder={s === 'full' ? '20-minute stretch' : s === 'small' ? '5-minute stretch' : 'One big stretch'} /></label>
        ))}
        <Button type="submit" full disabled={!valid}>{initial ? 'Save changes' : 'Add ritual'}</Button>
      </form>
    </Sheet>
  );
}

export function RitualCard({ ritual, onOpen, size, highlight }: { ritual: Ritual; onOpen: () => void; size?: RitualSize; highlight?: boolean }) {
  const { data, today } = useApp();
  const done = data.completions.find((c) => c.ritualId === ritual.id && c.date === today);
  const showSize = done?.size ?? size;
  return (
    <button onClick={onOpen} className={cx('group flex w-full items-center gap-4 rounded-[18px] border p-4 text-left transition', done ? 'border-transparent bg-soft/70' : 'border-line bg-surface hover:border-accent', highlight && !done && 'ring-2 ring-accent/30')}>
      <span className={cx('grid size-11 shrink-0 place-items-center rounded-full border-2 transition', done ? 'anim-pop border-accent bg-accent text-accent-ink' : 'border-line text-transparent group-hover:border-accent')} aria-hidden="true">
        <Check size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{PILLAR_BY_ID[ritual.pillarId].short}{showSize && <> · {SIZE_LABEL[showSize]}</>}</span>
        <span className={cx('block truncate text-[16px] font-medium', done && 'text-muted line-through decoration-accent/50')}>{ritual.name}</span>
        {showSize && <span className="block truncate text-[14px] text-muted">{ritual.sizes[showSize]}</span>}
      </span>
      <span className="sr-only">{done ? 'Done today. Open to change or undo.' : 'Open to choose a size and mark done.'}</span>
    </button>
  );
}
