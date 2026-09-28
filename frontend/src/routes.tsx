import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import NotFound from './pages/NotFound';
import Placeholder from './pages/Placeholder';
import Styleguide from './pages/Styleguide';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { ProtectedRoute } from './auth/ProtectedRoute';

/** Full route table. Screens built in later milestones replace their placeholder here. */
export const appRoutes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [{
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/alerts', element: <Placeholder title="Alerts" /> },
      { path: '/alerts/:id/:tab?', element: <Placeholder title="Alert" /> },
      { path: '/cases', element: <Placeholder title="Investigations" /> },
      { path: '/customers', element: <Placeholder title="Customers" /> },
      { path: '/customers/:id/:tab?', element: <Placeholder title="Customer" /> },
      { path: '/analytics', element: <Placeholder title="Analytics" /> },
      { path: '/reports', element: <Placeholder title="Reports" /> },
      { path: '/transactions', element: <Placeholder title="Transactions" /> },
      { path: '/employees', element: <Placeholder title="Employees" /> },
      { path: '/employees/:id', element: <Placeholder title="Employee" /> },
      { path: '/graph-explorer', element: <Placeholder title="Graph Explorer" /> },
      { path: '/settings', element: <Placeholder title="Settings" /> },
      ...(import.meta.env.DEV || import.meta.env.MODE === 'test' ? [{ path: '/styleguide', element: <Styleguide /> }] : []),
      { path: '*', element: <NotFound /> },
    ],
    }],
  },
];

export const createAppRouter = () => createBrowserRouter(appRoutes);
