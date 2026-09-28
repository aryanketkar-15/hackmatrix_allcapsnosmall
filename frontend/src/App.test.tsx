import { screen } from '@testing-library/react';
import { NAV_ITEMS } from './components/layout/Sidebar';
import { dataReady, renderAt } from './test/renderApp';

describe('app shell', () => {
  it('renders the 10 navigation items with the expected labels', () => {
    renderAt('/dashboard');
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('a')).toHaveLength(10);
    expect(NAV_ITEMS.map((n) => n.label)).toEqual([
      'Dashboard', 'Alerts', 'Investigations', 'Transactions', 'Customers', 'Employees', 'Graph Explorer', 'Analytics', 'Reports', 'Settings',
    ]);
  });

  it('marks the current route as active', () => {
    renderAt('/alerts');
    expect(screen.getByRole('link', { name: 'Alerts' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('shows NotFound for unknown routes', async () => {
    renderAt('/xyz');
    await dataReady();
    expect(screen.getByText(/could not find that page/i)).toBeInTheDocument();
  });

  it('shows the prototype badge on every route', () => {
    for (const p of ['/dashboard', '/settings', '/xyz']) {
      const { unmount } = renderAt(p);
      expect(screen.getByTestId('prototype-badge')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows a clear placeholder for unbuilt screens', async () => {
    renderAt('/settings');
    await dataReady();
    expect(screen.getByText('Not part of this build')).toBeInTheDocument();
  });
});
