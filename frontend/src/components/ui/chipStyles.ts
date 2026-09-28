import type { AlertLevelT, AlertStatusT } from '../../types/contract';

/** Foreground/background pairs for chips. Kept as data so contrast can be unit-tested (≥ 4.5:1). */
export const LEVEL_STYLE: Record<AlertLevelT, { fg: string; bg: string; dot: string }> = {
  HIGH: { fg: '#b91c1c', bg: '#fee2e2', dot: '#dc2626' },
  MEDIUM: { fg: '#9a3412', bg: '#ffedd5', dot: '#ea580c' },
  WATCH: { fg: '#854d0e', bg: '#fef9c3', dot: '#ca8a04' },
  NEAR_MISS: { fg: '#5b21b6', bg: '#ede9fe', dot: '#7c3aed' },
  DATA_GAP: { fg: '#374151', bg: '#e5e7eb', dot: '#6b7280' },
  INFO: { fg: '#166534', bg: '#dcfce7', dot: '#16a34a' },
};

export const STATUS_STYLE: Record<AlertStatusT, { fg: string; bg: string }> = {
  NEW: { fg: '#1d4ed8', bg: '#dbeafe' },
  UNDER_REVIEW: { fg: '#9a3412', bg: '#ffedd5' },
  ASSIGNED: { fg: '#5b21b6', bg: '#ede9fe' },
  INVESTIGATING: { fg: '#854d0e', bg: '#fef3c7' },
  PENDING_EVIDENCE: { fg: '#9d174d', bg: '#fce7f3' },
  DECIDED: { fg: '#0f766e', bg: '#ccfbf1' },
  CLOSED: { fg: '#374151', bg: '#e5e7eb' },
};
