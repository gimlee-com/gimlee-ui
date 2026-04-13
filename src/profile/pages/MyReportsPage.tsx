import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import ReportStatusBadge from '../../admin/components/ReportStatusBadge/ReportStatusBadge';
import ReportTypeBadge from '../../admin/components/ReportTypeBadge/ReportTypeBadge';
import ReportReasonBadge from '../../admin/components/ReportReasonBadge/ReportReasonBadge';
import { SmartPagination } from '../../components/SmartPagination';
import type { ReportListItemDto } from '../../admin/types/adminReport';
import type { PageMetadata } from '../../types/api';
import { createPageContainerVariants, pageItemVariants } from '../../animations';

const MyReportsPage: React.FC = () => {
  useNavbarMode('focused', '/profile');
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  const fetchReports = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getMyReports({ page, size: 20 });
      setReports(res.content);
      setPageInfo(res.page);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('report.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchReports(currentPage);
  }, [currentPage, isAuthenticated, fetchReports]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  if (!isAuthenticated) {
    return (
      <div className="uk-text-center uk-margin-large-top">
        <p>{t('auth.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="uk-heading-small uk-margin-bottom">{t('report.myReports')}</h1>

      {loading && (
        <div className="uk-text-center uk-margin-large-top">
          <div uk-spinner="" />
        </div>
      )}

      {error && (
        <div className="uk-alert-danger" uk-alert="">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="uk-text-center uk-text-muted uk-margin-large-top">
          <span uk-icon="icon: warning; ratio: 2" className="uk-margin-small-bottom" />
          <p>{t('report.noReports')}</p>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <motion.div
          className="uk-flex uk-flex-column"
          style={{ gap: '12px' }}
          variants={createPageContainerVariants()}
          initial="hidden"
          animate="visible"
        >
          {reports.map((report) => {
            const createdDate = new Date(report.createdAt / 1000).toLocaleDateString();

            return (
              <motion.div key={report.id} variants={pageItemVariants} layout>
                <div className="uk-card uk-card-default uk-card-body uk-card-small">
                  <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                    <span className="uk-text-bold uk-text-truncate">{report.targetTitle}</span>
                    <ReportStatusBadge status={report.status} />
                  </div>
                  <div className="uk-flex uk-flex-wrap uk-margin-small-top" style={{ gap: '6px' }}>
                    <ReportTypeBadge targetType={report.targetType} />
                    <ReportReasonBadge reason={report.reason} />
                  </div>
                  <div className="uk-text-meta uk-margin-small-top">
                    {createdDate}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {pageInfo && (
        <SmartPagination
          currentPage={pageInfo.number}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          className="uk-margin-medium-top"
        />
      )}
    </div>
  );
};

export default MyReportsPage;
