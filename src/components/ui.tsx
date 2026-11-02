import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { useApp } from '../lib/store';
import { back, Link, navigate } from '../lib/router';
import { ChevronLeft, Home, Leaf, Book, X, Play, Pause, StateIcon } from './Icons';
import { STATE_META } from '../content/nina';
import type { EnergyState } from '../types';
import { fmtTime } from '../lib/audio';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');
export { cx };

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' | 'line'; full?: boolean };
export function Button({ variant = 'primary', full, className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-[15px] font-medium transition active:scale-[.98] disabled:opacity-40 disabled:active:scale-100',
        variant === 'primary' && 'bg-accent text-accent-ink shadow-[0_6px_18px_-8px_var(--accent)] hover:brightness-105',
        variant === 'soft' && 'bg-soft text-ink hover:brightness-[.98]',
        variant === 'ghost' && 'text-accent-text hover:bg-soft/60',
        variant === 'line' && 'border border-line bg-surface text-ink hover:border-accent',
        full && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-[12px] font-medium tracking-[0.14em] text-muted uppercase', className)}>{children}</p>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-[18px] border border-line bg-surface', className)}>{children}</div>;
}

export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="safe-top sticky top-0 z-20 bg-bg/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3">
        <button onClick={onBack ?? (() => back())} className="grid size-11 place-items-center rounded-full text-ink hover:bg-soft/60" aria-label="Go back">
          <ChevronLeft />
        </button>
        <h1 className="flex-1 truncate text-center font-serif text-[20px]">{title}</h1>
        <div className="flex min-w-11 justify-end">{right}</div>
      </div>
    </div>
  );
}

export function Page({ children, className, nav = true }: { children: ReactNode; className?: string; nav?: boolean }) {
  return (
    <main className={cx('mood-surface relative mx-auto min-h-dvh w-full max-w-[560px]', nav && 'pb-28', className)}>
      {children}
    </main>
  );
}

const TABS = [
  { to: '/today', label: 'Today', Icon: Home },
  { to: '/rituals', label: 'Rituals', Icon: Leaf },
  { to: '/reflections', label: 'Reflections', Icon: Book },
];

