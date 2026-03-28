import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Image } from '../../../components/Image/Image';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import UserStatusBadge from '../../components/UserStatusBadge/UserStatusBadge';
import type { AdminUserListItemDto } from '../../types/adminUser';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
} as const;

interface AdminUserCardProps {
  user: AdminUserListItemDto;
}

const AdminUserCard: React.FC<AdminUserCardProps> = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const registeredDate = new Date(user.registeredAt / 1000).toLocaleDateString();

  return (
    <motion.div variants={itemVariants} layout>
      <Link
        to={`/admin/users/${user.userId}`}
        state={{ from: location.pathname + location.search }}
        className="uk-link-reset"
      >
        <div className="uk-card uk-card-default uk-card-hover uk-card-body uk-card-small">
          <div className="uk-flex uk-flex-middle">
            <div className="uk-margin-small-right" style={{ flexShrink: 0 }}>
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={48}
                  height={48}
                  containerClassName="uk-border-circle"
                  containerStyle={{ width: 48, height: 48, overflow: 'hidden' }}
                />
              ) : (
                <GeometricAvatar username={user.username} size={48} />
              )}
            </div>
            <div className="uk-flex-1" style={{ minWidth: 0 }}>
              <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                <span className="uk-text-bold uk-text-truncate">{user.displayName || user.username}</span>
                <UserStatusBadge status={user.status} />
              </div>
              <div className="uk-text-meta uk-text-truncate">
                @{user.username} · {user.email}
              </div>
              <div className="uk-text-meta uk-margin-small-top">
                {t('admin.users.memberSince')} {registeredDate}
                {user.roles.length > 0 && (
                  <span className="uk-margin-small-left">
                    · {user.roles.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AdminUserCard;
