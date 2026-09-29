import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DataGate } from './DataGate';
import { FallbackBanner } from '../ui';

export function AppShell() {
  const { pathname } = useLocation();
  // pages fade in on navigation; sub-tabs of the same page (/alerts/:id/:tab) keep the page mounted
  const routeKey = pathname.split('/').slice(0, 3).join('/');
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <FallbackBanner />
        <main className="min-w-0 flex-1 overflow-y-auto p-6" id="main">
          <DataGate>
            <div key={routeKey} className="animate-fade-up"><Outlet /></div>
          </DataGate>
        </main>
      </div>
    </div>
  );
}
