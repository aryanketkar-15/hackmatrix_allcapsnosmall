import type { ReactNode } from 'react';
import type { AlertT } from '../../types/contract';

/** Placeholder seam: the real Assign / Reassign dialog and status menu arrive with the case workflow (M5.1). */
export function AssignControl({ fallback }: { alert: AlertT; fallback: ReactNode }) {
  return <>{fallback}</>;
}
