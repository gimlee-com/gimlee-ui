import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from '../components/NotificationItem/NotificationItem';
import { NotificationCategoryFilter } from '../components/NotificationCategoryFilter/NotificationCategoryFilter';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Button } from '../../components/uikit/Button/Button';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Icon } from '../../components/uikit/Icon/Icon';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { createPageContainerVariants, pageItemVariants } from '../../animations';
import { NOTIFICATION_CATEGORIES } from '../types/notification';
import type { NotificationCategory } from '../types/notification';

const containerVariants = createPageContainerVariants();

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useNavbarMode('focused', location.state?.from || '/');

  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadingMore,
    activeCategory,
    loadMore,
    markRead,
    markAllRead,
    setCategory,
  } = useNotifications();

  // Sync URL → Redux active category on mount / URL change
  useEffect(() => {
    const urlCategory = searchParams.get('category') as NotificationCategory | null;
    const validCategory = urlCategory && NOTIFICATION_CATEGORIES.includes(urlCategory)
      ? urlCategory
      : null;
    if (validCategory !== activeCategory) {
      setCategory(validCategory);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unread-only filter, synced to URL
  const unreadOnly = searchParams.get('unread') === 'true';

  const updateSearchParams = (category: NotificationCategory | null, unread: boolean) => {
    const next: Record<string, string> = {};
    if (category) next.category = category;
    if (unread) next.unread = 'true';
    setSearchParams(next);
  };

  const handleCategoryChange = (category: NotificationCategory | null) => {
    setCategory(category);
    updateSearchParams(category, unreadOnly);
  };

  const handleUnreadToggle = () => {
    updateSearchParams(activeCategory, !unreadOnly);
  };

  const filteredNotifications = useMemo(
    () => unreadOnly ? notifications.filter((n) => !n.read) : notifications,
    [notifications, unreadOnly]
  );

  if (!isAuthenticated) {
    navigate('/login', { state: { from: location.pathname } });
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={pageItemVariants}>
        <div className="uk-flex uk-flex-between uk-flex-middle uk-margin-bottom">
          <Heading size="h2" className="uk-margin-remove">
            {t('notifications.title')}
          </Heading>
          {unreadCount > 0 && (
            <Button
              variant="text"
              size="small"
              onClick={() => markAllRead(activeCategory ?? undefined)}
            >
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={pageItemVariants} className="uk-margin-bottom">
        <div className="uk-flex uk-flex-column uk-flex-row@s uk-flex-between@s uk-flex-middle">
          <div className="uk-width-1-1 uk-width-auto@s">
            <NotificationCategoryFilter
              activeCategory={activeCategory}
              onChange={handleCategoryChange}
            />
          </div>
          <label 
            className="uk-flex uk-flex-middle uk-margin-small-top uk-margin-remove-top@s" 
            style={{ gap: 6, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: 13 }}
          >
            <input
              className="uk-checkbox"
              type="checkbox"
              checked={unreadOnly}
              onChange={handleUnreadToggle}
            />
            {t('notifications.unreadOnly')}
          </label>
        </div>
      </motion.div>

      {loading ? (
        <div className="uk-text-center uk-margin-large-top">
          <Spinner />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          variants={pageItemVariants}
          className="uk-text-center uk-margin-large-top"
        >
          <Icon icon="bell" ratio={3} className="uk-text-muted" />
          <p className="uk-text-muted uk-margin-small-top">
            {unreadOnly
              ? t('notifications.emptyUnread')
              : activeCategory
                ? t('notifications.emptyCategory')
                : t('notifications.empty')}
          </p>
        </motion.div>
      ) : (
        <>
          <AnimatePresence initial={false}>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={pageItemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, height: 0 }}
                className="uk-margin-small-bottom"
              >
                <div className="uk-card uk-card-default uk-card-small uk-overflow-hidden" style={{ borderRadius: 8 }}>
                  <NotificationItem
                    notification={notification}
                    onRead={markRead}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <div className="uk-text-center uk-margin-top">
              {loadingMore ? (
                <Spinner ratio={0.8} />
              ) : (
                <Button variant="default" size="small" onClick={loadMore}>
                  {t('notifications.loadMore')}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default NotificationsPage;
