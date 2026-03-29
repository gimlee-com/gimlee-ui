import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import type { ReportStatus, ReportTargetType, ReportReason } from '../../types/adminReport';

interface ReportFilterBadgesProps {
  search: string;
  status: ReportStatus | '';
  targetType: ReportTargetType | '';
  reason: ReportReason | '';
  onRemoveSearch: () => void;
  onRemoveStatus: () => void;
  onRemoveTargetType: () => void;
  onRemoveReason: () => void;
}

const ReportFilterBadges: React.FC<ReportFilterBadgesProps> = ({
  search,
  status,
  targetType,
  reason,
  onRemoveSearch,
  onRemoveStatus,
  onRemoveTargetType,
  onRemoveReason,
}) => {
  const { t } = useTranslation();

  const hasFilters = search || status || targetType || reason;
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
            {t(`admin.reports.status.${status}`)}
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
        {targetType && (
          <motion.span
            key="targetType"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="uk-label"
          >
            {t(`admin.reports.targetType.${targetType}`)}
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={onRemoveTargetType}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemoveTargetType()}
            >
              ×
            </a>
          </motion.span>
        )}
        {reason && (
          <motion.span
            key="reason"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="uk-label uk-label-danger"
          >
            {t(`admin.reports.reason.${reason}`)}
            <a
              className="uk-margin-small-left uk-text-white"
              onClick={onRemoveReason}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRemoveReason()}
            >
              ×
            </a>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportFilterBadges;
