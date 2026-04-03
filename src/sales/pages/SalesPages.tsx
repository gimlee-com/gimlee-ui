import { Routes, Route } from 'react-router-dom';
import SalesAdsPage from './SalesAdsPage';
import CreateAdPage from './CreateAdPage';
import EditAdPage from './EditAdPage';
import SalesOrdersPage from './SalesOrdersPage';

export default function SalesPages() {
  return (
    <Routes>
      <Route path="ads" element={<SalesAdsPage />} />
      <Route path="ads/create" element={<CreateAdPage />} />
      <Route path="ads/edit/:id" element={<EditAdPage />} />
      <Route path="orders" element={<SalesOrdersPage />} />
    </Routes>
  );
}
