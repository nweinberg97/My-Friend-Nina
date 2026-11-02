import { useEffect, useState } from 'react';
import { useApp } from '../../lib/store';
import { back, navigate } from '../../lib/router';
import { AudioPlayer, Avatar, Button, Confirm, Eyebrow, Page, TopBar, cx } from '../../components/ui';
import { Recorder } from '../../components/Recorder';
import { Mic, Pen, Pin, Trash, Edit, Check, LifeBuoy } from '../../components/Icons';
import { GET_IT_OUT, NOTE_TO_ME, REFLECTION_PROMPTS, pick, STATE_META } from '../../content/nina';
import { prettyDate, timeOf } from '../../lib/dates';
import type { GuidedAnswers } from '../../types';

const field = 'w-full rounded-[16px] border border-line bg-surface p-4 text-[17px] leading-relaxed outline-none focus:border-accent';

function useLeaveGuard(dirty: boolean) {
  const [asking, setAsking] = useState(false);
  const leave = () => (dirty ? setAsking(true) : back('/reflections'));
  const guard = <Confirm open={asking} onClose={() => setAsking(false)} title="Leave without saving?" body="What you’ve got so far won’t be kept. Totally fine if that’s what you want." confirmLabel="Discard it" onConfirm={() => back('/reflections')} />;
  return { leave, guard };
}

/* One composer for everyday reflecting. Talking or typing is just how you say it,
   not a different feature: same prompt, same save, same place in your collection. */
