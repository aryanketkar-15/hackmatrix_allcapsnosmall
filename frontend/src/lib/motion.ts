import { useEffect, useState, type CSSProperties } from 'react';

/** jsdom (unit tests) has no layout or animation; keep motion off there so results are immediate and deterministic. */
const isJsdom = () => typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True when JS-driven motion (chart animation, count-up, animated graph layouts) should run. */
export const canAnimate = (): boolean => !isJsdom() && !prefersReducedMotion();

/** Inline animation-delay for staggered lists (capped so long lists do not feel slow). */
export const stagger = (index: number, stepMs = 40, maxSteps = 12): CSSProperties => ({ animationDelay: `${Math.min(index, maxSteps) * stepMs}ms` });

/** Counts up from 0 to `target` (ease-out). Returns the target immediately when motion is off. */
export function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(() => (canAnimate() ? 0 : target));
  useEffect(() => {
    if (!canAnimate()) { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}
