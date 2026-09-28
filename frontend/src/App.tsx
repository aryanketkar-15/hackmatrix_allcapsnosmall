import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { ToastProvider } from './components/ui';
import { AuthProvider } from './auth/AuthContext';

export default function App() {
  const router = useMemo(() => createAppRouter(), []);
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
