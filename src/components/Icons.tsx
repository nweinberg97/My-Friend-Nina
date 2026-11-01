// Restrained line icon set (Lucide-style, 1.75 stroke). Inline so the
// prototype has no icon dependency.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });

export const Sun = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const Steady = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 12c2.5-3 5-3 7.5 0s5 3 7.5 0 2.5-1.5 3-1.5" /><path d="M3 17c2.5-2 5-2 7.5 0s5 2 7.5 0" opacity=".5" /></svg>);
export const Battery = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="2.5" y="7" width="16" height="10" rx="2.5" /><path d="M21.5 10.5v3" /><path d="M6 10.5v3" strokeWidth="2.5" /></svg>);
export const Moon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>);
export const Home = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></svg>);
export const Leaf = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" /><path d="M5 19c3-4 6-7 10-9" /></svg>);
export const Book = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /><path d="M9 7h6" /></svg>);
export const Settings = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg>);
export const Check = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12.5 10 17l9-10" /></svg>);
export const Plus = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const X = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ChevronLeft = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m15 5-7 7 7 7" /></svg>);
export const ChevronRight = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m9 5 7 7-7 7" /></svg>);
export const Mic = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
export const Pen = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>);
export const Wind = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 8h11a3 3 0 1 0-3-3" /><path d="M3 12h16a3 3 0 1 1-3 3" /><path d="M3 16h7" /></svg>);
export const Heart = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 20s-7-4.5-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.5-9 9-9 9z" /></svg>);
export const Pin = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M9 3h6l-1 6 4 4H6l4-4z" /><path d="M12 13v8" /></svg>);
export const Play = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" /></svg>);
export const Pause = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M8 5v14M16 5v14" strokeWidth="3" /></svg>);
export const Stop = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none" /></svg>);
export const Trash = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>);
export const Search = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const Undo = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>);
export const Archive = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v10h14V9M10 13h4" /></svg>);
export const Download = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>);
export const Sparkle = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z" /></svg>);
export const LifeBuoy = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" /></svg>);
export const Arrow = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Edit = Pen;

import type { EnergyState } from '../types';
export function StateIcon({ state, size }: { state: EnergyState; size?: number }) {
  if (state === 'high') return <Sun size={size} />;
  if (state === 'steady') return <Steady size={size} />;
  if (state === 'low') return <Battery size={size} />;
  return <Moon size={size} />;
}

export const Droplet = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></svg>);
export const Shoe = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 16v-5l4-1 3 3 5 1 5 2v2H3z" /><path d="M7 10V6M3 19h18" /></svg>);
export const Chat = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10h8" /></svg>);

import type { PillarId } from '../types';
export function PillarIcon({ pillar, size }: { pillar: PillarId; size?: number }) {
  if (pillar === 'nourish') return <Droplet size={size} />;
  if (pillar === 'move') return <Shoe size={size} />;
  if (pillar === 'connect') return <Chat size={size} />;
  return <Moon size={size} />;
}
