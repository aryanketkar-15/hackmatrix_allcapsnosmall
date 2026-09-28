import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import NotFound from './pages/NotFound';
import Styleguide from './pages/Styleguide';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import Cases from './pages/Cases';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import GraphExplorer from './pages/GraphExplorer';
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
      { path: '/alerts', element: <Alerts /> },
      { path: '/alerts/:id/:tab?', element: <AlertDetail /> },
      { path: '/cases', element: <Cases /> },
      { path: '/customers', element: <Customers /> },
      { path: '/customers/:id/:tab?', element: <CustomerProfile /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/reports', element: <Reports /> },
      { path: '/transactions', element: <Transactions /> },
      { path: '/employees', element: <Employees /> },
      { path: '/employees/:id', element: <EmployeeProfile /> },
      { path: '/graph-explorer', element: <GraphExplorer /> },
      { path: '/settings', element: <Settings /> },
      ...(import.meta.env.DEV || import.meta.env.MODE === 'test' ? [{ path: '/styleguide', element: <Styleguide /> }] : []),
      { path: '*', element: <NotFound /> },
    ],
    }],
  },
];

export const createAppRouter = () => createBrowserRouter(appRoutes);
