import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { NotificationItem } from '../NotificationItem/NotificationItem';
import { CATEGORY_ICON_MAP } from '../../types/notification';
import type { NotificationDto, NotificationCategory } from '../../types/notification';
import styles from './NotificationPanel.module.scss';

const MAX_PER_GROUP = 3;

interface CategoryGroup {
  category: NotificationCategory;
  notifications: NotificationDto[];
  hasMore: boolean;
}

interface NotificationPanelProps {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

/**
 * Groups notifications by category, sorted by the most recent item
 * in each group. Only categories with at least one unread notification
 * are shown. Each group is capped at MAX_PER_GROUP items.
 */
function buildGroups(notifications: NotificationDto[]): CategoryGroup[] {
  const grouped = new Map<NotificationCategory, NotificationDto[]>();

  for (const n of notifications) {
    if (!grouped.has(n.category)) {
      grouped.set(n.category, []);
    }
    grouped.get(n.category)!.push(n);
  }

  // Only keep categories that have at least one unread notification
  const groups: CategoryGroup[] = [];
  for (const [category, items] of grouped) {
    if (items.some((n) => !n.read)) {
      // Items are already sorted by recency from the API
      groups.push({
        category,
        notifications: items.slice(0, MAX_PER_GROUP),
        hasMore: items.length > MAX_PER_GROUP,
      });
    }
  }

  // Sort groups by the most recent notification (most recent first)
  groups.sort((a, b) => b.notifications[0].createdAt - a.notifications[0].createdAt);

  return groups;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const { t } = useTranslation();
  const groups = useMemo(() => buildGroups(notifications), [notifications]);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>{t('notifications.title')}</h3>
        {unreadCount > 0 && (
          <button
            className={styles.markAllRead}
            onClick={onMarkAllRead}
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Grouped notification list */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>
            <Spinner />
          </div>
        ) : groups.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="bell" ratio={2} className="uk-text-muted uk-margin-small-bottom" />
            <span>{t('notifications.empty')}</span>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.category} className={styles.group}>
              <div className={styles.groupHeader}>
                <Icon
                  icon={CATEGORY_ICON_MAP[group.category] ?? 'bell'}
                  ratio={0.8}
                  className="uk-text-muted"
                />
                <span className={styles.groupTitle}>
                  {t(`notifications.categories.${group.category}`)}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {group.notifications.map((notification) => (
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

              {group.hasMore && (
                <Link
                  to={`/notifications?category=${group.category}`}
                  className={styles.showAll}
                  onClick={onClose}
                >
                  {t('notifications.showAllInCategory')}
                </Link>
              )}
            </div>
          ))
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
