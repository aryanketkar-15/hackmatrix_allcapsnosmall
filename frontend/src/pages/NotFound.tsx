import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export default function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <EmptyState title={`We could not find that ${what}`} hint="Check the address, or go back to the dashboard." />
      <p className="pb-8 text-center text-sm"><Link className="text-primary underline" to="/dashboard">Back to dashboard</Link></p>
    </div>
  );
}
