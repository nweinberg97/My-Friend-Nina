// Tiny hash router — works on any static host with no rewrite rules.
import { useEffect, useState, type ReactNode, type MouseEvent, type CSSProperties } from 'react';

function current() {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = '#' + to;
  if (opts.replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function back(fallback = '/today') {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback, { replace: true });
}

export function useRoute() {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const on = () => setPath(current());
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
    };
  }, []);
  return path;
}

export function Link({ to, className, children, ariaLabel, onClick, style }: { to: string; className?: string; children: ReactNode; ariaLabel?: string; onClick?: () => void; style?: CSSProperties }) {
  return (
    <a
      href={'#' + to}
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
