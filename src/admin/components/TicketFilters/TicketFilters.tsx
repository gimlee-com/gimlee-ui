import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import type { TicketStatus, TicketPriority, TicketCategory } from '../../types/adminTicket';

interface TicketFilterBadgesProps {
  search: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  category: TicketCategory | '';
  onRemoveSearch: () => void;
  onRemoveStatus: () => void;
  onRemovePriority: () => void;
  onRemoveCategory: () => void;
}

const TicketFilterBadges: React.FC<TicketFilterBadgesProps> = ({
  search,
  status,
  priority,
  category,
  onRemoveSearch,
  onRemoveStatus,
  onRemovePriority,
  onRemoveCategory,
}) => {
  const { t } = useTranslation();

  const hasFilters = search || status || priority || category;
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
            {t(`admin.helpdesk.status.${status}`)}
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
        {priority && (
          <motion.span
            key="priority"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="uk-label uk-label-danger"
          >
            {t(`admin.helpdesk.priority.${priority}`)}
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={onRemovePriority}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemovePriority()}
            >
              ×
            </a>
          </motion.span>
        )}
        {category && (
          <motion.span
            key="category"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="uk-label uk-label-success"
          >
            {t(`admin.helpdesk.category.${category}`)}
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={onRemoveCategory}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemoveCategory()}
            >
              ×
            </a>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketFilterBadges;
