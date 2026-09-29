import type { ReactNode } from 'react';
import { ErrorBoundary, ErrorPanel, LoadingState } from '../ui';
import { useStore } from '../../data/store';

/** Renders children only when the fixtures loaded and validated; otherwise a visible loading/error state. */
export function DataGate({ children }: { children: ReactNode }) {
  const { state } = useStore();
  if (state.phase === 'loading') return <LoadingState label="Loading scenario data…" />;
  if (state.phase === 'error') {
    return <ErrorPanel title="Could not load data" message={state.error ?? 'Unknown error'} onRetry={() => window.location.reload()} />;
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
