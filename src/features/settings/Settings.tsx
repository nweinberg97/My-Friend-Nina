import { useState, type ReactNode } from 'react';
import { useApp } from '../../lib/store';
import { Link, navigate } from '../../lib/router';
import { Avatar, Button, Confirm, Eyebrow, Page, TopBar, cx } from '../../components/ui';
import { ChevronRight, Download, LifeBuoy, Sparkle, Trash, Undo, Heart, Book } from '../../components/Icons';

function Row({ children, onClick, to, danger }: { children: ReactNode; onClick?: () => void; to?: string; danger?: boolean }) {
  const cls = cx('flex min-h-14 w-full items-center gap-3 px-4 text-left text-[15px] hover:bg-soft/40', danger && 'text-[#9B1C3A]');
  const inner = <>{children}<ChevronRight size={18} className="ml-auto text-muted" /></>;
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button onClick={onClick} className={cls}>{inner}</button>;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <Eyebrow className="mb-2 px-1">{title}</Eyebrow>
      <div className="divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-surface">{children}</div>
    </section>
  );
}

export function Settings() {
  const { prefs, setPrefs, exportData, loadDemo, startFresh, deleteEverything, toast, data, storageWarning } = useApp();
  const [confirm, setConfirm] = useState<null | 'demo' | 'fresh' | 'delete'>(null);
  const [name, setName] = useState(prefs.name ?? '');

  return (
    <Page nav={false}>
      <TopBar title="Settings" onBack={() => navigate('/today')} />
      <div className="px-5 pb-12">
        <div className="flex items-center gap-3 rounded-[18px] bg-soft/70 p-4">
          <Avatar size={44} />
          <p className="text-[14px] leading-snug">Everything here lives on this device. No account, no cloud. <span className="text-muted">Your data, your call.</span></p>
        </div>
        {storageWarning && <p className="mt-4 rounded-[14px] bg-[#FDE8EE] p-4 text-[14px] text-[#7A1230]">Heads up: your browser didn’t let us save everything. Private browsing or full storage can do this. Export your data to keep a copy.</p>}

        <Group title="You">
          <form className="flex items-center gap-3 px-4 py-3" onSubmit={(e) => { e.preventDefault(); setPrefs({ name: name.trim() || undefined }); toast('Saved'); }}>
            <label htmlFor="nm" className="text-[15px]">Name</label>
            <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" maxLength={30} className="min-h-11 flex-1 rounded-[10px] bg-bg px-3 text-[16px] outline-none focus:ring-2 focus:ring-accent/40" />
            <Button type="submit" variant="soft" className="min-h-10 px-4">Save</Button>
          </form>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4">
            <Sparkle size={18} className="text-accent-text" />
            <span className="flex-1 text-[15px]">Show “Little moments”<span className="block text-[13px] text-muted">A gentle look back. No streaks either way.</span></span>
            <input type="checkbox" role="switch" checked={prefs.littleMoments} onChange={(e) => setPrefs({ littleMoments: e.target.checked })} className="size-6 accent-[var(--accent)]" />
          </label>
        </Group>

        <Group title="Your data">
          <Row onClick={async () => { await exportData(); toast('Export downloading'); }}><Download size={18} /> Export everything<span className="text-[13px] text-muted">JSON + audio</span></Row>
          <Row onClick={() => setConfirm('delete')} danger><Trash size={18} /> Delete everything</Row>
          <p className="px-4 py-3 text-[13px] text-muted">{Object.keys(data.checkins).length} check-ins · {data.reflections.length} reflections · {data.notes.length} notes · {data.completions.length} rituals done</p>
        </Group>

        <Group title="Demo">
          <Row onClick={() => setConfirm('demo')}><Undo size={18} /> Reset demo experience<span className="text-[13px] text-muted">3 weeks of sample data</span></Row>
          <Row onClick={() => setConfirm('fresh')}><Sparkle size={18} /> Start fresh<span className="text-[13px] text-muted">Empty, from onboarding</span></Row>
        </Group>

        <Group title="About">
          <Row to="/about"><Heart size={18} /> About Nina &amp; this app</Row>
          <Row to="/privacy"><Book size={18} /> Privacy</Row>
          <Row to="/support"><LifeBuoy size={18} /> Need more support?</Row>
          <Row to="/"><Sparkle size={18} /> Back to the landing page</Row>
        </Group>

        <p className="mt-8 text-center text-[12px] text-muted">My Friend Nina · prototype v0.1 · All Nina copy is draft until she approves it.</p>
      </div>

      <Confirm open={confirm === 'demo'} onClose={() => setConfirm(null)} title="Reset the demo?" body="This replaces what’s on this device with three weeks of sample data from a made-up user, so you can show the app off. Anything you’ve saved will be replaced." confirmLabel="Load sample data" onConfirm={async () => { await loadDemo(); toast('Demo loaded'); navigate('/today'); }} />
      <Confirm open={confirm === 'fresh'} onClose={() => setConfirm(null)} title="Start fresh?" body="Clears everything on this device and takes you back to the welcome screens." confirmLabel="Start fresh" onConfirm={async () => { await startFresh(); navigate('/welcome', { replace: true }); }} />
      <Confirm open={confirm === 'delete'} danger onClose={() => setConfirm(null)} title="Delete everything?" body="This permanently removes every check-in, ritual, reflection, note and voice recording from this device. It can’t be undone. Export first if you want a copy." confirmLabel="Delete everything" onConfirm={async () => { try { await deleteEverything(); toast('All gone. Fresh start whenever you like.'); navigate('/', { replace: true }); } catch { toast("Something went wrong. Some data may still be there. Try again?"); } }} />
    </Page>
  );
}

