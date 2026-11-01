// A tiny sparkle burst when something gets done. One small moment, not confetti spam.
import { useEffect, useRef, useState } from 'react';

const COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)'];

export function Burst({ trigger }: { trigger: unknown }) {
  const [key, setKey] = useState(0);
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!trigger) return;
    setKey((k) => k + 1);
    setOn(true);
    const t = setTimeout(() => setOn(false), 700);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!on) return null;
  return (
    <span key={key} aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const style = { '--dx': `${Math.cos(a) * 34}px`, '--dy': `${Math.sin(a) * 34}px`, background: COLORS[i % 3] } as React.CSSProperties;
        return <span key={i} className="anim-burst absolute size-2 rounded-full" style={style} />;
      })}
    </span>
  );
}
