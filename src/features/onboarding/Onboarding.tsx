import { useState } from 'react';
import { useApp } from '../../lib/store';
import { navigate } from '../../lib/router';
import { Avatar, Button, EnergySelector, cx } from '../../components/ui';
import { Check, ChevronLeft } from '../../components/Icons';
import { NINA_INTRO } from '../../content/nina';
import { PILLARS } from '../../content/rituals';
import type { EnergyState } from '../../types';

const WANTS = [
  { id: 'move', label: 'Moving my body', pillar: 'move' },
  { id: 'nourish', label: 'Eating and drinking a bit more mindfully', pillar: 'nourish' },
  { id: 'me', label: 'Making time for myself', pillar: 'recharge' },
  { id: 'present', label: 'Feeling more present', pillar: 'connect' },
  { id: 'rhythm', label: 'Finding better everyday rhythms', pillar: 'nourish' },
  { id: 'rest', label: 'Resting without feeling guilty', pillar: 'recharge' },
];

const STEPS = 6;

export function Onboarding() {
  const { prefs, setPrefs, data, saveRitual, setEnergy, toast } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(prefs.name ?? '');
  const [wants, setWants] = useState<string[]>(prefs.wants);
  const [picked, setPicked] = useState<string[]>(() => data.rituals.filter((r) => r.selected && !r.archived).map((r) => r.id));
  const [privacy, setPrivacy] = useState(prefs.privacyAccepted);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const prev = () => (step === 0 ? navigate('/') : setStep((s) => s - 1));

  const finish = (state: EnergyState) => {
    data.rituals.forEach((r) => {
      const sel = picked.includes(r.id);
      if (sel !== r.selected) saveRitual({ ...r, selected: sel });
    });
    setPrefs({ name: name.trim() || undefined, wants, onboarded: true, privacyAccepted: true });
    setEnergy(state);
    navigate('/today', { replace: true });
    toast(state === 'rest' ? 'Rest mode on. Nothing due today.' : 'Checked in. Welcome!');
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="mood-surface relative mx-auto flex min-h-dvh w-full max-w-[560px] flex-col overflow-hidden px-5">
      <div aria-hidden="true" className="anim-drift absolute -top-20 -right-24 size-72 rounded-full bg-glow opacity-60 blur-3xl" />
      <div className="safe-top relative flex h-16 items-center gap-3">
        <button onClick={prev} className="grid size-11 place-items-center rounded-full hover:bg-soft/60" aria-label="Back"><ChevronLeft /></button>
        <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`} role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <span key={i} className={cx('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-accent' : 'bg-line')} />
          ))}
        </div>
        <span className="w-11" />
      </div>

      <div key={step} className="anim-rise relative flex flex-1 flex-col pt-6 pb-8">
        {step === 0 && (
          <>
            <div className="relative mx-auto mt-2 w-full max-w-[300px]">
              <div className="polaroid rotate-[-3deg]"><img src="images/overlook.jpg" alt="Nina on a lookout above the ocean" className="aspect-[4/5] w-full rounded-[3px] object-cover" /></div>
              <span className="absolute -bottom-4 left-4 rotate-[-3deg] rounded-[12px] bg-surface px-3 py-1.5 font-hand text-[24px] text-accent-text shadow">hi friend!</span>
            </div>
            <h1 className="mt-10 font-serif text-[40px] leading-[1.05]">{NINA_INTRO.hello}<br />{NINA_INTRO.welcome}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{NINA_INTRO.body}</p>
            <div className="mt-auto pt-8"><Button full onClick={next}>Let’s go</Button></div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-serif text-[36px] leading-[1.08]">Quick heads up on how this works.</h1>
            <ul className="mt-8 space-y-5">
              {[
                ['Different days look different.', 'You tell me what kind of day it is. The app adjusts. Not the other way round.'],
                ['Small things count.', 'Every ritual has a Full, Small and Tiny version. Tiny is not a consolation prize.'],
                ['You set the bar.', 'No streaks, no red X’s, no “you missed yesterday.” Ever.'],
              ].map(([h, b]) => (
                <li key={h} className="flex gap-4">
                  <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-soft text-accent-text"><Check size={16} /></span>
                  <div><p className="text-[17px] font-medium">{h}</p><p className="mt-1 text-[15px] leading-relaxed text-muted">{b}</p></div>
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-[14px] bg-soft/60 px-4 py-3 text-[13px] leading-relaxed text-muted">Just so you know: I’m a friend, not a professional. This is a lifestyle app, not medical or mental-health advice.</p>
            <div className="mt-auto pt-8"><Button full onClick={next}>Sounds good</Button></div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-serif text-[34px] leading-[1.08]">What would you like a bit more of?</h1>
            <p className="mt-2 text-[15px] text-muted">Pick as many as you like. This just helps me suggest things. Not a quiz.</p>
            <label className="mt-6 text-[14px] font-medium">What should I call you? <span className="font-normal text-muted">(optional)</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="First name or nickname" className="mt-1.5 w-full rounded-[12px] border border-line bg-surface px-4 py-3 text-[16px] outline-none focus:border-accent" />
            </label>
            <div className="mt-5 flex flex-col gap-2">
              {WANTS.map((w) => {
                const on = wants.includes(w.id);
                return (
                  <button key={w.id} aria-pressed={on} onClick={() => setWants(toggle(wants, w.id))} className={cx('flex min-h-14 items-center gap-3 rounded-[14px] border px-4 text-left text-[15px] transition', on ? 'border-accent bg-soft/70' : 'border-line bg-surface hover:border-accent')}>
                    <span className={cx('grid size-6 shrink-0 place-items-center rounded-full border-2', on ? 'border-accent bg-accent text-accent-ink' : 'border-line text-transparent')}><Check size={14} /></span>
                    {w.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto flex gap-2 pt-8">
              <Button variant="ghost" onClick={next}>Skip</Button>
              <Button full onClick={next}>Next</Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-serif text-[34px] leading-[1.08]">Pick a few rituals to start with.</h1>
            <p className="mt-2 text-[15px] text-muted">I’ve picked a starter set. Change anything. You can always add more later.</p>
            <div className="mt-6 space-y-6">
              {PILLARS.map((p) => (
                <div key={p.id}>
                  <p className="text-[12px] font-semibold text-muted">{p.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.rituals.filter((r) => r.pillarId === p.id && !r.archived).map((r) => {
                      const on = picked.includes(r.id);
                      return (
                        <button key={r.id} aria-pressed={on} onClick={() => setPicked(toggle(picked, r.id))} className={cx('inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] transition', on ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface hover:border-accent')}>
                          {on && <Check size={15} />}{r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-8"><Button full onClick={next}>{picked.length ? `Keep these ${picked.length}` : 'Skip for now'}</Button></div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="font-serif text-[34px] leading-[1.08]">Your stuff stays yours.</h1>
            <ul className="mt-6 space-y-4 text-[15px] leading-relaxed">
              <li><strong className="font-medium">Everything lives on this device,</strong> in your browser’s storage. No account, no cloud, nobody reading along.</li>
              <li><strong className="font-medium">Voice notes need your mic,</strong> and I’ll only ask when you tap record. Never in the background.</li>
              <li><strong className="font-medium">You choose what gets saved.</strong> Nothing’s kept until you hit save.</li>
              <li><strong className="font-medium">Export or delete it all</strong> anytime from Settings.</li>
            </ul>
            <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-[14px] border border-line bg-surface p-4">
              <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 size-5 accent-[var(--accent)]" />
              <span className="text-[15px]">Got it. Save my check-ins, rituals and reflections on this device.</span>
            </label>
            <div className="mt-auto pt-8"><Button full disabled={!privacy} onClick={next}>Continue</Button></div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="flex items-center gap-3"><Avatar size={44} /><p className="font-hand text-[24px] text-accent-text">last thing, promise</p></div>
            <h1 className="mt-4 font-serif text-[38px] leading-[1.05]">Okay{name.trim() ? `, ${name.trim()}` : ''}. How are we showing up today?</h1>
            <p className="mt-2 text-[15px] text-muted">There’s no wrong answer. You can change it any time.</p>
            <div className="mt-8"><EnergySelector onChange={finish} /></div>
          </>
        )}
      </div>
    </div>
  );
}
