import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import type { UserStatus } from '../../types/adminUser';

interface ActiveFilterBadgesProps {
  search: string;
  status: UserStatus | '';
  onRemoveSearch: () => void;
  onRemoveStatus: () => void;
}

const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  search,
  status,
  onRemoveSearch,
  onRemoveStatus,
}) => {
  const { t } = useTranslation();

  const hasFilters = search || status;
  if (!hasFilters) return null;

  return (
    <div className="uk-flex uk-flex-wrap uk-margin-small-bottom" style={{ gap: '6px' }}>
      <AnimatePresence mode="popLayout">
        {search && (
          <motion.span
            key="search"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="uk-label"
          >
            &quot;{search}&quot;
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={onRemoveSearch}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemoveSearch()}
            >
              ×
            </a>
          </motion.span>
        )}
        {status && (
          <motion.span
            key="status"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="uk-label uk-label-warning"
          >
            {t(`admin.users.status.${status}`)}
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={onRemoveStatus}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemoveStatus()}
            >
              ×
            </a>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveFilterBadges;
