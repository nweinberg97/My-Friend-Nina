// A staged iPhone on the landing page. It starts on a home screen, a nudge
// from Nina arrives as a notification, and tapping it opens the real
// prototype (running in an iframe) right where the nudge points.
// Notifications are simulated: real web push on iPhone needs the installed
// (Add to Home Screen) app.
import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  { when: 'now', body: 'Evening check-in. How did today treat you? No wrong answers.', to: '/today' },
];

type Perm = 'pending' | 'soft' | 'when' | 'asking' | 'confirmed' | 'allowed' | 'later' | 'denied';

const WHEN = [
  { id: 'morning', label: 'Mornings, around 9', confirm: 'I’ll say hi around 9am.', first: 0 },
  { id: 'evening', label: 'Evenings, around 8', confirm: 'I’ll check in around 8pm.', first: 4 },
  { id: 'low', label: 'Only on low battery days', confirm: 'I’ll only pop up on low battery days.', first: 1 },
];

const WALLPAPER =
  'radial-gradient(90% 55% at 12% 8%, #FF8DB8 0%, rgba(255,141,184,0) 70%),' +
  'radial-gradient(80% 50% at 95% 30%, #FFB98F 0%, rgba(255,185,143,0) 70%),' +
  'radial-gradient(90% 60% at 20% 85%, #B79CF5 0%, rgba(183,156,245,0) 70%),' +
  'radial-gradient(70% 45% at 90% 95%, #7FB2FF 0%, rgba(127,178,255,0) 70%),' +
  'linear-gradient(165deg, #FF5C98 0%, #FF9D86 45%, #9C7FEA 100%)';

// Generic, unbranded app tiles for the home screen
function Tile({ bg, label, children, dock }: { bg: string; label?: string; children: ReactNode; dock?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="grid size-[62px] place-items-center rounded-[15px] text-white shadow-[0_4px_10px_-4px_rgba(0,0,0,.3)]" style={{ background: bg }}>{children}</span>
      {!dock && label && <span className="text-[12px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,.25)]">{label}</span>}
    </div>
  );
}
const g = (d: string) => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

