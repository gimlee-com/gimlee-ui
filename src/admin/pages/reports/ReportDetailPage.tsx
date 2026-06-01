import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { adminReportService } from '../../services/adminReportService';
import type { ReportDetailDto, ResolveReportDto, ReportStatus } from '../../types/adminReport';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import ReportTimeline from '../../components/ReportTimeline/ReportTimeline';
import ReportActionModal from '../../components/ReportActionModal/ReportActionModal';
import ReportSiblingList from '../../components/ReportSiblingList/ReportSiblingList';
import ReportedContentCard from '../../components/ReportedContentCard/ReportedContentCard';
import TargetSnapshotRenderer from '../../components/TargetSnapshotRenderer/TargetSnapshotRenderer';
import AdminUserAssignModal from '../../components/AdminUserAssignModal/AdminUserAssignModal';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { reportTargetTypeIcon } from '../../utils/reportTargetTypeIcon';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';
import styles from './ReportDetailPage.module.scss';

import i18n from '../../../i18n';

const formatMicros = (micros: number | null | undefined): string => {
  if (micros == null) return '—';
  return new Date(micros / 1000).toLocaleString(i18n.language);
};

const statusDotClass: Record<ReportStatus, string> = {
  OPEN: styles.dotOpen,
  IN_REVIEW: styles.dotInReview,
  RESOLVED: styles.dotResolved,
  DISMISSED: styles.dotDismissed,
};

const statusCardClass: Record<ReportStatus, string> = {
  OPEN: styles.statusOpen,
  IN_REVIEW: styles.statusInReview,
  RESOLVED: styles.statusResolved,
  DISMISSED: styles.statusDismissed,
};

const ReportDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { reportId } = useParams<{ reportId: string }>();
  useNavbarMode('focused', '/admin/reports');

  const [report, setReport] = useState<ReportDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await adminReportService.getReportDetail(reportId);
      setReport(detail);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [reportId, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAssign = async (userId: string) => {
    if (!reportId) return;
    setActionLoading(true);
    try {
      await adminReportService.assignReport(reportId, { assigneeUserId: userId });
      UIkit.notification({
        message: t('admin.reports.detail.assignSuccess'),
        status: 'success',
        pos: 'top-center',
      });
      setIsAssignModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!reportId) return;
    let note: string | null = null;
    try {
      note = await UIkit.modal.prompt(
        t('admin.reports.actionModal.internalNotes'),
        '',
        { stack: true, i18n: { ok: t('common.ok'), cancel: t('common.cancel') } },
      );
    } catch {
      return;
    }
    if (!note?.trim()) return;
    setActionLoading(true);
    try {
      await adminReportService.addNote(reportId, { note: note.trim() });
      UIkit.notification({
        message: t('admin.reports.detail.noteAdded'),
        status: 'success',
        pos: 'top-center',
      });
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (dto: ResolveReportDto) => {
    if (!reportId) return;
    setActionLoading(true);
    try {
      await adminReportService.resolveReport(reportId, dto);
      UIkit.notification({
        message: t('admin.reports.detail.resolveSuccess'),
        status: 'success',
        pos: 'top-center',
      });
      setIsActionModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="uk-flex uk-flex-center uk-margin-large-top">
        <Spinner ratio={2} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <Alert variant="danger">{error || t('auth.errors.generic')}</Alert>
    );
  }

  const isTerminal = report.status === 'RESOLVED' || report.status === 'DISMISSED';
  const shortId = report.id.slice(0, 8);

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">
          {t('admin.reports.detail.title', { id: shortId })}
        </span>
      </NavbarPortal>

      <motion.div variants={createPageContainerVariants()} initial="hidden" animate="visible">
        {/* Header Card */}
        <motion.div
          variants={pageItemVariants}
          className={`uk-card uk-card-default uk-card-body uk-margin-bottom ${styles.headerCard} ${statusCardClass[report.status]}`}
        >
          {/* Heading row */}
          <div className={styles.heading}>
            <h2 className={styles.headingTitle}>
              {t('admin.reports.detail.title', { id: shortId })}
            </h2>
            <span className={styles.statusIndicator}>
              <span className={`${styles.statusDot} ${statusDotClass[report.status]}`} />
              {t(`admin.reports.status.${report.status}`)}
            </span>
          </div>

          {/* Classification section */}
          <div className={styles.classificationSection}>
            <div className={styles.classificationTitle}>
              {t('admin.reports.detail.classification')}
            </div>
            <div className={styles.classificationGrid}>
              <div className={styles.classificationItem}>
                <span className={styles.classificationLabel}>
                  {t('admin.reports.detail.type')}
                </span>
                <span className={styles.classificationValue}>
                  <Icon icon={reportTargetTypeIcon[report.targetType]} ratio={0.85} />
                  {t(`admin.reports.targetType.${report.targetType}`)}
                </span>
              </div>
              <div className={styles.classificationItem}>
                <span className={styles.classificationLabel}>
                  {t('admin.reports.detail.reason')}
                </span>
                <span className={styles.classificationValue}>
                  {t(`admin.reports.reason.${report.reason}`)}
                </span>
              </div>
              <div className={styles.classificationItem}>
                <span className={styles.classificationLabel}>
                  {t('admin.reports.detail.status')}
                </span>
                <span className={styles.classificationValue}>
                  <span className={`${styles.statusDot} ${statusDotClass[report.status]}`} />
                  {t(`admin.reports.status.${report.status}`)}
                </span>
              </div>
              <div className={styles.classificationItem}>
                <span className={styles.classificationLabel}>
                  {t('admin.reports.detail.resolution')}
                </span>
                <span className={styles.classificationValue}>
                  {report.resolution
                    ? t(`admin.reports.resolution.${report.resolution}`)
                    : t('admin.reports.detail.noResolution')}
                </span>
              </div>
            </div>
          </div>

          {/* Reported Content inset */}
          <div className={styles.reportedContentSection}>
            <div className={styles.reportedContentTitle}>
              {t('admin.reports.detail.reportedContent')}
            </div>
            <ReportedContentCard
              targetType={report.targetType}
              targetId={report.targetId}
              targetTitle={report.targetTitle}
              targetSnapshot={report.targetSnapshot}
            />
          </div>

          {/* Metadata */}
          <div className={styles.metadataGrid}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>{t('admin.reports.reportedBy')}</span>
              <span className={styles.metadataValue}>@{report.reporterUsername}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>{t('admin.reports.detail.dateSubmitted')}</span>
              <span className={styles.metadataValue}>{formatMicros(report.createdAt)}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>{t('admin.helpdesk.assignee')}</span>
              <span className={styles.metadataValue}>
                {report.assigneeUsername
                  ? `@${report.assigneeUsername}`
                  : t('admin.helpdesk.unassigned')}
              </span>
            </div>
            {report.resolvedByUsername && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>{t('admin.reports.detail.resolvedBy')}</span>
                <span className={styles.metadataValue}>
                  @{report.resolvedByUsername} · {formatMicros(report.resolvedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isTerminal && (
            <div className={styles.actions}>
              <button
                className="uk-button uk-button-default uk-button-small uk-border-rounded"
                onClick={() => setIsAssignModalOpen(true)}
                disabled={actionLoading}
              >
                <Icon icon="user" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.reports.detail.assign')}
              </button>
              <button
                className="uk-button uk-button-default uk-button-small uk-border-rounded"
                onClick={handleAddNote}
                disabled={actionLoading}
              >
                <Icon icon="comment" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.reports.detail.addNote')}
              </button>
              <button
                className="uk-button uk-button-primary uk-button-small uk-border-rounded"
                onClick={() => setIsActionModalOpen(true)}
                disabled={actionLoading}
              >
                <Icon icon="check" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.reports.detail.resolveOrDismiss')}
              </button>
            </div>
          )}
        </motion.div>

        {/* Description Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 className="uk-card-title">{t('admin.reports.detail.description')}</h3>
          <p>{report.description || '—'}</p>
          {report.internalNotes && (
            <>
              <h4 className="uk-margin-top">{t('admin.reports.actionModal.internalNotes')}</h4>
              <p className="uk-text-muted">{report.internalNotes}</p>
            </>
          )}
        </motion.div>

        {/* Target Snapshot Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 className="uk-card-title">{t('admin.reports.detail.targetSnapshot')}</h3>
          <TargetSnapshotRenderer
            targetType={report.targetType}
            targetSnapshot={report.targetSnapshot}
          />
        </motion.div>

        {/* Sibling Reports */}
        <AnimatePresence>
          {report.siblingCount > 1 && (
            <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
              <h3 className="uk-card-title">
                {t('admin.reports.detail.siblingReports')}
                <span className="uk-text-meta uk-margin-small-left">
                  ({t('admin.reports.siblingCount', { count: report.siblingCount })})
                </span>
              </h3>
              <ReportSiblingList
                targetType={report.targetType}
                targetId={report.targetId}
                excludeReportId={report.id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body">
          <h3 className="uk-card-title">{t('admin.reports.timeline.title')}</h3>
          {report.timeline.length > 0 ? (
            <ReportTimeline entries={report.timeline} />
          ) : (
            <p className="uk-text-meta">{t('admin.reports.detail.noTimeline')}</p>
          )}
        </motion.div>
      </motion.div>

      <ReportActionModal
        isOpen={isActionModalOpen}
        onConfirm={handleResolve}
        onClose={() => setIsActionModalOpen(false)}
      />

      <AdminUserAssignModal
        isOpen={isAssignModalOpen}
        onConfirm={handleAssign}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </>
  );
};

export default ReportDetailPage;
