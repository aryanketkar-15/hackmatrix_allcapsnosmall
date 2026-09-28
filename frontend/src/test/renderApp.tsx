import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { appRoutes } from '../routes';
import { AuthProvider } from '../auth/AuthContext';
import { ToastProvider } from '../components/ui';

export function signIn() {
  sessionStorage.setItem('khoji.session', JSON.stringify({ username: 'priya.sharma', signedInAt: '2024-04-30T00:00:00Z' }));
}

/** Render the app at a path. Signed in by default (the demo gate is covered by its own tests). */
export function renderAt(path: string, { signedIn = true }: { signedIn?: boolean } = {}) {
  sessionStorage.clear();
  if (signedIn) signIn();
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const utils = render(
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>,
  );
  return { ...utils, router };
}