function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  const { prefs } = useApp();
  return (
    <Page nav={false}>
      <TopBar title={title} onBack={() => navigate(prefs.onboarded ? '/settings' : '/')} />
      <div className="prose-sm px-5 pb-14 text-[16px] leading-relaxed">{children}</div>
    </Page>
  );
}

export function About() {
  return (
    <InfoPage title="About">
      <img src="images/overlook.jpg" alt="Nina on a rocky lookout above the ocean" className="aspect-[16/10] w-full rounded-[22px] object-cover" />
      <h1 className="mt-6 font-serif text-[32px] leading-tight">Hey, it’s Nina.</h1>
      <p className="mt-3">This is my little corner of the internet for the days you’re crushing it, the days you’re just getting through, and every couch-and-soup day in between. Check in, pick a tiny thing, get stuff off your chest. That’s it.</p>
      <p className="mt-3 text-[13px] text-muted">[Draft intro, written for Nina to rewrite in her own words. We haven’t made up any facts about her life.]</p>
      <h2 className="mt-8 font-serif text-[24px]">The honest disclaimer</h2>
      <p className="mt-2">My Friend Nina is a lifestyle and self-care companion: everyday encouragement, ideas and a bit of company from a friend. It isn’t professional care. It isn’t medical, nutritional or mental-health advice, and it doesn’t diagnose, treat or replace your doctor, a counsellor or other professional help. If you need more than a friend’s nudge, please reach out to someone qualified to help.</p>
      <Link to="/support" className="mt-3 inline-flex min-h-11 items-center gap-2 font-medium text-accent-text"><LifeBuoy size={18} /> Need more support?</Link>
      <h2 className="mt-8 font-serif text-[24px]">About this prototype</h2>
      <p className="mt-2">This is an early interactive prototype. Photos are placeholders pending Nina’s approved assets, sample data belongs to a made-up demo user, and all of Nina’s copy is a draft until she signs off.</p>
    </InfoPage>
  );
}

export function Privacy() {
  return (
    <InfoPage title="Privacy">
      <h1 className="font-serif text-[32px] leading-tight">Your stuff stays on your device.</h1>
      <ul className="mt-5 list-disc space-y-3 pl-5">
        <li><strong>No account, no server.</strong> Check-ins, rituals, reflections and notes are stored in your browser (IndexedDB and local storage).</li>
        <li><strong>Voice notes</strong> only record when you tap the button, and the audio is saved on this device. Your mic is never used in the background.</li>
        <li><strong>No analytics, no AI reading your entries,</strong> and nothing tries to guess your mood. You choose your energy state yourself.</li>
        <li><strong>Nothing is saved until you hit save.</strong> Drafts you walk away from are thrown out.</li>
        <li><strong>Export or delete</strong> everything anytime in Settings.</li>
        <li>Clearing your browser data, or private browsing, can remove what’s stored. Export now and then if it matters to you.</li>
      </ul>
      <p className="mt-6 text-[14px] text-muted">A full privacy and legal review would happen before any public launch.</p>
    </InfoPage>
  );
}

export function Support() {
  return (
    <InfoPage title="Need more support?">
      <h1 className="font-serif text-[32px] leading-tight">You don’t have to figure it all out alone.</h1>
      <p className="mt-3">Nina’s here for the everyday, but she isn’t a substitute for professional help. If things feel like more than a rough day, please talk to someone who can really help.</p>
      <div className="mt-6 space-y-3">
        <a href="tel:988" className="block rounded-[18px] border border-line bg-surface p-4 hover:border-accent">
          <p className="text-[13px] text-muted">Canada · call or text, 24/7</p>
          <p className="font-serif text-[26px]">9-8-8</p>
          <p className="text-[14px] text-muted">Suicide Crisis Helpline</p>
        </a>
        <a href="tel:811" className="block rounded-[18px] border border-line bg-surface p-4 hover:border-accent">
          <p className="text-[13px] text-muted">British Columbia · health advice line</p>
          <p className="font-serif text-[26px]">8-1-1</p>
          <p className="text-[14px] text-muted">HealthLink BC</p>
        </a>
        <a href="tel:911" className="block rounded-[18px] border border-line bg-surface p-4 hover:border-accent">
          <p className="text-[13px] text-muted">If you’re in immediate danger</p>
          <p className="font-serif text-[26px]">9-1-1</p>
        </a>
      </div>
      <p className="mt-6 text-[14px]">Outside Canada? Your local emergency number or a crisis line in your country is the right first call.</p>
      <p className="mt-3 text-[13px] text-muted">Prototype note: numbers and links are region-specific and should be verified before launch.</p>
    </InfoPage>
  );
}
