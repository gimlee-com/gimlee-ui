import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Spinner } from './uikit/Spinner/Spinner';
import { Alert } from './uikit/Alert/Alert';

interface ProtectedRouteProps {
  requiredRole?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, roles, loading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (loading) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle uk-height-large">
        <Spinner ratio={2} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const requiredRoles = requiredRole
    ? Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    : [];

  if (requiredRoles.length > 0 && !requiredRoles.some((r) => roles.includes(r))) {
    return (
      <div className="uk-flex uk-flex-center uk-flex-middle uk-height-large">
        <div className="uk-text-center">
          <h2 className="uk-heading-small">{t('admin.forbidden.title')}</h2>
          <Alert variant="danger">
            {t('admin.forbidden.message')}
          </Alert>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
