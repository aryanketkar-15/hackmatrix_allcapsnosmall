import type { ReactNode } from 'react';
import {
  LEVEL_LABEL, STATUS_LABEL, TYPE_LABEL, type AlertLevelT, type AlertStatusT, type AlertTypeT,
} from '../../types/contract';
import { LEVEL_STYLE, STATUS_STYLE } from './chipStyles';

export function Chip({ children, fg, bg, className = '', title }: { children: ReactNode; fg: string; bg: string; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${className}`}
      style={{ color: fg, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

/** Risk level chip: always carries its text label (never colour-only). */
export function LevelChip({ level, className }: { level: AlertLevelT; className?: string }) {
  const s = LEVEL_STYLE[level];
  return <Chip fg={s.fg} bg={s.bg} className={className}>{LEVEL_LABEL[level]}</Chip>;
}

export function StatusChip({ status, className }: { status: AlertStatusT; className?: string }) {
  const s = STATUS_STYLE[status];
  return <Chip fg={s.fg} bg={s.bg} className={`!normal-case !tracking-normal !font-medium ${className ?? ''}`}>{STATUS_LABEL[status]}</Chip>;
}

export function TypeChip({ type }: { type: AlertTypeT }) {
  return <span className="text-xs text-ink">{TYPE_LABEL[type]}</span>;
}

export function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />;
}
