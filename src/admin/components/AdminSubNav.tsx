import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminSubNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isDashboardActive = location.pathname === '/admin';
  const isCategoriesActive = location.pathname.startsWith('/admin/categories');

  return (
    <div className="uk-margin-medium-bottom">
      <ul uk-tab="">
        <li className={isDashboardActive ? 'uk-active' : ''}>
          <Link to="/admin">{t('admin.dashboard')}</Link>
        </li>
        <li className={isCategoriesActive ? 'uk-active' : ''}>
          <Link to="/admin/categories">{t('admin.categories.title')}</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSubNav;
