import type { AlertStatusT } from '../../types/contract';

/**
 * Case / alert workflow:
 * NEW → UNDER_REVIEW → ASSIGNED → INVESTIGATING ⇄ PENDING_EVIDENCE → DECIDED → CLOSED
 * (NEW may also be assigned directly; assignment implies review.)
 */
const NEXT: Record<AlertStatusT, AlertStatusT[]> = {
  NEW: ['UNDER_REVIEW', 'ASSIGNED'],
  UNDER_REVIEW: ['ASSIGNED'],
  ASSIGNED: ['INVESTIGATING'],
  INVESTIGATING: ['PENDING_EVIDENCE', 'DECIDED'],
  PENDING_EVIDENCE: ['INVESTIGATING', 'DECIDED'],
  DECIDED: ['CLOSED'],
  CLOSED: [],
};

export const nextStatuses = (from: AlertStatusT): AlertStatusT[] => NEXT[from];
export const canTransition = (from: AlertStatusT, to: AlertStatusT): boolean => NEXT[from].includes(to);

export function transitionError(from: AlertStatusT, to: AlertStatusT): string | null {
  if (canTransition(from, to)) return null;
  if (from === 'CLOSED') return 'This case is closed and cannot be changed.';
  return `A case cannot move from ${from.replace('_', ' ').toLowerCase()} to ${to.replace('_', ' ').toLowerCase()}. Allowed next steps: ${NEXT[from].map((s) => s.replace('_', ' ').toLowerCase()).join(', ') || 'none'}.`;
}

export const NOTE_MAX = 5000;
