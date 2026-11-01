// A staged iPhone on the landing page that runs the real prototype in an
// iframe, plus simulated iOS notification prompts and banners from Nina.
// Notifications here are a demo only: real web push on iPhone needs the
// installed (Add to Home Screen) app.
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../lib/store';
import { cx } from '../../components/ui';

const PHONE_W = 390;
const PHONE_H = 844;

// [DRAFT — NINA TO APPROVE]
const NOTIFICATIONS = [
  { when: 'now', body: 'Morning! How are we showing up today? One tap, that’s it.', to: '/today' },
  { when: 'now', body: 'Low battery kind of day? Tiny counts. One glass of water, done.', to: '/rituals' },
  { when: 'now', body: 'Long day? Want to get it out? I’m listening.', to: '/reflections/new/get-it-out' },
  { when: 'now', body: 'Friendly reminder: rest days count too. No catch-up homework.', to: '/today' },
];

type Perm = 'pending' | 'asking' | 'allowed' | 'denied';

export function PhoneStage() {
  const { prefs, loadDemo } = useApp();
  const frame = useRef<HTMLIFrameElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.86);
  const [src, setSrc] = useState(() => `./?embed=1#${prefs.onboarded ? '/today' : '/welcome'}`);
  const [perm, setPerm] = useState<Perm>('pending');
  const [banner, setBanner] = useState<number | null>(null);
  const [time, setTime] = useState(() => new Date());
  const inFrame = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(0.92, (el.clientWidth - 20) / PHONE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Ask for notifications a few seconds after the phone comes into view.
  useEffect(() => {
    if (perm !== 'pending' || !wrap.current) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = window.setTimeout(() => setPerm('asking'), 3500);
    }, { threshold: 0.6 });
    io.observe(wrap.current);
    return () => { io.disconnect(); if (timer) clearTimeout(timer); };
  }, [perm]);

  // Once allowed, a new banner from Nina every so often.
  useEffect(() => {
    if (perm !== 'allowed') return;
    let i = 0;
    const show = () => {
      setBanner(i % NOTIFICATIONS.length);
      i++;
      window.setTimeout(() => setBanner(null), 6000);
    };
    const first = window.setTimeout(show, 1200);
    const loop = window.setInterval(show, 11000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [perm]);

  const go = (to: string) => {
    const w = frame.current?.contentWindow;
    try {
      if (w) w.location.hash = to;
    } catch {
      setSrc(`./?embed=1#${to}`);
    }
  };

  const restart = (to: string) => setSrc(`./?embed=1&r=${Date.now()}#${to}`);

  if (inFrame) return null;

  const hhmm = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');

  return (
    <div className="flex flex-col items-center gap-5">
      <div ref={wrap} className="w-full max-w-[400px]">
        <div
          className="relative mx-auto overflow-hidden rounded-[54px] border-[10px] border-[#1d1918] bg-black shadow-[0_40px_80px_-30px_rgba(43,38,37,.6)]"
          style={{ width: PHONE_W * scale + 20, height: PHONE_H * scale + 20 }}
        >
          <div style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="relative">
            <iframe ref={frame} src={src} title="My Friend Nina prototype running in an iPhone" className="h-full w-full border-0 bg-[#F9F4EE]" />

            {/* status bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[50px] items-center justify-between px-8 pt-1 text-[15px] font-semibold text-[#2B2625]">
              <span>{hhmm}</span>
              <span className="absolute left-1/2 top-[11px] h-[33px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" /><rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
                <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".5" /></svg>
              </span>
            </div>

            {/* notification banner */}
            {banner !== null && (
              <button
                onClick={() => { go(NOTIFICATIONS[banner].to); setBanner(null); }}
                className="anim-banner absolute top-[54px] right-3 left-3 flex items-start gap-3 rounded-[22px] bg-white/80 p-3 text-left shadow-[0_10px_30px_-10px_rgba(0,0,0,.35)] backdrop-blur-xl"
              >
                <img src="icon.svg" alt="" className="size-[38px] rounded-[9px]" />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between text-[14px]"><span className="font-semibold text-[#111]">My Friend Nina</span><span className="text-[#6b6b6b]">{NOTIFICATIONS[banner].when}</span></span>
                  <span className="block text-[14px] leading-snug text-[#111]">{NOTIFICATIONS[banner].body}</span>
                </span>
              </button>
            )}

            {/* iOS permission alert */}
            {perm === 'asking' && (
              <div className="anim-fade absolute inset-0 grid place-items-center bg-black/30 px-10">
                <div className="anim-pop w-[270px] overflow-hidden rounded-[14px] bg-[#f2f2f2]/95 text-center backdrop-blur-xl" role="alertdialog" aria-label="Notification permission">
                  <div className="px-4 pt-5 pb-4">
                    <p className="text-[17px] leading-tight font-semibold text-[#111]">“My Friend Nina” Would Like to Send You Notifications</p>
                    <p className="mt-1.5 text-[13px] leading-snug text-[#333]">Gentle check-ins from Nina, never guilt trips. You can change this in Settings.</p>
                  </div>
                  <div className="grid grid-cols-2 border-t border-black/15 text-[17px]">
                    <button onClick={() => setPerm('denied')} className="min-h-11 border-r border-black/15 text-[#0a7aff]">Don’t Allow</button>
                    <button onClick={() => setPerm('allowed')} className="min-h-11 font-semibold text-[#0a7aff]">Allow</button>
                  </div>
                </div>
              </div>
            )}

            {/* home indicator */}
            <span className="pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[#2B2625]/80" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-[14px]">
        <button onClick={() => restart('/welcome')} className="min-h-11 rounded-full border border-[#E8E0D8] bg-white px-4 hover:border-pink">Start from welcome</button>
        <button onClick={async () => { await loadDemo(); restart('/today'); }} className="min-h-11 rounded-full border border-[#E8E0D8] bg-white px-4 hover:border-pink">Load sample data</button>
        <button onClick={() => { setBanner(null); setPerm('asking'); }} className={cx('min-h-11 rounded-full px-4 text-white', 'bg-pink hover:bg-pink-deep')}>Show notification prompt</button>
      </div>
      <p className="max-w-sm text-center text-[13px] text-[#6E6761]">
        {perm === 'denied' ? 'No notifications, no problem. Nina’s still here whenever you open the app.' : 'Tap around, it’s the real prototype. Notifications are simulated here; on iPhone, real ones need the app added to your Home Screen.'}
      </p>
    </div>
  );
}
