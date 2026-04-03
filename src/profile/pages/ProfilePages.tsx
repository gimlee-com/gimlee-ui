import { Routes, Route } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import MyTicketsPage from './MyTicketsPage';
import UserTicketDetailPage from './UserTicketDetailPage';
import MyReportsPage from './MyReportsPage';

export default function ProfilePages() {
  return (
    <Routes>
      <Route index element={<ProfilePage />} />
      <Route path="tickets" element={<MyTicketsPage />} />
      <Route path="tickets/:ticketId" element={<UserTicketDetailPage />} />
      <Route path="reports" element={<MyReportsPage />} />
    </Routes>
  );
}
