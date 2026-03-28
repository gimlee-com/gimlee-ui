import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserStatus } from '../../types/adminUser';

const statusClassMap: Record<UserStatus, string> = {
  ACTIVE: 'uk-label-success',
  PENDING_VERIFICATION: 'uk-label-warning',
  BANNED: 'uk-label-danger',
  SUSPENDED: 'uk-label',
};

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.users.status.${status}`);
  const badgeClass = statusClassMap[status] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default UserStatusBadge;
