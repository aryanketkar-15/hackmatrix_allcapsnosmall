import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { appRoutes } from './routes';
import { NAV_ITEMS } from './components/layout/Sidebar';
import { ToastProvider } from './components/ui';

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  return render(<ToastProvider><RouterProvider router={router} /></ToastProvider>);
}

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

  it('shows NotFound for unknown routes', () => {
    renderAt('/xyz');
    expect(screen.getByText(/could not find that page/i)).toBeInTheDocument();
  });

  it('shows the prototype badge on every route', () => {
    for (const p of ['/dashboard', '/settings', '/xyz']) {
      const { unmount } = renderAt(p);
      expect(screen.getByTestId('prototype-badge')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows a clear placeholder for unbuilt screens', () => {
    renderAt('/settings');
    expect(screen.getByText('Not part of this build')).toBeInTheDocument();
  });
});
