import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, stagger } from 'motion/react';
import { adminReportService } from '../../services/adminReportService';
import type {
  PageReportListItemDto,
  ReportStatus,
  ReportTargetType,
  ReportReason,
  ReportSortField,
  SortDirection,
} from '../../types/adminReport';
import ReportCard from '../../components/ReportCard/ReportCard';
import ReportFilterBadges from '../../components/ReportFilters/ReportFilters';
import AdminSubNav from '../../components/AdminSubNav';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { SmartPagination } from '../../../components/SmartPagination';
import { Icon } from '../../../components/uikit/Icon/Icon';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
} as const;

const REPORT_STATUSES: ReportStatus[] = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'];
const REPORT_TARGET_TYPES: ReportTargetType[] = ['AD', 'USER', 'MESSAGE', 'QUESTION', 'ANSWER'];
const REPORT_REASONS: ReportReason[] = [
  'SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'COUNTERFEIT',
  'HARASSMENT', 'COPYRIGHT', 'WRONG_CATEGORY', 'OTHER',
];
const SORT_FIELDS: ReportSortField[] = ['createdAt', 'updatedAt', 'siblingCount'];

const ReportListPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageReportListItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useNavbarMode('focused', '/admin');

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = {
      page: parseInt(searchParams.get('page') || '0', 10),
      size: parseInt(searchParams.get('size') || '30', 10),
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as ReportStatus) || undefined,
      targetType: (searchParams.get('targetType') as ReportTargetType) || undefined,
      reason: (searchParams.get('reason') as ReportReason) || undefined,
      sort: (searchParams.get('sort') as ReportSortField) || undefined,
      direction: (searchParams.get('direction') as SortDirection) || undefined,
    };

    adminReportService.listReports(params)
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('auth.errors.generic'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchParams, t]);

  const applyFilters = useCallback((overrides: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '0');
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters({ search: value || undefined });
    }, 500);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ status: e.target.value || undefined });
  };

  const handleTargetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ targetType: e.target.value || undefined });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ reason: e.target.value || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ sort: e.target.value || undefined });
  };

  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ direction: e.target.value || undefined });
  };

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">{t('admin.reports.title')}</span>
      </NavbarPortal>
      <AdminSubNav />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="uk-margin-bottom">
          <div className="uk-grid uk-grid-small uk-flex-middle" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-3@m">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon">
                  <Icon icon="search" />
                </span>
                <input
                  className="uk-input uk-border-rounded"
                  type="text"
                  placeholder={t('admin.reports.filters.search')}
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('status') || ''}
                onChange={handleStatusChange}
              >
                <option value="">{t('admin.reports.filters.allStatuses')}</option>
                {REPORT_STATUSES.map(s => (
                  <option key={s} value={s}>{t(`admin.reports.status.${s}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('targetType') || ''}
                onChange={handleTargetTypeChange}
              >
                <option value="">{t('admin.reports.filters.allTargetTypes')}</option>
                {REPORT_TARGET_TYPES.map(tt => (
                  <option key={tt} value={tt}>{t(`admin.reports.targetType.${tt}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('reason') || ''}
                onChange={handleReasonChange}
              >
                <option value="">{t('admin.reports.filters.allReasons')}</option>
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r}>{t(`admin.reports.reason.${r}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('sort') || ''}
                onChange={handleSortChange}
              >
                <option value="">{t('admin.users.filters.sort')}</option>
                {SORT_FIELDS.map(f => (
                  <option key={f} value={f}>{t(`admin.reports.filters.sortFields.${f}`, f)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('direction') || ''}
                onChange={handleDirectionChange}
              >
                <option value="">{t('admin.users.filters.direction')}</option>
                <option value="ASC">{t('admin.users.filters.ascending')}</option>
                <option value="DESC">{t('admin.users.filters.descending')}</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ReportFilterBadges
            search={searchParams.get('search') || ''}
            status={(searchParams.get('status') as ReportStatus) || ''}
            targetType={(searchParams.get('targetType') as ReportTargetType) || ''}
            reason={(searchParams.get('reason') as ReportReason) || ''}
            onRemoveSearch={() => { setSearchInput(''); applyFilters({ search: undefined }); }}
            onRemoveStatus={() => applyFilters({ status: undefined })}
            onRemoveTargetType={() => applyFilters({ targetType: undefined })}
            onRemoveReason={() => applyFilters({ reason: undefined })}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="uk-flex uk-flex-center uk-margin-large-top"
            >
              <Spinner ratio={2} />
            </motion.div>
          ) : error ? (
            <motion.div key="error" variants={itemVariants}>
              <Alert variant="danger">{error}</Alert>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { delayChildren: stagger(0.04) },
                },
              }}
            >
              <div className="uk-grid uk-grid-small uk-child-width-1-1 uk-child-width-1-2@m" uk-grid="">
                <AnimatePresence mode="popLayout">
                  {data?.content.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </AnimatePresence>
              </div>

              {data && data.page.totalPages > 1 && (
                <motion.div variants={itemVariants} className="uk-margin-large-top">
                  <SmartPagination
                    currentPage={data.page.number}
                    totalPages={data.page.totalPages}
                    onPageChange={handlePageChange}
                    className="uk-flex-center"
                  />
                </motion.div>
              )}

              {data?.content.length === 0 && (
                <motion.div variants={itemVariants} className="uk-text-center uk-margin-large-top">
                  <p className="uk-text-meta">{t('admin.reports.noReports')}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default ReportListPage;
