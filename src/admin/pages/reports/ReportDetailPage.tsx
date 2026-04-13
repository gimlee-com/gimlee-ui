import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { adminReportService } from '../../services/adminReportService';
import type { ReportDetailDto, ResolveReportDto } from '../../types/adminReport';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import ReportStatusBadge from '../../components/ReportStatusBadge/ReportStatusBadge';
import ReportTypeBadge from '../../components/ReportTypeBadge/ReportTypeBadge';
import ReportReasonBadge from '../../components/ReportReasonBadge/ReportReasonBadge';
import ReportTimeline from '../../components/ReportTimeline/ReportTimeline';
import ReportActionModal from '../../components/ReportActionModal/ReportActionModal';
import ReportSiblingList from '../../components/ReportSiblingList/ReportSiblingList';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';

const formatMicros = (micros: number | null | undefined): string => {
  if (micros == null) return '—';
  return new Date(micros / 1000).toLocaleString();
};

const ReportDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { reportId } = useParams<{ reportId: string }>();
  useNavbarMode('focused', '/admin/reports');

  const [report, setReport] = useState<ReportDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
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

  const handleAssign = async () => {
    if (!reportId) return;
    let userId: string | null = null;
    try {
      userId = await UIkit.modal.prompt(
        t('admin.reports.detail.assignPrompt', 'Enter assignee User ID:'),
        '',
        { stack: true, i18n: { ok: t('common.ok'), cancel: t('common.cancel') } },
      );
    } catch {
      return;
    }
    if (!userId?.trim()) return;
    setActionLoading(true);
    try {
      await adminReportService.assignReport(reportId, { assigneeUserId: userId.trim() });
      UIkit.notification({
        message: t('admin.reports.detail.assignSuccess', 'Report assigned successfully.'),
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
        message: t('admin.reports.detail.noteAdded', 'Note added successfully.'),
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
        message: t('admin.reports.detail.resolveSuccess', 'Report resolved successfully.'),
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

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">{report.targetTitle || `#${report.id}`}</span>
      </NavbarPortal>

      <motion.div variants={createPageContainerVariants()} initial="hidden" animate="visible">
        {/* Header Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '8px' }}>
            <h2 className="uk-margin-remove">{report.targetTitle}</h2>
            <ReportTypeBadge targetType={report.targetType} />
            <ReportStatusBadge status={report.status} />
            <ReportReasonBadge reason={report.reason} />
          </div>

          {/* Reporter Info */}
          <div className="uk-grid uk-grid-small uk-margin-top uk-child-width-1-2@s" uk-grid="">
            <div>
              <div className="uk-text-meta">{t('admin.reports.reportedBy')}</div>
              <div>@{report.reporterUsername}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.reports.detail.dateSubmitted', 'Date Submitted')}</div>
              <div>{formatMicros(report.createdAt)}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.helpdesk.assignee', 'Assignee')}</div>
              <div>
                {report.assigneeUsername
                  ? `@${report.assigneeUsername}`
                  : t('admin.helpdesk.unassigned', 'Unassigned')}
              </div>
            </div>
            {report.resolution && (
              <div>
                <div className="uk-text-meta">{t('admin.reports.actionModal.resolutionLabel')}</div>
                <div>{t(`admin.reports.resolution.${report.resolution}`)}</div>
              </div>
            )}
            {report.resolvedByUsername && (
              <div>
                <div className="uk-text-meta">{t('admin.reports.detail.resolvedBy', 'Resolved by')}</div>
                <div>@{report.resolvedByUsername} · {formatMicros(report.resolvedAt)}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isTerminal && (
            <div className="uk-margin-top uk-flex uk-flex-wrap" style={{ gap: '8px' }}>
              <button
                className="uk-button uk-button-default uk-button-small uk-border-rounded"
                onClick={handleAssign}
                disabled={actionLoading}
              >
                <Icon icon="user" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.reports.detail.assign', 'Assign')}
              </button>
              <button
                className="uk-button uk-button-default uk-button-small uk-border-rounded"
                onClick={handleAddNote}
                disabled={actionLoading}
              >
                <Icon icon="comment" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.reports.detail.addNote', 'Add Note')}
              </button>
              <button
                className="uk-button uk-button-primary uk-button-small uk-border-rounded"
                onClick={() => setIsActionModalOpen(true)}
                disabled={actionLoading}
              >
                <Icon icon="check" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.reports.detail.resolveOrDismiss', 'Resolve / Dismiss')}
              </button>
            </div>
          )}
        </motion.div>

        {/* Description Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 className="uk-card-title">{t('admin.reports.detail.description', 'Description')}</h3>
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
          <h3 className="uk-card-title">{t('admin.reports.detail.targetSnapshot', 'Target Snapshot')}</h3>
          <pre className="uk-overflow-auto" style={{ maxHeight: '400px' }}>
            {JSON.stringify(report.targetSnapshot, null, 2)}
          </pre>
        </motion.div>

        {/* Sibling Reports */}
        <AnimatePresence>
          {report.siblingCount > 1 && (
            <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
              <h3 className="uk-card-title">
                {t('admin.reports.detail.siblingReports', 'Sibling Reports')}
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
            <p className="uk-text-meta">{t('admin.reports.detail.noTimeline', 'No timeline entries.')}</p>
          )}
        </motion.div>
      </motion.div>

      <ReportActionModal
        isOpen={isActionModalOpen}
        onConfirm={handleResolve}
        onClose={() => setIsActionModalOpen(false)}
      />
    </>
  );
};

export default ReportDetailPage;
