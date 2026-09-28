import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DataGate } from './DataGate';
import { FallbackBanner } from '../ui';

export function AppShell() {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <FallbackBanner />
        <main className="min-w-0 flex-1 overflow-y-auto p-6" id="main">
          <DataGate>
            <Outlet />
          </DataGate>
        </main>
      </div>
    </div>
  );
}
