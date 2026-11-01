import { useEffect } from 'react';
import { MAX_SECONDS, fmtTime, useRecorder } from '../lib/audio';
import { AudioPlayer, Button, cx } from './ui';
import { Mic, Pause, Play, Stop, Trash } from './Icons';

export function Recorder({ onChange, compact }: { onChange: (blob: Blob | null, seconds: number) => void; compact?: boolean }) {
  const r = useRecorder();
  useEffect(() => { onChange(r.state === 'done' ? r.blob : null, r.seconds); }, [r.state, r.blob]); // eslint-disable-line

  if (r.state === 'unsupported') {
    return <p className="rounded-[14px] bg-soft/70 p-4 text-[15px]">This browser can’t record audio, sadly. Writing it down works just as well, though.</p>;
  }
  if (r.state === 'denied') {
    return (
      <div className="rounded-[14px] bg-soft/70 p-4 text-[15px]">
        <p className="font-medium">No mic access, no problem.</p>
        <p className="mt-1 text-muted">If you want voice notes later, allow the microphone for this site in your browser settings. For now, you can type it out.</p>
        <Button variant="ghost" className="mt-2 min-h-10 px-0" onClick={r.reset}>Try again</Button>
      </div>
    );
  }
  if (r.state === 'error') {
    return (
      <div className="rounded-[14px] bg-soft/70 p-4 text-[15px]">
        <p>Well, that didn’t work. Your mic might be busy with another app.</p>
        <Button variant="ghost" className="mt-2 min-h-10 px-0" onClick={r.reset}>Try again</Button>
      </div>
    );
  }
  if (r.state === 'done') {
    return (
      <div className="flex flex-col gap-3">
        <AudioPlayer src={r.url} duration={r.seconds} />
        <Button variant="ghost" className="min-h-10 self-start px-2" onClick={() => { r.reset(); onChange(null, 0); }}><Trash size={17} /> Record again</Button>
      </div>
    );
  }

  const live = r.state === 'recording' || r.state === 'paused';
  return (
    <div className={cx('flex flex-col items-center rounded-[22px] border border-line bg-surface', compact ? 'py-5' : 'py-8')}>
      <div className="flex h-10 items-end gap-1" aria-hidden="true">
        {Array.from({ length: 21 }).map((_, i) => {
          const amp = r.state === 'recording' ? Math.max(0.12, r.level * (0.5 + 0.5 * Math.sin(i * 1.3 + r.seconds))) : 0.12;
          return <span key={i} className="w-1 rounded-full bg-accent transition-[height] duration-100" style={{ height: `${amp * 40}px`, opacity: 0.35 + amp * 0.65 }} />;
        })}
      </div>
      <p className="mt-3 font-serif text-[34px] tabular-nums" aria-live="off">{fmtTime(r.seconds)}</p>
      <p className="text-[13px] text-muted">{r.state === 'asking' ? 'Asking for your mic…' : r.state === 'paused' ? 'Paused' : live ? `Recording · up to ${MAX_SECONDS / 60} min` : 'Tap to start. Only records while you’re here.'}</p>
      <div className="mt-5 flex items-center gap-4">
        {live && (
          <button onClick={r.state === 'paused' ? r.resume : r.pause} className="grid size-12 place-items-center rounded-full border border-line bg-bg" aria-label={r.state === 'paused' ? 'Resume recording' : 'Pause recording'}>
            {r.state === 'paused' ? <Play size={18} /> : <Pause size={18} />}
          </button>
        )}
        <button
          onClick={live ? r.stop : r.start}
          disabled={r.state === 'asking'}
          className={cx('grid size-[72px] place-items-center rounded-full bg-accent text-accent-ink shadow-lg transition active:scale-95', r.state === 'recording' && 'anim-rec')}
          aria-label={live ? 'Stop recording' : 'Start recording'}
        >
          {live ? <Stop size={26} /> : <Mic size={28} />}
        </button>
        {live && <span className="size-12" />}
      </div>
    </div>
  );
}
