import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import ReportTypeBadge from '../ReportTypeBadge/ReportTypeBadge';
import ReportReasonBadge from '../ReportReasonBadge/ReportReasonBadge';
import ReportStatusBadge from '../ReportStatusBadge/ReportStatusBadge';
import type { ReportListItemDto } from '../../types/adminReport';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
} as const;

interface ReportCardProps {
  report: ReportListItemDto;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const createdDate = new Date(report.createdAt / 1000).toLocaleDateString();

  return (
    <motion.div variants={itemVariants} layout>
      <Link
        to={`/admin/reports/${report.id}`}
        state={{ from: location.pathname + location.search }}
        className="uk-link-reset"
      >
        <div className="uk-card uk-card-default uk-card-hover uk-card-body uk-card-small">
          <div className="uk-flex uk-flex-middle uk-flex-between">
            <div className="uk-flex-1" style={{ minWidth: 0 }}>
              <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                <span className="uk-text-bold uk-text-truncate">{report.targetTitle}</span>
                <ReportTypeBadge targetType={report.targetType} />
                <ReportStatusBadge status={report.status} />
              </div>
              <div className="uk-flex uk-flex-wrap uk-margin-small-top" style={{ gap: '6px' }}>
                <ReportReasonBadge reason={report.reason} />
                {report.siblingCount > 1 && (
                  <span className="uk-text-meta">
                    {t('admin.reports.siblingCount', { count: report.siblingCount })}
                  </span>
                )}
              </div>
              <div className="uk-text-meta uk-margin-small-top">
                {t('admin.reports.reportedBy')} @{report.reporterUsername} · {createdDate}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ReportCard;