export function NewWrite({ initialPrompt, initialMode = 'type' }: { initialPrompt?: string; initialMode?: 'type' | 'talk' }) {
  const { addReflection, toast, mood, today } = useApp();
  const [mode, setMode] = useState<'type' | 'talk'>(initialMode);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [secs, setSecs] = useState(0);
  const [prompt, setPrompt] = useState(initialPrompt);
  const { leave, guard } = useLeaveGuard(!!(title.trim() || body.trim() || blob));
  const ready = mode === 'type' ? !!body.trim() : !!blob;
  const save = async () => {
    if (!ready) return;
    try {
      if (mode === 'talk' && blob) {
        await addReflection({ type: 'voice', title: title.trim() || 'Voice note', durationSec: secs, prompt, state: mood }, blob);
        toast('Saved on this device');
      } else {
        await addReflection({ type: 'text', title: title.trim() || undefined, body: body.trim(), prompt, state: mood });
        toast('Saved to your reflections');
      }
      navigate('/reflections', { replace: true });
    } catch {
      toast("Well, that didn't work. It's still here. Let's try again.");
    }
  };
  return (
    <Page nav={false}>
      <TopBar title="Journal" onBack={leave} right={<Button variant="ghost" className="min-h-10 px-3" disabled={!ready} onClick={save}>Save</Button>} />
      <div className="px-5 pb-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted">{prettyDate(today)}</p>
          <div role="radiogroup" aria-label="How do you want to say it?" className="flex rounded-full bg-soft/80 p-1">
            {([['type', 'Type', Pen], ['talk', 'Talk', Mic]] as const).map(([id, label, Icon]) => (
              <button key={id} role="radio" aria-checked={mode === id} onClick={() => setMode(id)} className={cx('flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium transition', mode === id ? 'bg-surface text-accent-text shadow-sm' : 'text-muted')}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[13px] text-muted">Saved to your journal so you can read it back later.</p>
        {prompt ? (
          <div className="mt-4 flex items-start gap-2 rounded-[14px] bg-soft/70 px-4 py-3">
            <p className="flex-1 font-serif text-[19px] italic leading-snug">{prompt}</p>
            <button className="min-h-9 text-[13px] text-muted" onClick={() => setPrompt(pick(REFLECTION_PROMPTS, String(Date.now())))}>Another</button>
            <button className="min-h-9 text-[13px] text-muted" onClick={() => setPrompt(undefined)}>None</button>
          </div>
        ) : (
          <button className="mt-4 text-[14px] text-accent-text" onClick={() => setPrompt(pick(REFLECTION_PROMPTS, String(Date.now())))}>Want a prompt?</button>
        )}
        {mode === 'type' ? (
          <div key="type" className="anim-fade">
            <label className="sr-only" htmlFor="t">Title</label>
            <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" maxLength={60} className="mt-5 w-full bg-transparent font-serif text-[28px] outline-none placeholder:text-muted/60" />
            <label className="sr-only" htmlFor="b">Your reflection</label>
            <textarea id="b" autoFocus value={body} onChange={(e) => setBody(e.target.value)} rows={10} placeholder="A line or a page. No need to make it pretty." className="mt-3 min-h-[260px] w-full resize-none bg-transparent text-[18px] leading-relaxed outline-none placeholder:text-muted/70" />
            <Button full disabled={!body.trim()} onClick={save}>Save reflection</Button>
          </div>
        ) : (
          <div key="talk" className="anim-fade mt-6">
            <div className="flex items-start gap-3">
              <Avatar size={40} />
              <p className="flex-1 rounded-[18px] rounded-tl-[6px] bg-soft/70 px-4 py-3 text-[16px] leading-relaxed">Talk it out like you’re in the car with a friend. Ramble away. Nobody hears this but you.</p>
            </div>
            <div className="mt-6"><Recorder onChange={(b, s) => { setBlob(b); setSecs(s); }} /></div>
            {blob && (
              <div className="anim-rise mt-6">
                <label htmlFor="vt" className="text-[14px] font-medium">Give it a name <span className="font-normal text-muted">(optional)</span></label>
                <input id="vt" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} placeholder="e.g. Drive home thoughts" className="mt-1.5 w-full rounded-[12px] border border-line bg-surface px-4 py-3 text-[16px] outline-none focus:border-accent" />
                <Button full className="mt-4" onClick={save}>Save voice note</Button>
              </div>
            )}
            <p className="mt-6 text-center text-[13px] text-muted">Audio stays on this device. Your mic is only on while you’re recording.</p>
          </div>
        )}
      </div>
      {guard}
    </Page>
  );
}

export function NewVoice() {
  return <NewWrite initialMode="talk" />;
}

export function GetItOut() {
  const { addReflection, toast, mood } = useApp();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<GuidedAnswers>({});
  const [blob, setBlob] = useState<Blob | null>(null);
  const [secs, setSecs] = useState(0);
  const dirty = !!(a.express || a.noticing || blob);
  const { leave, guard } = useLeaveGuard(dirty);
  const total = 5;
  // Venting gets its own darker, quieter room, so it never looks like journaling
  useEffect(() => {
    document.documentElement.classList.add('vent-mode');
    return () => document.documentElement.classList.remove('vent-mode');
  }, []);

  const save = async () => {
    await addReflection({ type: blob ? 'voice' : 'guided', title: GET_IT_OUT.name, guided: a, durationSec: blob ? secs : undefined, state: mood }, blob ?? undefined);
    toast('Kept in your reflections. Proud of you for getting it out.');
    navigate('/reflections', { replace: true });
  };

  return (
    <Page nav={false}>
      <TopBar title={GET_IT_OUT.name} onBack={step === 0 ? leave : () => setStep(step - 1)} right={<button onClick={leave} className="min-h-10 px-2 text-[14px] text-muted">Close</button>} />
      <div className="px-5 pb-10">
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label="Progress">
          {Array.from({ length: total }).map((_, i) => <span key={i} className={cx('h-1 flex-1 rounded-full', i <= step ? 'bg-accent' : 'bg-line')} />)}
        </div>
        <div key={step} className="anim-rise mt-8">
          {step === 0 && (
            <>
              <div className="flex items-center gap-3"><Avatar size={40} /><p className="text-[15px] text-muted">{GET_IT_OUT.tagline}</p></div>
              <h1 className="mt-5 font-serif text-[34px] leading-[1.1]">{GET_IT_OUT.open}</h1>
              <div className="mt-8 flex flex-col gap-2">
                {[
                  { id: 'say', label: 'Say it out loud', Icon: Mic },
                  { id: 'write', label: 'Write it down', Icon: Pen },
                  { id: 'unsure', label: 'Not sure yet', Icon: null },
                ].map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => { setA({ ...a, mode: id as GuidedAnswers['mode'] }); setStep(1); }} className="flex min-h-14 items-center gap-3 rounded-[16px] border border-line bg-surface px-4 text-left text-[16px] hover:border-accent">
                    {Icon ? <Icon size={20} className="text-accent-text" /> : <span className="w-5 text-center text-accent-text">~</span>}{label}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h1 className="font-serif text-[32px] leading-[1.1]">{GET_IT_OUT.express}</h1>
              {a.mode === 'unsure' && <p className="mt-2 text-[15px] text-muted">Start with one word. Or “ugh.” Ugh is valid.</p>}
              <div className="mt-6">
                {a.mode === 'say' ? (
                  <Recorder compact onChange={(b, s) => { setBlob(b); setSecs(s); }} />
                ) : (
                  <>
                    <label htmlFor="ex" className="sr-only">Get it out</label>
                    <textarea id="ex" autoFocus rows={7} value={a.express ?? ''} onChange={(e) => setA({ ...a, express: e.target.value })} placeholder="Just type. Nobody’s grading this." className={field} />
                  </>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Skip</Button>
                <Button full onClick={() => setStep(2)} disabled={a.mode === 'say' ? !blob : false}>Okay, that’s out</Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="font-serif text-[32px] leading-[1.1]">{GET_IT_OUT.pause}</h1>
              <p className="mt-2 text-[15px] text-muted">{GET_IT_OUT.pauseHint}</p>
              <label htmlFor="no" className="sr-only">What you're noticing</label>
              <textarea id="no" rows={3} value={a.noticing ?? ''} onChange={(e) => setA({ ...a, noticing: e.target.value })} placeholder="Tired more than sad, maybe?" className={cx(field, 'mt-6')} />
              <div className="mt-6 flex gap-2">
                <Button variant="ghost" onClick={() => setStep(3)}>Skip</Button>
                <Button full onClick={() => setStep(3)}>Next</Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="font-serif text-[32px] leading-[1.1]">{GET_IT_OUT.choose}</h1>
              <div className="mt-6 flex flex-col gap-2">
                {GET_IT_OUT.options.map((o) => (
                  <button key={o.id} aria-pressed={a.nextStep === o.id} onClick={() => { setA({ ...a, nextStep: o.id }); setStep(4); }} className={cx('flex min-h-14 items-center justify-between rounded-[16px] border px-4 text-left text-[16px]', a.nextStep === o.id ? 'border-accent bg-soft/70' : 'border-line bg-surface hover:border-accent')}>
                    {o.label}{a.nextStep === o.id && <Check size={18} />}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <div className="grid size-16 place-items-center rounded-full bg-soft text-accent-text anim-pop"><Check size={28} /></div>
              <h1 className="mt-6 font-serif text-[34px] leading-[1.1]">{GET_IT_OUT.finish}</h1>
              {a.nextStep === 'ritual' && <p className="mt-3 text-[15px] text-muted">Your rituals are waiting. Pick the tiny version. It counts.</p>}
              {a.nextStep === 'break' && <p className="mt-3 text-[15px] text-muted">Water, window, maybe a few minutes outside. Then come back if you want.</p>}
              {a.nextStep === 'reach' && <p className="mt-3 text-[15px] text-muted">Who’s someone who always makes you feel a bit better? Send them a text. Even just “hey.”</p>}
              <div className="mt-8 flex flex-col gap-2">
                <Button full onClick={() => { toast('Let go. Nothing saved.'); navigate(a.nextStep === 'ritual' ? '/rituals' : '/reflections', { replace: true }); }}>Let it go</Button>
                <Button full variant="line" onClick={save}>Keep it in my reflections</Button>
              </div>
              <p className="mt-3 text-center text-[13px] text-muted">Letting go means nothing is stored. That’s the point.</p>
              <button onClick={() => navigate('/support')} className="mt-8 flex w-full items-center justify-center gap-2 text-[13px] text-muted hover:text-ink"><LifeBuoy size={15} /> If it’s more than a vent, here’s where to find more support</button>
            </>
          )}
        </div>
      </div>
      {guard}
    </Page>
  );
}

export function NoteFlow({ editId }: { editId?: string }) {
  const { addNote, updateNote, data, toast } = useApp();
  const existing = editId ? data.notes.find((n) => n.id === editId) : undefined;
  const [step, setStep] = useState(0);
  const [n, setN] = useState({ lookBack: existing?.lookBack ?? '', friendSays: existing?.friendSays ?? '', forward: existing?.forward ?? '' });
  const { leave, guard } = useLeaveGuard(!existing && !!(n.lookBack || n.friendSays || n.forward));
  const steps = [
    { key: 'lookBack' as const, q: NOTE_TO_ME.lookBack, ph: "Not working out enough, being slow to reply, that thing I said…" },
    { key: 'friendSays' as const, q: NOTE_TO_ME.friend, ph: 'Probably something way kinder than what you’re telling yourself.' },
    { key: 'forward' as const, q: NOTE_TO_ME.forward, ph: 'Small. Doable. Kind.' },
  ];
  const s = steps[step];
  const save = () => {
    if (existing) { updateNote(existing.id, n); toast('Note updated'); navigate(`/reflections/note/${existing.id}`, { replace: true }); return; }
    const saved = addNote({ ...n, pinned: true });
    toast(NOTE_TO_ME.saved);
    navigate(`/reflections/note/${saved.id}`, { replace: true });
  };
  return (
    <Page nav={false}>
      <TopBar title={NOTE_TO_ME.name} onBack={step === 0 ? leave : () => setStep(step - 1)} />
      <div className="px-5 pb-10">
        {step === 0 && <p className="text-[15px] text-muted">{NOTE_TO_ME.tagline}</p>}
        <div key={step} className="anim-rise mt-6">
          <Eyebrow>{step + 1} of 3</Eyebrow>
          <h1 className="mt-2 font-serif text-[32px] leading-[1.1]">{s.q}</h1>
          <label htmlFor="nf" className="sr-only">{s.q}</label>
          <textarea id="nf" autoFocus rows={5} value={n[s.key]} onChange={(e) => setN({ ...n, [s.key]: e.target.value })} placeholder={s.ph} className="mt-6 w-full rounded-[18px] border border-line bg-surface p-4 text-[18px] leading-relaxed text-ink outline-none focus:border-accent" />
          <div className="mt-6 flex gap-2">
            {step < 2 ? <Button full onClick={() => setStep(step + 1)} disabled={!n[s.key].trim()}>Next</Button> : <Button full onClick={save} disabled={!n.forward.trim()}><Pin size={18} /> {existing ? 'Save note' : 'Pin my note'}</Button>}
          </div>
        </div>
      </div>
      {guard}
    </Page>
  );
}

export function NoteDetail({ id }: { id: string }) {
  const { data, updateNote, deleteNote, toast } = useApp();
  const n = data.notes.find((x) => x.id === id);
  const [del, setDel] = useState(false);
  if (!n) return <Missing />;
  return (
    <Page nav={false}>
      <TopBar title="A little note to me" onBack={() => navigate('/reflections')} />
      <div className="px-5 pb-10">
        <article className="relative rounded-[24px] bg-surface p-6 text-ink shadow-[0_18px_40px_-24px_rgba(42,30,44,.35)] ring-1 ring-line">
          <span aria-hidden="true" className="absolute -top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 -rotate-2 rounded-[3px] bg-pink/25" />
          <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">{prettyDate(n.createdAt.slice(0, 10))}</p>
          <p className="mt-5 text-[13px] font-semibold text-accent-text">I’ve been giving myself a hard time about</p>
          <p className="mt-1 text-[17px] leading-relaxed">{n.lookBack}</p>
          <p className="mt-5 text-[13px] font-semibold text-accent-text">What my best friend would say</p>
          <p className="mt-1 text-[17px] leading-relaxed">{n.friendSays}</p>
          <div className="mt-5 rounded-[16px] bg-soft/70 p-4">
            <p className="text-[13px] font-semibold text-accent-text">From here, I’m going to</p>
            <p className="mt-1 font-serif text-[23px] leading-snug">{n.forward}</p>
          </div>
        </article>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Button variant="line" onClick={() => { updateNote(n.id, { pinned: !n.pinned }); toast(n.pinned ? 'Unpinned' : 'Pinned'); }}><Pin size={17} /> {n.pinned ? 'Unpin' : 'Pin'}</Button>
          <Button variant="line" onClick={() => navigate(`/reflections/note/${n.id}/edit`)}><Edit size={17} /> Edit</Button>
          <Button variant="line" onClick={() => setDel(true)}><Trash size={17} /> Delete</Button>
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">No tracking, no follow-up score. Just something to re-read when you need it.</p>
      </div>
      <Confirm open={del} onClose={() => setDel(false)} danger title="Delete this note?" body="It’ll be gone from this device for good." confirmLabel="Delete note" onConfirm={() => { deleteNote(n.id); toast('Note deleted'); navigate('/reflections', { replace: true }); }} />
    </Page>
  );
}

export function ReflectionDetail({ id }: { id: string }) {
  const { data, getAudio, updateReflection, deleteReflection, toast } = useApp();
  const r = data.reflections.find((x) => x.id === id);
  const [url, setUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(r?.body ?? '');
  const [del, setDel] = useState(false);
  useEffect(() => {
    let u: string | null = null;
    if (r?.audioId) getAudio(r.audioId).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u); } });
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [r?.audioId, getAudio]);
  if (!r) return <Missing />;
  const nextLabel = GET_IT_OUT.options.find((o) => o.id === r.guided?.nextStep)?.label;
  return (
    <Page nav={false}>
      <TopBar title={r.type === 'voice' ? 'Voice note' : r.type === 'guided' ? GET_IT_OUT.name : 'Reflection'} onBack={() => navigate('/reflections')} />
      <div className="px-5 pb-10">
        <p className="text-[13px] text-muted">{prettyDate(r.createdAt.slice(0, 10))} · {timeOf(r.createdAt)}{r.state && ` · ${STATE_META[r.state].label}`}</p>
        {r.sample && <p className="mt-2 inline-block rounded-full bg-soft px-2.5 py-0.5 text-[12px]">Sample entry from a demo user{r.audioId ? ' · placeholder audio' : ''}</p>}
        {r.title && <h1 className="mt-3 font-serif text-[32px] leading-tight">{r.title}</h1>}
        {r.prompt && <p className="mt-3 font-serif text-[18px] italic text-accent-text">{r.prompt}</p>}
        {r.audioId && <div className="mt-5"><AudioPlayer src={url} duration={r.durationSec} label={r.title} /></div>}
        {r.guided && (
          <div className="mt-5 space-y-4">
            {r.guided.express && <div><Eyebrow>What came out</Eyebrow><p className="mt-1 text-[17px] leading-relaxed">{r.guided.express}</p></div>}
            {r.guided.noticing && <div><Eyebrow>What I noticed</Eyebrow><p className="mt-1 text-[17px] leading-relaxed">{r.guided.noticing}</p></div>}
            {nextLabel && <div><Eyebrow>One little thing</Eyebrow><p className="mt-1 text-[17px]">{nextLabel}</p></div>}
          </div>
        )}
        {r.type !== 'guided' && (editing ? (
          <div className="mt-5">
            <label htmlFor="eb" className="sr-only">Edit reflection</label>
            <textarea id="eb" rows={8} value={body} onChange={(e) => setBody(e.target.value)} className={field} placeholder={r.type === 'voice' ? 'Add a few words about this voice note' : ''} />
            <div className="mt-3 flex gap-2"><Button variant="ghost" onClick={() => { setEditing(false); setBody(r.body ?? ''); }}>Cancel</Button><Button full onClick={() => { updateReflection(r.id, { body: body.trim() }); setEditing(false); toast('Saved'); }}>Save</Button></div>
          </div>
        ) : r.body ? <p className="mt-5 text-[18px] leading-relaxed whitespace-pre-wrap">{r.body}</p> : null)}
        <div className="mt-8 grid grid-cols-3 gap-2">
          <Button variant="line" onClick={() => { updateReflection(r.id, { pinned: !r.pinned }); toast(r.pinned ? 'Unpinned' : 'Pinned'); }}><Pin size={17} /> {r.pinned ? 'Unpin' : 'Pin'}</Button>
          {r.type !== 'guided' ? <Button variant="line" onClick={() => setEditing(true)}><Edit size={17} /> {r.type === 'voice' ? 'Add note' : 'Edit'}</Button> : <span />}
          <Button variant="line" onClick={() => setDel(true)}><Trash size={17} /> Delete</Button>
        </div>
      </div>
      <Confirm open={del} onClose={() => setDel(false)} danger title="Delete this reflection?" body={r.audioId ? 'The recording and anything you wrote will be removed from this device.' : 'It’ll be removed from this device for good.'} confirmLabel="Delete" onConfirm={() => { deleteReflection(r.id); toast('Deleted'); navigate('/reflections', { replace: true }); }} />
    </Page>
  );
}

function Missing() {
  return (
    <Page nav={false}>
      <TopBar title="" onBack={() => navigate('/reflections')} />
      <div className="px-5 pt-10 text-center">
        <p className="font-serif text-[26px]">Hmm, can’t find that one.</p>
        <p className="mt-2 text-muted">It might have been deleted.</p>
        <Button className="mt-6" variant="soft" onClick={() => navigate('/reflections')}>Back to reflections</Button>
      </div>
    </Page>
  );
}
