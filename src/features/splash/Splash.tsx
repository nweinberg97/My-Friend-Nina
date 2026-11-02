// The opening screen: a short, branded moment every time the app opens.
// Shown for ~1.6s on launch (skipped for reduced motion), and permanently at
// #/splash so it can be previewed.
export function Splash({ leaving = false }: { leaving?: boolean }) {
  return (
    <div
      className={'splash fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden text-white ' + (leaving ? 'splash-out' : '')}
      role="img"
      aria-label="My Friend Nina"
    >
      <div aria-hidden="true" className="splash-glow absolute -top-24 -left-24 size-[380px] rounded-full bg-[#FFB38F] opacity-70 blur-3xl" />
      <div aria-hidden="true" className="splash-glow absolute -right-28 bottom-10 size-[420px] rounded-full bg-[#B98CF0] opacity-60 blur-3xl" style={{ animationDelay: '-4s' }} />
      <div aria-hidden="true" className="absolute top-1/3 left-1/2 size-[300px] -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <img src="nina-n-white.svg" alt="" className="splash-mark size-[116px] rounded-[30px] shadow-[0_26px_50px_-16px_rgba(90,0,40,.55)]" />
        <p className="splash-word mt-8 font-serif text-[40px] leading-none italic tracking-[-0.01em]">my friend nina</p>
        <p className="splash-tag mt-4 font-hand text-[27px] leading-none text-white/90">meet yourself where you are</p>
      </div>

      <p className="splash-tag absolute inset-x-0 bottom-12 text-center text-[12px] font-medium tracking-[0.24em] text-white/75 uppercase" style={{ animationDelay: '500ms' }}>Vancouver · made with love</p>
    </div>
  );
}
