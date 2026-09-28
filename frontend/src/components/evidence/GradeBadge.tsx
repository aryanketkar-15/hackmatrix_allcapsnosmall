import { Tooltip } from '../ui';
import type { AuthGradeT } from '../../types/contract';

export const GRADE_TEXT: Record<AuthGradeT, string> = {
  A: 'Customer-verified through a strong channel (V-CIP, biometric at branch, long-standing bound device).',
  B: 'In-person verification by a staff member other than the actor.',
  C: 'Customer document verified by the actor.',
  D: 'Weak evidence: verified by the actor with no independent check.',
  E: 'Authorization source is available but holds no supporting artifact.',
  X: 'Inconsistent: artifact created after the change, self-created, reused or mismatched.',
  U: 'Authorization source unavailable (distinct from “no artifact”).',
};

export function GradeBadge({ grade }: { grade: AuthGradeT | null }) {
  if (!grade) return <span className="text-muted">n/a</span>;
  const bad = grade === 'X' || grade === 'E' || grade === 'D';
  return (
    <Tooltip text={GRADE_TEXT[grade]}>
      <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${bad ? 'bg-red-50 text-risk-high' : grade === 'U' ? 'bg-slate-100 text-slate-700' : 'bg-green-50 text-green-800'}`}>Grade {grade}</span>
    </Tooltip>
  );
}
