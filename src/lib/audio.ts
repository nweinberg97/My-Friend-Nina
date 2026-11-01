// In-app voice recording via MediaRecorder.
// - Format is detected per browser (iOS Safari records mp4/aac, Chrome webm/opus).
// - Recording only starts on an explicit tap; nothing records in the background.
import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_SECONDS = 180;

export type RecState = 'idle' | 'asking' | 'recording' | 'paused' | 'done' | 'denied' | 'unsupported' | 'error';

export function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const options = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/aac', 'audio/webm', 'audio/ogg;codecs=opus'];
  return options.find((m) => {
    try {
      return MediaRecorder.isTypeSupported(m);
    } catch {
      return false;
    }
  });
}

export function recordingSupported() {
  return typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

export function useRecorder() {
  const [state, setState] = useState<RecState>(recordingSupported() ? 'idle' : 'unsupported');
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  const cleanupStream = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (raf.current) cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    ctx.current?.close().catch(() => {});
    ctx.current = null;
    setLevel(0);
  }, []);

  useEffect(() => () => cleanupStream(), [cleanupStream]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const tick = useCallback(() => {
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) rec.current?.state !== 'inactive' && rec.current?.stop();
        return s + 1;
      });
    }, 1000);
  }, []);

  const start = useCallback(async () => {
    if (!recordingSupported()) return setState('unsupported');
    setState('asking');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const mime = pickMime();
      const r = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
      rec.current = r;
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => {
        const b = new Blob(chunks.current, { type: r.mimeType || mime || 'audio/webm' });
        setBlob(b);
        setUrl(URL.createObjectURL(b));
        setState('done');
        cleanupStream();
      };
      // gentle level meter
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ac = new AC();
        ctx.current = ac;
        const an = ac.createAnalyser();
        an.fftSize = 256;
        ac.createMediaStreamSource(s).connect(an);
        const data = new Uint8Array(an.frequencyBinCount);
        const loop = () => {
          an.getByteTimeDomainData(data);
          let peak = 0;
          for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
          setLevel(Math.min(1, peak / 64));
          raf.current = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        /* meter is decorative */
      }
      r.start(250);
      setSeconds(0);
      setState('recording');
      tick();
    } catch (e) {
      cleanupStream();
      const name = (e as DOMException)?.name;
      setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error');
    }
  }, [cleanupStream, tick]);

  const pause = useCallback(() => {
    if (rec.current?.state === 'recording') {
      rec.current.pause();
      if (timer.current) window.clearInterval(timer.current);
      setState('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (rec.current?.state === 'paused') {
      rec.current.resume();
      tick();
      setState('recording');
    }
  }, [tick]);

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
  }, []);

  const reset = useCallback(() => {
    cleanupStream();
    setBlob(null);
    setUrl(null);
    setSeconds(0);
    setState(recordingSupported() ? 'idle' : 'unsupported');
  }, [cleanupStream]);

  return { state, seconds, blob, url, level, start, pause, resume, stop, reset };
}

export function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// Placeholder audio for demo voice notes: a soft, warm chord as a WAV blob.
// Clearly labelled as sample audio in the UI. Real recordings replace these.
export function placeholderWav(seconds = 6, seed = 0): Blob {
  const rate = 22050;
  const n = rate * seconds;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, n * 2, true);
  const roots = [261.63, 293.66, 329.63, 349.23];
  const f = roots[seed % roots.length];
  const chord = [f, f * 1.25, f * 1.5];
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const env = Math.min(1, t * 2) * Math.min(1, (seconds - t) * 1.5);
    let s = 0;
    chord.forEach((fr, k) => (s += Math.sin(2 * Math.PI * fr * t + k) * (0.18 - k * 0.04)));
    s *= env * (0.7 + 0.3 * Math.sin(2 * Math.PI * 0.3 * t));
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x5fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}
