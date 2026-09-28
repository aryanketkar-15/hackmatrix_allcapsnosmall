import { EmptyState } from '../components/ui';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{title}</h1>
      <div className="rounded-lg border border-line bg-surface">
        <EmptyState title="Not part of this build" hint="This screen is planned for the second half of the project." />
      </div>
    </div>
  );
}
