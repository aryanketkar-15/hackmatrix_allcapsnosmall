import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { ToastProvider } from './components/ui';

export default function App() {
  const router = useMemo(() => createAppRouter(), []);
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
