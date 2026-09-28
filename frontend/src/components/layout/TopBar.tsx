import { useState } from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, PrototypeBadge, SearchInput } from '../ui';
import { useAuth } from '../../auth/AuthContext';

/** Top bar. Search and bell are wired in M2.5. */
export function TopBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface px-6">
      <SearchInput className="w-full max-w-md" placeholder="Search for accounts, transactions, employees, customers…" aria-label="Global search" />
      <div className="ml-auto flex items-center gap-4">
        <PrototypeBadge />
        <button type="button" aria-label="Notifications" className="relative rounded-full p-1.5 text-muted hover:bg-page">
          <Bell size={17} />
        </button>
        <div className="relative">
          <button type="button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="flex items-center gap-2.5 rounded-md p-1 hover:bg-page">
            <Avatar initials={user?.initials ?? '?'} size={30} />
            <span className="text-left leading-tight">
              <span className="block text-[13px] font-semibold">{user?.name ?? 'Signed out'}</span>
              <span className="block text-[11px] text-muted">{user?.role ?? ''}</span>
            </span>
            <ChevronDown size={14} className="text-muted" aria-hidden />
          </button>
          {menu ? (
            <div role="menu" className="absolute right-0 z-40 mt-1 w-40 rounded-md border border-line bg-surface py-1 shadow-lg">
              <button role="menuitem" type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-page"
                onClick={() => { signOut(); navigate('/login', { replace: true }); }}>
                <LogOut size={14} aria-hidden /> Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
