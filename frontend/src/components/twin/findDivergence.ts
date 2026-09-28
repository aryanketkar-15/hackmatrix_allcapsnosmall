import type { PathStepT } from '../../types/contract';

export interface Divergence { index: number; label: string; attack: string; legitimate: string }

const differs = (a: PathStepT | undefined, b: PathStepT | undefined) =>
  !a || !b || a.artifact !== b.artifact || a.grade !== b.grade || a.integrity !== b.integrity;

/**
 * Index of the first step where the two paths differ (artifact, authorization grade or control integrity).
 * Unequal lengths are padded: a missing step counts as a difference. Returns null when the paths are identical.
 */
export function findDivergence(attack: PathStepT[], twin: PathStepT[]): Divergence | null {
  const n = Math.max(attack.length, twin.length);
  for (let i = 0; i < n; i += 1) {
    if (differs(attack[i], twin[i])) {
      const a = attack[i]; const b = twin[i];
      return {
        index: i,
        label: (a ?? b).label,
        attack: a ? a.artifact : '(no such step)',
        legitimate: b ? b.artifact : '(no such step)',
      };
    }
  }
  return null;
}
