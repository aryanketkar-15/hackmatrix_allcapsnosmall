import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { appRoutes } from '../routes';
import { AuthProvider } from '../auth/AuthContext';
import { ToastProvider } from '../components/ui';
import { StoreProvider } from '../data/store';
import { testLoader } from './fixtures';

export function signIn() {
  sessionStorage.setItem('khoji.session', JSON.stringify({ username: 'priya.sharma', signedInAt: '2024-04-30T00:00:00Z' }));
}

/** Render the app at a path with the real fixtures. Signed in by default (the gate has its own tests). */
export function renderAt(path: string, { signedIn = true }: { signedIn?: boolean } = {}) {
  sessionStorage.clear();
  if (signedIn) signIn();
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const utils = render(
    <AuthProvider>
      <ToastProvider>
        <StoreProvider loader={testLoader()}>
          <RouterProvider router={router} />
        </StoreProvider>
      </ToastProvider>
    </AuthProvider>,
  );
  return { ...utils, router };
}

/** Wait for the data gate to open (fixtures loaded and validated). */
export async function dataReady() {
  await waitFor(() => expect(screen.queryByText('Loading scenario data…')).not.toBeInTheDocument(), { timeout: 5000 });
}
