import { WifiOff } from 'lucide-react';
import { useStore } from '../../data/store';

/** Visible whenever the API was unreachable or invalid and the bundled fixtures are in use. */
export function FallbackBanner() {
  const { state } = useStore();
  if (!state.fallback) return null;
  return (
    <div role="status" data-testid="fallback-banner" className="no-print flex items-center gap-2 border-b border-amber-300 bg-amber-50 px-6 py-1.5 text-xs text-amber-900">
      <WifiOff size={13} aria-hidden /> Using offline fixtures: the fixture API is unavailable ({state.fallback}).
    </div>
  );
}
