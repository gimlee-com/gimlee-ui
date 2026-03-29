import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const AdminSubNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { roles } = useAuth();

  const isAdmin = roles.includes('ADMIN');

  const isDashboardActive = location.pathname === '/admin';
  const isCategoriesActive = location.pathname.startsWith('/admin/categories');
  const isUsersActive = location.pathname.startsWith('/admin/users');
  const isReportsActive = location.pathname.startsWith('/admin/reports');
  const isHelpdeskActive = location.pathname.startsWith('/admin/tickets');

  return (
    <div className="uk-margin-medium-bottom">
      <ul uk-tab="">
        <li className={isDashboardActive ? 'uk-active' : ''}>
          <Link to="/admin">{t('admin.dashboard')}</Link>
        </li>
        {isAdmin && (
          <li className={isCategoriesActive ? 'uk-active' : ''}>
            <Link to="/admin/categories">{t('admin.categories.title')}</Link>
          </li>
        )}
        {isAdmin && (
          <li className={isUsersActive ? 'uk-active' : ''}>
            <Link to="/admin/users">{t('admin.users.title')}</Link>
          </li>
        )}
        <li className={isReportsActive ? 'uk-active' : ''}>
          <Link to="/admin/reports">{t('admin.reports.title')}</Link>
        </li>
        <li className={isHelpdeskActive ? 'uk-active' : ''}>
          <Link to="/admin/tickets">{t('admin.helpdesk.title')}</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSubNav;
