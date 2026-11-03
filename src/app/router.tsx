import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { NAV_ITEMS } from '@/app/navigation';
import { AppLayout } from '@/app/layouts/AppLayout';
import { RequirePermission } from '@/app/guards/RequirePermission';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { SectionPlaceholderPage } from '@/app/pages/SectionPlaceholderPage';
import { AuthGate } from '@/features/auth/AuthGate';
import { RosterPage } from '@/features/roster/RosterPage';

const sectionRoutes: RouteObject[] = NAV_ITEMS.map((item) => {
  const page = item.key === 'dashboard' ? <DashboardPage /> : <SectionPlaceholderPage sectionKey={item.key} />;
  const element = <RequirePermission action={item.action}>{page}</RequirePermission>;
  return item.path === '/' ? { index: true, element } : { path: item.path.slice(1), element };
});

export const router = createBrowserRouter([
  {
    path: '/roster',
    element: <AuthGate>{(member) => <RosterPage member={member} />}</AuthGate>,
  },
  {
    path: '/',
    element: <AuthGate>{() => <AppLayout />}</AuthGate>,
    children: [...sectionRoutes, { path: '*', element: <NotFoundPage /> }],
  },
]);
