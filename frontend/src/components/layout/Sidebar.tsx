import { NavLink } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeftRight, BarChart3, FileText, FolderSearch, IdCard, LayoutDashboard, Network, Settings, Users,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '../ui';

export const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/cases', label: 'Investigations', icon: FolderSearch },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/employees', label: 'Employees', icon: IdCard },
  { to: '/graph-explorer', label: 'Graph Explorer', icon: Network },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="no-print flex w-52 shrink-0 flex-col border-r border-line bg-surface" aria-label="Primary">
      <div className="flex h-14 animate-fade-in items-center px-5"><Logo /></div>
      <nav className="flex flex-col gap-0.5 px-3 pb-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-[0_2px_8px_rgb(37_99_235/0.35)]' : 'text-muted hover:translate-x-0.5 hover:bg-page hover:text-ink'}`
            }
          >
            <Icon size={16} aria-hidden className="transition-transform duration-200 group-hover:scale-110" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
