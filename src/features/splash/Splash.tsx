// The opening screen: a short, branded moment every time the app opens.
// Nina's own photos fan in like prints from a photo booth, then her logo and
// wordmark land underneath. Shown for ~1.8s on launch (skipped for reduced
// motion), and permanently at #/splash so it can be previewed.
const PRINTS = [
  { src: 'images/seawall.jpg', cls: 'splash-print-l', style: { transform: 'translate(-104px, 22px) rotate(-12deg)' } },
  { src: 'images/ski.jpg', cls: 'splash-print-r', style: { transform: 'translate(104px, 22px) rotate(11deg)' } },
  { src: 'images/overlook.jpg', cls: 'splash-print-c', style: { transform: 'translate(0, 0) rotate(-2deg)' } },
];

export function Splash({ leaving = false }: { leaving?: boolean }) {
  return (
    <div
      className={'splash fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden text-white ' + (leaving ? 'splash-out' : '')}
      role="img"
      aria-label="My Friend Nina"
    >
      <div aria-hidden="true" className="splash-glow absolute -top-24 -left-24 size-[380px] rounded-full bg-[#FFB38F] opacity-70 blur-3xl" />
      <div aria-hidden="true" className="splash-glow absolute -right-28 bottom-10 size-[420px] rounded-full bg-[#B98CF0] opacity-60 blur-3xl" style={{ animationDelay: '-4s' }} />

      {/* Nina's prints, fanned */}
      <div aria-hidden="true" className="relative h-[236px] w-full">
        {PRINTS.map((p, i) => (
          <div key={p.src} className="absolute top-0 left-1/2 -ml-[63px]" style={p.style}>
            <figure className={'splash-print bg-white p-[6px] pb-[20px] shadow-[0_18px_34px_-14px_rgba(80,0,35,.55)]'} style={{ animationDelay: `${120 + i * 110}ms` }}>
              <img src={p.src} alt="" className="block h-[156px] w-[114px] object-cover" />
            </figure>
          </div>
        ))}
      </div>

      <div className="relative -mt-2 flex flex-col items-center">
        <img src="nina-n-white.svg" alt="" className="splash-mark size-[84px] rounded-[22px] shadow-[0_20px_40px_-14px_rgba(90,0,40,.55)]" />
        <p className="splash-word mt-6 font-serif text-[40px] leading-none italic tracking-[-0.01em]">my friend nina</p>
        <p className="splash-tag mt-4 font-hand text-[27px] leading-none text-white/90">meet yourself where you are</p>
      </div>

      <p className="splash-tag absolute inset-x-0 bottom-12 text-center text-[12px] font-medium tracking-[0.24em] text-white/75 uppercase" style={{ animationDelay: '600ms' }}>Vancouver · made with love</p>
    </div>
  );
}
