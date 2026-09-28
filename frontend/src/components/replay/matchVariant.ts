import type { ReplayCandidateT, ReplayT, ReplayVariantT } from '../../types/contract';

type DependencyRole = ReplayCandidateT['role'];

/** Order-insensitive lookup of a precomputed replay variant. Returns undefined when the combination is not precomputed. */
export function matchVariant(variants: ReplayVariantT[], removed: string[]): ReplayVariantT | undefined {
  const key = [...removed].sort().join('|');
  return variants.find((v) => [...v.removed].sort().join('|') === key);
}

export const ROLE_LABEL: Record<DependencyRole, string> = {
  NECESSARY: 'Necessary', JOINTLY_NECESSARY: 'Jointly necessary', CONTRIBUTORY: 'Contributory', CONCEALING: 'Concealing', IRRELEVANT: 'Irrelevant',
};

/** Dependency roles use indigo, not green (deviation C8: green would read as "safe"). */
export const ROLE_STYLE: Record<DependencyRole, { fg: string; bg: string }> = {
  NECESSARY: { fg: '#3730a3', bg: '#e0e7ff' },
  JOINTLY_NECESSARY: { fg: '#3730a3', bg: '#e0e7ff' },
  CONTRIBUTORY: { fg: '#374151', bg: '#e5e7eb' },
  CONCEALING: { fg: '#92400e', bg: '#fef3c7' },
  IRRELEVANT: { fg: '#374151', bg: '#f3f4f6' },
};

export function headlineText(replay: ReplayT): { role: DependencyRole; text: string } {
  const head = replay.candidates[0];
  switch (head.role) {
    case 'NECESSARY':
      return { role: head.role, text: 'Removing this employee action would prevent the transaction path from executing.' };
    case 'JOINTLY_NECESSARY':
      return { role: head.role, text: 'Removing either action alone is not enough; removing them together would prevent the transaction path from executing.' };
    case 'CONCEALING':
      return { role: head.role, text: 'Removing this action would not stop the path, but it prevented the customer from noticing.' };
    default:
      return { role: head.role, text: 'Removing this action would not by itself stop the recorded path.' };
  }
}

/** Why a scenario has no replay (honest, not a fake result). */
export function noReplayReason(kind: string): string {
  switch (kind) {
    case 'GAP': return 'Inconclusive: a critical evidence record is missing, so replay coverage is below the threshold (the affected control is not modelled). The alert abstains until the logs arrive.';
    case 'NEAR_MISS': return 'No replay needed: the transfer was blocked because a genuine control held.';
    default: return 'No employee action is connected to this pattern, so there is nothing to remove.';
  }
}
