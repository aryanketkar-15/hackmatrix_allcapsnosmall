import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react';
import beats from './demo-beats.json';
import { demoCredentials, useAuth } from '../auth/AuthContext';

export interface Beat { id: string; title: string; narrator: string; path: string; say: string }
export const BEATS = beats as Beat[];

const KEY = 'khoji.demo';
const HIDE = 'khoji.demo.hide';
export const BEAT_MS = 9000;

interface DemoState { active: boolean; index: number; playing: boolean }
const read = (): DemoState => {
  try { const raw = sessionStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw) as DemoState; if (p.active && Number.isInteger(p.index)) return p; } } catch { /* ignore */ }
  return { active: false, index: 0, playing: false };
};
const write = (s: DemoState) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } };

/** Root layout route: renders the app and, while a demo is active, a keyboard-driven beat controller. */
export function DemoLayout() {
  const navigate = useNavigate();
  const loc = useLocation();
  const { user, signIn, signOut } = useAuth();
  const [state, setState] = useState<DemoState>(read);

  // `/demo` starts (or restarts) the scripted walkthrough
  useEffect(() => {
    if (loc.pathname === '/demo') {
      const params = new URLSearchParams(loc.search);
      try { if (params.get('hide') === '1') sessionStorage.setItem(HIDE, '1'); else sessionStorage.removeItem(HIDE); } catch { /* ignore */ }
      const next = { active: true, index: 0, playing: false };
      write(next); setState(next);
      navigate(BEATS[0].path, { replace: true });
    }
  }, [loc.pathname, loc.search, navigate]);

  const go = useCallback((i: number) => {
    const index = Math.max(0, Math.min(BEATS.length - 1, i));
    const next = { ...read(), active: true, index };
    write(next); setState(next);
    if (index === 0 && user) signOut(); // restart shows the login screen again
    if (index >= 1 && !user) { const c = demoCredentials(); signIn(c.username, c.password, false); }
    navigate(BEATS[index].path);
  }, [navigate, signIn, signOut, user]);

  const setPlaying = (playing: boolean) => { const n = { ...read(), active: true, playing }; write(n); setState(n); };
  const stop = () => { const n = { active: false, index: 0, playing: false }; write(n); setState(n); };

  // one listener for the lifetime of the layout; it always reads the latest state through refs (no gap between renders)
  const live = useRef({ state, go });
  live.current = { state, go };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { state: st, go: goto } = live.current;
      if (!st.active) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goto(st.index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goto(st.index - 1); }
      else if (e.key === ' ') { e.preventDefault(); const n = { ...read(), active: true, playing: !st.playing }; write(n); setState(n); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); const n = { ...read(), active: true, playing: false }; write(n); setState(n); goto(0); }
      else if (e.key === 'Escape') { const n = { active: false, index: 0, playing: false }; write(n); setState(n); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // fixed-timer auto-advance while playing (no randomness anywhere)
  useEffect(() => {
    if (!state.active || !state.playing) return;
    if (state.index >= BEATS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => go(state.index + 1), BEAT_MS);
    return () => clearTimeout(t);
  }, [state.active, state.playing, state.index, go]);

  let hidden = false;
  try { hidden = sessionStorage.getItem(HIDE) === '1'; } catch { /* ignore */ }
  const beat = BEATS[state.index];

  return (
    <>
      <Outlet />
      {state.active && !hidden ? (
        <div role="region" aria-label="Demo controller" data-testid="demo-controller"
          className="no-print fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-ink/95 px-4 py-2 text-xs text-white shadow-xl">
          <button type="button" aria-label="Previous beat" onClick={() => go(state.index - 1)} className="rounded p-1 hover:bg-white/10"><ChevronLeft size={14} /></button>
          <button type="button" aria-label={state.playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!state.playing)} className="rounded p-1 hover:bg-white/10">{state.playing ? <Pause size={14} /> : <Play size={14} />}</button>
          <button type="button" aria-label="Next beat" onClick={() => go(state.index + 1)} className="rounded p-1 hover:bg-white/10"><ChevronRight size={14} /></button>
          <span data-testid="demo-beat" className="min-w-52">Beat {state.index + 1}/{BEATS.length} · {beat.title} · {beat.narrator}</span>
          <button type="button" aria-label="Restart" onClick={() => { setPlaying(false); go(0); }} className="rounded p-1 hover:bg-white/10"><RotateCcw size={13} /></button>
          <button type="button" aria-label="Exit demo" onClick={stop} className="rounded p-1 hover:bg-white/10"><X size={13} /></button>
        </div>
      ) : null}
    </>
  );
}