export function PhoneStage() {
  const { prefs, loadDemo } = useApp();
  const frame = useRef<HTMLIFrameElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.86);
  const [src, setSrc] = useState(() => `./?embed=1#${prefs.onboarded ? '/today' : '/welcome'}`);
  const [screen, setScreen] = useState<'home' | 'app'>('home');
  const [origin, setOrigin] = useState('50% 10%');
  const appLayer = useRef<HTMLDivElement>(null);
  const [perm, setPerm] = useState<Perm>('pending');
  const [banner, setBanner] = useState<number | null>(null);
  const [next, setNext] = useState(0);
  const [when, setWhen] = useState(0);
  const [seen, setSeen] = useState(false);
  const [time, setTime] = useState(() => new Date());
  const inFrame = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(0.92, (el.clientWidth - 30) / PHONE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // The story starts when the phone scrolls into view.
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.5 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  // On the home screen, a nudge from Nina arrives and waits to be tapped.
  useEffect(() => {
    if (!seen || screen !== 'home' || banner !== null || perm === 'denied' || perm === 'later') return;
    const t = window.setTimeout(() => setBanner(next % NOTIFICATIONS.length), 2200);
    return () => clearTimeout(t);
  }, [seen, screen, banner, next, perm]);

  // First time in the app, Nina asks (softly) whether she can keep doing that.
  useEffect(() => {
    if (screen !== 'app' || perm !== 'pending') return;
    const t = window.setTimeout(() => setPerm('soft'), 5000);
    return () => clearTimeout(t);
  }, [screen, perm]);

  // After a yes: confirm, then leave you in the app. The next nudge arrives
  // whenever you go back to the home screen yourself.
  useEffect(() => {
    if (perm !== 'confirmed') return;
    const t = window.setTimeout(() => {
      setPerm('allowed');
      setNext(WHEN[when].first + 1);
    }, 2600);
    return () => clearTimeout(t);
  }, [perm, when]);

  const route = (to: string) => {
    try {
      const w = frame.current?.contentWindow;
      if (w) { w.location.hash = to; return; }
    } catch { /* fall through */ }
    setSrc(`./?embed=1#${to}`);
  };

  const open = (to: string | null, from: string) => {
    if (to) route(to);
    setOrigin(from);
    const el = appLayer.current;
    if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.transformOrigin = from;
      el.animate([{ transform: 'scale(.12)', opacity: 0, borderRadius: '60px' }, { transform: 'none', opacity: 1, borderRadius: '0px' }], { duration: 460, easing: 'cubic-bezier(.2,.85,.25,1)' });
    }
    setBanner(null);
    setScreen('app');
  };

  const goHome = () => { setBanner(null); setScreen('home'); };

  if (inFrame) return null;

  const hhmm = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
  const day = time.toLocaleDateString([], { weekday: 'long' });
  const home = screen === 'home';

  return (
    <div className="flex flex-col items-center gap-5">
      <div ref={wrap} className="w-full max-w-[400px]">
        {/* titanium rim, side buttons, black bezel, glass */}
        <div
          className="relative mx-auto rounded-[60px] p-[3px] shadow-[0_50px_90px_-35px_rgba(42,30,44,.65),0_18px_30px_-18px_rgba(42,30,44,.45)]"
          style={{ width: PHONE_W * scale + 30, height: PHONE_H * scale + 30, background: 'linear-gradient(140deg,#F4E9EC 0%,#B9AEB2 22%,#FBF5F6 46%,#A69A9F 70%,#E7DCE0 100%)' }}
        >
          <span aria-hidden="true" className="absolute top-[118px] -left-[3px] h-[30px] w-[4px] rounded-l-[3px]" style={{ background: 'linear-gradient(90deg,#9E9297,#E3D8DC)' }} />
          <span aria-hidden="true" className="absolute top-[172px] -left-[3px] h-[58px] w-[4px] rounded-l-[3px]" style={{ background: 'linear-gradient(90deg,#9E9297,#E3D8DC)' }} />
          <span aria-hidden="true" className="absolute top-[244px] -left-[3px] h-[58px] w-[4px] rounded-l-[3px]" style={{ background: 'linear-gradient(90deg,#9E9297,#E3D8DC)' }} />
          <span aria-hidden="true" className="absolute top-[200px] -right-[3px] h-[92px] w-[4px] rounded-r-[3px]" style={{ background: 'linear-gradient(270deg,#9E9297,#E3D8DC)' }} />
          <div className="h-full w-full rounded-[57px] bg-[#0A0A0C] p-[9px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.08)]">
            <div className="relative overflow-hidden rounded-[48px] bg-black" style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
              <div style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="relative">

                {/* ---------- home screen ---------- */}
                <div className="absolute inset-0" style={{ background: WALLPAPER }} aria-hidden={!home}>
                  <div className="absolute inset-x-0 top-[62px] px-6">
                    {/* widgets */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex h-[158px] flex-col justify-between rounded-[22px] bg-white/90 p-4 text-[#2A1E2C] shadow-[0_8px_24px_-12px_rgba(0,0,0,.35)]">
                        <span className="text-[12px] font-semibold tracking-wide text-[#E6005C] uppercase">{day}</span>
                        <span className="font-serif text-[46px] leading-none">{time.getDate()}</span>
                        <span className="text-[13px] leading-tight text-[#6E5F6C]">Seawall walk<br />with Jess, 5pm</span>
                      </div>
                      <button onClick={() => open('/today', '25% 18%')} tabIndex={home ? 0 : -1} className="flex h-[158px] flex-col justify-between rounded-[22px] bg-[#FFF5F3]/95 p-4 text-left text-[#2A1E2C] shadow-[0_8px_24px_-12px_rgba(0,0,0,.35)]">
                        <span className="flex items-center gap-2"><img src="images/nina-avatar.jpg" alt="" className="size-7 rounded-full object-cover" /><span className="text-[12px] font-semibold text-[#C4004E]">Nina</span></span>
                        <span className="font-hand text-[22px] leading-[1.05]">tiny counts today. promise.</span>
                        <span className="text-[11px] text-[#6E5F6C]">Tap to check in</span>
                      </button>
                    </div>
                    {/* apps */}
                    <div className="mt-6 grid grid-cols-4 gap-y-5">
                      <Tile bg="linear-gradient(160deg,#FFD66B,#FF9F43)" label="Photos">{g('M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M5.6 18.4l3.5-3.5M14.9 9.1l3.5-3.5')}</Tile>
                      <Tile bg="linear-gradient(160deg,#9AA5B1,#5E6A78)" label="Camera">{g('M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')}</Tile>
                      <Tile bg="linear-gradient(160deg,#6FD3A7,#2FA57B)" label="Maps">{g('M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14')}</Tile>
                      <Tile bg="linear-gradient(160deg,#7FB2FF,#3D7BEA)" label="Weather">{g('M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z')}</Tile>
                      <Tile bg="linear-gradient(160deg,#FFE58F,#F7C948)" label="Notes">{g('M6 3h12v18H6zM9 8h6M9 12h6M9 16h4')}</Tile>
                      <Tile bg="linear-gradient(160deg,#FF7AA8,#F43F76)" label="Music">{g('M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z')}</Tile>
                      <Tile bg="linear-gradient(160deg,#B79CF5,#7A57D1)" label="Fitness">{g('M3 12h4l3-7 4 14 3-7h4')}</Tile>
                      <button onClick={() => open(null, '87% 42%')} tabIndex={home ? 0 : -1} aria-label="Open My Friend Nina" className="flex flex-col items-center gap-1.5">
                        <span className="relative">
                          <img src="icon.svg" alt="" className="size-[62px] rounded-[15px] shadow-[0_4px_10px_-4px_rgba(0,0,0,.3)]" />
                          {perm === 'allowed' && <span className="absolute -top-1.5 -right-1.5 grid size-[22px] place-items-center rounded-full bg-[#FF3B30] text-[12px] font-semibold text-white">1</span>}
                        </span>
                        <span className="text-[12px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,.25)]">Nina</span>
                      </button>
                    </div>
                  </div>
                  {/* search pill + dock */}
                  <div className="absolute inset-x-0 bottom-[118px] flex justify-center"><span className="rounded-full bg-white/25 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">⌕ Search</span></div>
                  <div className="absolute inset-x-3 bottom-3 flex h-[92px] items-center justify-around rounded-[34px] bg-white/25 backdrop-blur-xl">
                    <Tile dock bg="linear-gradient(160deg,#6EE38E,#2DBE5A)">{g('M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z')}</Tile>
                    <Tile dock bg="linear-gradient(160deg,#6EE38E,#2DBE5A)">{g('M4 5h16v11H9l-5 4z')}</Tile>
                    <Tile dock bg="linear-gradient(160deg,#8EC5FF,#3A86F7)">{g('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z')}</Tile>
                    <Tile dock bg="linear-gradient(160deg,#FF8E8E,#F04A4A)">{g('M4 7h16v13H4zM4 11h16M9 3v4M15 3v4')}</Tile>
                  </div>
                </div>

                {/* ---------- the app (always mounted, so it keeps its state) ---------- */}
                <div ref={appLayer} className={cx('absolute inset-0 overflow-hidden bg-[#FFF5F3]', home && 'invisible')} style={{ transformOrigin: origin }}>
                  <iframe ref={frame} src={src} title="My Friend Nina prototype running in an iPhone" className="h-full w-full border-0" tabIndex={home ? -1 : 0} />
                </div>

                {/* status bar */}
                <div className={cx('pointer-events-none absolute inset-x-0 top-0 flex h-[50px] items-center justify-between px-8 pt-1 text-[15px] font-semibold transition-colors', home ? 'text-white' : 'text-[#2A1E2C]')}>
                  <span className="w-[54px] text-center">{hhmm}</span>
                  <span className="absolute left-1/2 top-[11px] h-[33px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
                  <span className="flex items-center gap-1.5" aria-hidden="true">
                    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" /><rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
                    <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" /><rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".5" /></svg>
                  </span>
                </div>

                {/* notification banner */}
                {banner !== null && (
                  <button
                    onClick={() => { setNext(banner + 1); open(NOTIFICATIONS[banner].to, '50% 9%'); }}
                    className="anim-banner absolute top-[54px] right-3 left-3 flex items-start gap-3 rounded-[24px] bg-white/75 p-3.5 text-left shadow-[0_14px_34px_-12px_rgba(0,0,0,.45)] backdrop-blur-2xl"
                  >
                    <img src="icon.svg" alt="" className="size-[40px] rounded-[10px]" />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between text-[15px]"><span className="font-semibold text-[#111]">My Friend Nina</span><span className="text-[13px] text-[#6b6b6b]">{NOTIFICATIONS[banner].when}</span></span>
                      <span className="block text-[15px] leading-snug text-[#111]">{NOTIFICATIONS[banner].body}</span>
                    </span>
                  </button>
                )}


                {/* Nina asks first, in her own voice (soft pre-permission) */}
                {!home && (perm === 'soft' || perm === 'when' || perm === 'confirmed') && (
                  <div className="anim-fade absolute inset-0 flex items-end bg-[#2A1E2C]/25">
                    <div className="anim-sheet w-full rounded-t-[30px] bg-white px-6 pt-4 pb-10 text-[#2A1E2C] shadow-[0_-10px_40px_-10px_rgba(0,0,0,.25)]">
                      <span className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-[#F2DDE5]" />
                      {perm === 'soft' && (
                        <>
                          <div className="flex items-center gap-3"><img src="images/nina-avatar.jpg" alt="" className="size-11 rounded-full object-cover" /><p className="font-hand text-[24px] text-[#C4004E]">quick question</p></div>
                          <p className="mt-3 font-serif text-[27px] leading-[1.12]">Liked that little nudge? Want one from me now and then?</p>
                          <p className="mt-2 text-[15px] leading-relaxed text-[#6E5F6C]">One gentle check-in a day, max. No guilt trips, no “you missed yesterday.” Ever.</p>
                          <div className="mt-5 flex flex-col gap-2">
                            <button onClick={() => setPerm('when')} className="min-h-12 rounded-[14px] bg-[#E6005C] text-[16px] font-medium text-white">Yes please</button>
                            <button onClick={() => setPerm('later')} className="min-h-12 rounded-[14px] text-[16px] text-[#C4004E]">Not right now</button>
                          </div>
                        </>
                      )}
                      {perm === 'when' && (
                        <>
                          <p className="font-serif text-[27px] leading-[1.12]">When’s good for you?</p>
                          <p className="mt-1 text-[15px] text-[#6E5F6C]">You can change this anytime in Settings.</p>
                          <div className="mt-4 flex flex-col gap-2">
                            {WHEN.map((w, i) => (
                              <button key={w.id} onClick={() => { setWhen(i); setPerm('asking'); }} className="min-h-12 rounded-[14px] border border-[#F2DDE5] bg-white px-4 text-left text-[16px] hover:border-[#E6005C]">{w.label}</button>
                            ))}
                          </div>
                        </>
                      )}
                      {perm === 'confirmed' && (
                        <div className="anim-pop text-center">
                          <p className="font-serif text-[27px] leading-[1.12]">Done. {WHEN[when].confirm}</p>
                          <p className="mt-2 text-[15px] text-[#6E5F6C]">Never more than once a day. Ignore me anytime, I won’t take it personally.</p>
                          <p className="mt-2 font-hand text-[24px] text-[#C4004E]">— Nina</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* the real iOS permission alert, only after Nina has asked */}
                {!home && perm === 'asking' && (
                  <div className="anim-fade absolute inset-0 grid place-items-center bg-black/30 px-10">
                    <div className="anim-pop w-[270px] overflow-hidden rounded-[14px] bg-[#f2f2f2]/95 text-center backdrop-blur-xl" role="alertdialog" aria-label="Notification permission">
                      <div className="px-4 pt-5 pb-4">
                        <p className="text-[17px] leading-tight font-semibold text-[#111]">“My Friend Nina” Would Like to Send You Notifications</p>
                        <p className="mt-1.5 text-[13px] leading-snug text-[#333]">Notifications may include alerts, sounds and icon badges. These can be configured in Settings.</p>
                      </div>
                      <div className="grid grid-cols-2 border-t border-black/15 text-[17px]">
                        <button onClick={() => setPerm('denied')} className="min-h-11 border-r border-black/15 text-[#0a7aff]">Don’t Allow</button>
                        <button onClick={() => setPerm('confirmed')} className="min-h-11 font-semibold text-[#0a7aff]">Allow</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* home indicator: swipe up (tap) to go home */}
                <button onClick={goHome} disabled={home} aria-label="Go to home screen" className="absolute bottom-0 left-1/2 flex h-6 w-[180px] -translate-x-1/2 items-end justify-center pb-2">
                  <span className={cx('h-[5px] w-[134px] rounded-full', home ? 'bg-white/90' : 'bg-[#2A1E2C]/80')} />
                </button>
              </div>
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[48px]" style={{ background: 'linear-gradient(118deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 32%)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] font-medium">
        <button onClick={goHome} disabled={home} className="min-h-11 text-pink-deep underline decoration-pink/40 underline-offset-4 disabled:opacity-40">Home screen</button>
        <button onClick={async () => { await loadDemo(); setSrc(`./?embed=1&r=${Date.now()}#/today`); open(null, '50% 50%'); }} className="min-h-11 text-pink-deep underline decoration-pink/40 underline-offset-4">Fill it with sample data</button>
        <button onClick={() => { setPerm('pending'); setNext(0); setBanner(null); setSrc(`./?embed=1&r=${Date.now()}#${prefs.onboarded ? '/today' : '/welcome'}`); setScreen('home'); }} className="min-h-11 text-pink-deep underline decoration-pink/40 underline-offset-4">Start over</button>
      </div>
      <p className="max-w-sm text-center text-[13px] text-[#6E5F6C]">
        {perm === 'denied' || perm === 'later' ? 'No notifications, no problem. Nina’s still here whenever you open the app, and you can turn nudges on later in Settings.' : perm === 'allowed' && !home ? 'Nudges are on. Keep exploring, then tap the bar at the bottom to go home and see the next one arrive.' : 'It’s the real prototype, tap anything. Swipe up (or tap the bar at the bottom) to go home. Notifications are simulated here.'}
      </p>
    </div>
  );
}
