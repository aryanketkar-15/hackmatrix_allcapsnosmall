import { Bell } from 'lucide-react';
import { Avatar, PrototypeBadge, SearchInput } from '../ui';

/** Top bar. Search and bell are wired in M2.5; the user chip is wired to auth in M2.3. */
export function TopBar() {
  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface px-6">
      <SearchInput className="w-full max-w-md" placeholder="Search for accounts, transactions, employees, customers…" aria-label="Global search" />
      <div className="ml-auto flex items-center gap-4">
        <PrototypeBadge />
        <button type="button" aria-label="Notifications" className="relative rounded-full p-1.5 text-muted hover:bg-page">
          <Bell size={17} />
        </button>
        <div className="flex items-center gap-2.5">
          <Avatar initials="PS" size={30} />
          <div className="leading-tight">
            <p className="text-[13px] font-semibold">Priya Sharma</p>
            <p className="text-[11px] text-muted">Investigator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
