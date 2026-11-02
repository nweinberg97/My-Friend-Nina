import { useEffect, useState } from 'react';
import { useApp } from './lib/store';
import { navigate, useRoute } from './lib/router';
import { BottomNav, Button, Toasts } from './components/ui';
import { Landing } from './features/landing/Landing';
import { Onboarding } from './features/onboarding/Onboarding';
import { Today } from './features/today/Today';
import { Rituals } from './features/rituals/Rituals';
import { Reflections } from './features/reflections/Reflections';
import { GetItOut, NewVoice, NewWrite, NoteDetail, NoteFlow, ReflectionDetail } from './features/reflections/Flows';
import { About, Privacy, Settings, Support } from './features/settings/Settings';
import { Splash } from './features/splash/Splash';

const APP_ROUTES = ['/today', '/rituals', '/reflections', '/settings'];

export function App() {
  const { status, prefs, mood: checkedMood, checkin, startFresh } = useApp();
  // Before today's check-in the app wears the West Coast Studio foundation.
  const mood = checkin ? checkedMood : 'high';
  const full = useRoute();
  const [path, query] = full.split('?');
  const params = new URLSearchParams(query ?? '');
  const isLanding = path === '/';
  const isInfo = ['/about', '/privacy', '/support'].includes(path);

  // Theme: landing is always West Coast Studio; the app follows today's energy.
  useEffect(() => {
    const m = isLanding || path === '/welcome' || (isInfo && !prefs.onboarded) ? 'high' : mood;
    document.documentElement.dataset.mood = m;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#FFF5F3');
  }, [mood, isLanding, isInfo, prefs.onboarded, path]);

  const embedded = window.self !== window.top;
  useEffect(() => {
    if (status === 'ready' && embedded && isLanding) navigate(prefs.onboarded ? '/today' : '/welcome', { replace: true });
  }, [status, embedded, isLanding, prefs.onboarded]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [path]);

  // Opening screen: a short branded moment when the app (not the landing page) opens.
  const [splash, setSplash] = useState<'on' | 'leaving' | 'off'>(() => {
    const h = window.location.hash.replace('#', '') || '/';
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return !reduce && h !== '/' && !h.startsWith('/splash') && !h.startsWith('/about') && !h.startsWith('/privacy') && !h.startsWith('/support') ? 'on' : 'off';
  });
  useEffect(() => {
    if (splash === 'off') return;
    const t = window.setTimeout(() => setSplash(splash === 'on' ? 'leaving' : 'off'), splash === 'on' ? 2100 : 450);
    return () => clearTimeout(t);
  }, [splash]);

  // New users who deep-link into the app go through onboarding first.
  useEffect(() => {
    if (status === 'ready' && !prefs.onboarded && APP_ROUTES.some((r) => path.startsWith(r)) && !path.startsWith('/settings')) navigate('/welcome', { replace: true });
  }, [status, prefs.onboarded, path]);

  if (status === 'loading') {
    return splash !== 'off' ? <Splash /> : <div className="grid min-h-dvh place-items-center"><p className="font-serif text-[22px] italic text-muted">one sec…</p></div>;
  }
  if (status === 'error') {
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-[30px]">Well, that didn’t work.</p>
          <p className="mt-2 text-muted">Your saved data is from a newer version of the app, so we haven’t touched it. Try refreshing, or start fresh on this device.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => window.location.reload()}>Refresh</Button>
            <Button variant="ghost" onClick={async () => { await startFresh(); window.location.hash = '/welcome'; window.location.reload(); }}>Start fresh</Button>
          </div>
        </div>
      </div>
    );
  }

  let page;
  let tabs = false;
  const m = (re: RegExp) => path.match(re);
  if (isLanding && embedded) return null;
  if (isLanding) page = <Landing />;
  else if (path === '/splash') page = <Splash />;
  else if (path === '/welcome') page = <Onboarding />;
  else if (path === '/today') { page = <Today />; tabs = true; }
  else if (path === '/rituals') { page = <Rituals />; tabs = true; }
  else if (path === '/reflections') { page = <Reflections />; tabs = true; }
  else if (path === '/reflections/new/write') page = <NewWrite initialPrompt={params.get('prompt') ?? undefined} />;
  else if (path === '/reflections/new/voice') page = <NewVoice />;
  else if (path === '/reflections/new/get-it-out') page = <GetItOut />;
  else if (path === '/reflections/new/note') page = <NoteFlow />;
  else if (m(/^\/reflections\/note\/([^/]+)\/edit$/)) page = <NoteFlow editId={m(/^\/reflections\/note\/([^/]+)\/edit$/)![1]} />;
  else if (m(/^\/reflections\/note\/([^/]+)$/)) page = <NoteDetail id={m(/^\/reflections\/note\/([^/]+)$/)![1]} />;
  else if (m(/^\/reflections\/([^/]+)$/)) page = <ReflectionDetail id={m(/^\/reflections\/([^/]+)$/)![1]} />;
  else if (path === '/settings') page = <Settings />;
  else if (path === '/about') page = <About />;
  else if (path === '/privacy') page = <Privacy />;
  else if (path === '/support') page = <Support />;
  else page = <Landing />;

  return (
    <>
      {page}
      {tabs && <BottomNav path={path} />}
      {!isLanding && <Toasts />}
      {splash !== 'off' && path !== '/splash' && <Splash leaving={splash === 'leaving'} />}
    </>
  );
}
