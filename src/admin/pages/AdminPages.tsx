import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AdminDashboardPage from './AdminDashboardPage';
import CategoryManagementPage from './categories/CategoryManagementPage';
import AdminUserListPage from './users/AdminUserListPage';
import AdminUserDetailPage from './users/AdminUserDetailPage';
import ReportListPage from './reports/ReportListPage';
import ReportDetailPage from './reports/ReportDetailPage';
import TicketListPage from './helpdesk/TicketListPage';
import TicketDetailPage from './helpdesk/TicketDetailPage';

const AdminRatingsPage = lazy(() => import('../../ratings/pages/AdminRatingsPage'));

export default function AdminPages() {
  return (
    <Routes>
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="users" element={<AdminUserListPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />
      </Route>
      <Route element={<ProtectedRoute requiredRole={['ADMIN', 'SUPPORT']} />}>
        <Route path="reports" element={<ReportListPage />} />
        <Route path="reports/:reportId" element={<ReportDetailPage />} />
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
        <Route path="ratings" element={<Suspense fallback={<div uk-spinner="" />}><AdminRatingsPage /></Suspense>} />
      </Route>
    </Routes>
  );
}
