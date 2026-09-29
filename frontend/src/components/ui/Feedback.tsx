import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, Loader2 } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="animate-fade-in space-y-5 py-4" aria-busy="true">
      <p className="flex items-center gap-2 text-sm text-muted"><Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden /> {label}</p>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[92px] border border-line" />)}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_22rem]" aria-hidden>
        <div className="skeleton h-64 border border-line" />
        <div className="skeleton h-64 border border-line" />
      </div>
    </div>
  );
}

export function ErrorPanel({ title = 'Something went wrong', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto my-10 max-w-lg animate-fade-up rounded-lg border border-red-200 bg-red-50 p-5 text-sm">
      <p className="mb-1 flex items-center gap-2 font-semibold text-risk-high"><AlertOctagon size={16} aria-hidden /> {title}</p>
      <p className="break-words text-ink">{message}</p>
      {onRetry ? <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>Try again</Button> : null}
    </div>
  );
}

interface BoundaryState { error: Error | null }

/** Contains render crashes so the app shell stays visible. */
export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, BoundaryState> {
  state: BoundaryState = { error: null };
  static getDerivedStateFromError(error: Error): BoundaryState { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('UI error:', error, info.componentStack); }
  render() {
    if (this.state.error) {
      return <ErrorPanel title={this.props.label ?? 'This section failed to render'} message={this.state.error.message} onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
