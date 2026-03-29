import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { adminReportService } from '../../services/adminReportService';
import type {
  ReportTargetType,
  ReportListItemDto,
  PageReportListItemDto,
} from '../../types/adminReport';
import ReportStatusBadge from '../ReportStatusBadge/ReportStatusBadge';
import ReportReasonBadge from '../ReportReasonBadge/ReportReasonBadge';
import { SmartPagination } from '../../../components/SmartPagination';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import styles from './ReportSiblingList.module.scss';

interface ReportSiblingListProps {
  targetType: ReportTargetType;
  targetId: string;
  excludeReportId: string;
}

const SiblingEntry: React.FC<{ report: ReportListItemDto }> = ({ report }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const createdDate = new Date(report.createdAt / 1000).toLocaleDateString();

  return (
    <div className={styles.siblingEntry}>
      <Link
        to={`/admin/reports/${report.id}`}
        state={{ from: location.pathname + location.search }}
        className="uk-link-reset"
      >
        <div className="uk-flex uk-flex-middle uk-flex-between">
          <div className="uk-flex-1" style={{ minWidth: 0 }}>
            <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
              <span className="uk-text-small uk-text-bold">@{report.reporterUsername}</span>
              <ReportReasonBadge reason={report.reason} />
              <ReportStatusBadge status={report.status} />
            </div>
            <div className="uk-text-meta uk-margin-small-top">
              {t('admin.reports.reportedBy')} @{report.reporterUsername} · {createdDate}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const ReportSiblingList: React.FC<ReportSiblingListProps> = ({
  targetType,
  targetId,
  excludeReportId,
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState<PageReportListItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [overflowVisible, setOverflowVisible] = useState(false);

  const fetchSiblings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminReportService.getReportsByTarget({
        targetType,
        targetId,
        excludeReportId,
        page,
        size: 10,
      });
      setData(result);
    } catch {
      // Silently fail for sibling list
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId, excludeReportId, page]);

  useEffect(() => {
    void fetchSiblings();
  }, [fetchSiblings]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const toggleExpanded = () => {
    if (isExpanded) {
      setOverflowVisible(false);
    }
    setIsExpanded(prev => !prev);
  };

  return (
    <div className={styles.container}>
      <button
        className="uk-button uk-button-text uk-margin-small-bottom"
        type="button"
        onClick={toggleExpanded}
      >
        {isExpanded
          ? t('admin.reports.detail.hideSiblings', 'Hide sibling reports')
          : t('admin.reports.detail.showSiblings', 'Show sibling reports')}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{ overflow: overflowVisible ? 'visible' : 'hidden' }}
            onAnimationComplete={(def) => {
              if (typeof def === 'object' && 'height' in def && def.height === 'auto') {
                setOverflowVisible(true);
              }
            }}
          >
            {loading ? (
              <div className="uk-flex uk-flex-center uk-padding-small">
                <Spinner />
              </div>
            ) : data && data.content.length > 0 ? (
              <>
                {data.content.map(report => (
                  <SiblingEntry key={report.id} report={report} />
                ))}
                {data.page.totalPages > 1 && (
                  <div className="uk-margin-small-top">
                    <SmartPagination
                      currentPage={data.page.number}
                      totalPages={data.page.totalPages}
                      onPageChange={handlePageChange}
                      className="uk-flex-center"
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="uk-text-meta uk-text-center">
                {t('admin.reports.noReports')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportSiblingList;
