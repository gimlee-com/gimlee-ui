import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import MyTicketsPage from './MyTicketsPage';
import UserTicketDetailPage from './UserTicketDetailPage';
import MyReportsPage from './MyReportsPage';

const PendingReviewsPage = lazy(() => import('../../ratings/pages/PendingReviewsPage'));
const MyReviewsPage = lazy(() => import('../../ratings/pages/MyReviewsPage'));

export default function ProfilePages() {
  return (
    <Routes>
      <Route index element={<ProfilePage />} />
      <Route path="tickets" element={<MyTicketsPage />} />
      <Route path="tickets/:ticketId" element={<UserTicketDetailPage />} />
      <Route path="reports" element={<MyReportsPage />} />
      <Route path="reviews" element={<Suspense fallback={<div uk-spinner="" />}><MyReviewsPage /></Suspense>} />
      <Route path="reviews/pending" element={<Suspense fallback={<div uk-spinner="" />}><PendingReviewsPage /></Suspense>} />
    </Routes>
  );
}