export function BottomNav({ path }: { path: string }) {
  return (
    <nav aria-label="Main" className="safe-bottom fixed inset-x-0 bottom-0 z-30">
      {/* frosted band behind the floating bar so text scrolling underneath never shows through around it */}
      <div aria-hidden="true" className="nav-frost pointer-events-none absolute inset-x-0 bottom-0 h-[118px]" />
      <div className="relative mx-auto max-w-[560px] px-4 pb-3">
        <div className="mood-surface flex rounded-[22px] border border-line bg-surface/95 p-1.5 shadow-[0_10px_30px_-12px_rgba(42,30,44,.25)] backdrop-blur-md">
          {TABS.map(({ to, label, Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link key={to} to={to} className={cx('flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] text-[12px] font-medium transition', active ? 'bg-soft text-ink' : 'text-muted hover:text-ink')}>
                <span aria-hidden="true"><Icon size={21} /></span>
                <span>{label}</span>
                {active && <span className="sr-only">(current)</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="anim-rise pointer-events-auto flex max-w-[420px] items-center gap-3 rounded-[16px] bg-ink py-3 pr-2 pl-4 text-[14px] text-bg shadow-lg">
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <button className="rounded-[10px] px-3 py-1.5 font-semibold underline-offset-2 hover:underline" onClick={() => { t.action!.run(); dismissToast(t.id); }}>
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="anim-fade absolute inset-0 bg-[#2A1E2C]/35" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="anim-sheet mood-surface safe-bottom relative max-h-[88dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-surface outline-none">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 px-5 pt-3 pb-2 backdrop-blur">
          <span className="mx-auto mb-1 block h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 grid size-11 place-items-center rounded-full text-muted hover:bg-soft/60" aria-label="Close">
          <X />
        </button>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ open, title, body, confirmLabel, onConfirm, onClose, danger }: { open: boolean; title: string; body: string; confirmLabel: string; onConfirm: () => void; onClose: () => void; danger?: boolean }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <h2 className="mt-2 font-serif text-[26px] leading-tight">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button full onClick={() => { onConfirm(); onClose(); }} className={danger ? '!bg-[#9B1C3A] !text-white' : ''}>{confirmLabel}</Button>
        <Button full variant="ghost" onClick={onClose}>Never mind</Button>
      </div>
    </Sheet>
  );
}

export function EnergySelector({ value, onChange, compact }: { value?: EnergyState; onChange: (s: EnergyState) => void; compact?: boolean }) {
  const states: EnergyState[] = ['high', 'steady', 'low', 'rest'];
  return (
    <div role="radiogroup" aria-label="How are you showing up today?" className="grid grid-cols-4 gap-2">
      {states.map((s) => {
        const on = value === s;
        return (
          <button
            key={s}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s)}
            className={cx(
              'group flex flex-col items-center justify-center gap-1.5 rounded-[16px] border px-1 text-center transition',
              compact ? 'min-h-[72px] py-2' : 'min-h-[96px] py-3',
              on ? 'border-transparent bg-accent text-accent-ink shadow-[0_8px_20px_-10px_var(--accent)]' : 'border-line bg-surface text-ink hover:border-accent',
            )}
          >
            <span className={cx('transition', on && 'anim-pop')}><StateIcon state={s} size={compact ? 20 : 24} /></span>
            <span className="text-[13px] leading-tight font-medium">{STATE_META[s].label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function NinaSig({ className }: { className?: string }) {
  return <span className={cx('font-hand text-[22px] text-accent-text', className)}>— Nina</span>;
}

export function Avatar({ size = 40 }: { size?: number }) {
  return <img src="images/nina-avatar.jpg" alt="" width={size} height={size} className="shrink-0 rounded-full object-cover ring-2 ring-surface" style={{ width: size, height: size }} />;
}

export function AudioPlayer({ src, duration, label }: { src?: string | null; duration?: number; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(duration ?? 0);
  if (!src) return <p className="text-[14px] text-muted">Audio is still loading…</p>;
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-soft/70 p-2 pr-4">
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setT(0); }}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => isFinite(e.currentTarget.duration) && setD(e.currentTarget.duration)}
      />
      <button
        onClick={() => (playing ? ref.current?.pause() : ref.current?.play())}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-ink"
        aria-label={playing ? 'Pause' : `Play ${label ?? 'voice note'}`}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: d ? `${(t / d) * 100}%` : '0%' }} />
      </div>
      <span className="w-10 text-right text-[13px] tabular-nums text-muted">{fmtTime(playing ? t : d)}</span>
    </div>
  );
}

export function Blobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-soft/70 via-soft/25 to-transparent" />
      <div className="anim-drift absolute -top-28 -right-16 size-80 rounded-full bg-glow opacity-80 blur-3xl" />
      <div className="anim-drift absolute top-28 -left-28 size-72 rounded-full bg-glow-2 opacity-70 blur-3xl" style={{ animationDelay: '-6s' }} />
      <div className="anim-drift absolute top-4 left-1/3 size-40 rounded-full bg-accent opacity-[.14] blur-3xl" style={{ animationDelay: '-3s' }} />
    </div>
  );
}

export function Waves({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cx('pointer-events-none overflow-hidden', className)}>
      <svg className="anim-waves h-full w-[200%]" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 30 Q 75 10 150 30 T 300 30 T 450 30 T 600 30 T 750 30 T 900 30 T 1050 30 T 1200 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M0 44 Q 75 28 150 44 T 300 44 T 450 44 T 600 44 T 750 44 T 900 44 T 1050 44 T 1200 44" fill="none" stroke="currentColor" strokeWidth="1" opacity=".5" />
      </svg>
    </div>
  );
}

export function goTab(to: string) {
  navigate(to);
  window.scrollTo({ top: 0 });
}

/* A clear way back to the overview page for people trying the prototype in a
   browser. Hidden inside the landing page's phone and in the installed app. */
export function SiteLink({ className }: { className?: string }) {
  if (typeof window === 'undefined' || window.self !== window.top) return null;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return null;
  return (
    <Link to="/" className={cx('site-link inline-flex min-h-9 items-center gap-1.5 rounded-full bg-surface/85 px-3.5 text-[13px] font-medium text-muted ring-1 ring-line backdrop-blur hover:text-ink', className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      Overview
    </Link>
  );
}
