import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { NotificationItem } from '../NotificationItem/NotificationItem';
import { NotificationCategoryFilter } from '../NotificationCategoryFilter/NotificationCategoryFilter';
import type { NotificationDto, NotificationCategory } from '../../types/notification';
import styles from './NotificationPanel.module.scss';

interface NotificationPanelProps {
  notifications: NotificationDto[];
  unreadCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  activeCategory: NotificationCategory | null;
  onCategoryChange: (category: NotificationCategory | null) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: (category?: NotificationCategory) => void;
  onLoadMore: () => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  hasMore,
  loading,
  loadingMore,
  activeCategory,
  onCategoryChange,
  onMarkRead,
  onMarkAllRead,
  onLoadMore,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>{t('notifications.title')}</h3>
        {unreadCount > 0 && (
          <button
            className={styles.markAllRead}
            onClick={() => onMarkAllRead(activeCategory ?? undefined)}
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className={styles.filters}>
        <NotificationCategoryFilter
          activeCategory={activeCategory}
          onChange={onCategoryChange}
        />
      </div>

      {/* Notification list */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="bell" ratio={2} className="uk-text-muted uk-margin-small-bottom" />
            <span>
              {activeCategory
                ? t('notifications.emptyCategory')
                : t('notifications.empty')}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationItem
                  notification={notification}
                  onRead={onMarkRead}
                  onClose={onClose}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Load more */}
        {!loading && hasMore && notifications.length > 0 && (
          <div className={styles.loadMore}>
            {loadingMore ? (
              <Spinner ratio={0.5} />
            ) : (
              <button className={styles.loadMoreBtn} onClick={onLoadMore}>
                {t('notifications.loadMore')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Link
          to="/notifications"
          className={styles.footerLink}
          onClick={onClose}
        >
          {t('notifications.viewAll')}
        </Link>
      </div>
    </div>
  );
};
