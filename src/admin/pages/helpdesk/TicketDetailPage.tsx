import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { adminTicketService } from '../../services/adminTicketService';
import { adminUserService } from '../../services/adminUserService';
import type { TicketDetailDto, TicketStatus, TicketPriority, ReplyToTicketDto } from '../../types/adminTicket';
import type { AdminUserListItemDto } from '../../types/adminUser';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import TicketStatusBadge from '../../components/TicketStatusBadge/TicketStatusBadge';
import TicketPriorityBadge from '../../components/TicketPriorityBadge/TicketPriorityBadge';
import TicketCategoryBadge from '../../components/TicketCategoryBadge/TicketCategoryBadge';
import TicketConversation from '../../components/TicketConversation/TicketConversation';
import TicketReplyForm from '../../components/TicketReplyForm/TicketReplyForm';
import TicketAssignModal from '../../components/TicketAssignModal/TicketAssignModal';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Icon } from '../../../components/uikit/Icon/Icon';

const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'AWAITING_USER', 'RESOLVED', 'CLOSED'];
const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

const formatMicros = (micros: number | null | undefined): string => {
  if (micros == null) return '—';
  return new Date(micros / 1000).toLocaleString();
};

const TicketDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();
  useNavbarMode('focused', '/admin/tickets');

  const [ticket, setTicket] = useState<TicketDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staff, setStaff] = useState<AdminUserListItemDto[]>([]);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await adminTicketService.getTicketDetail(ticketId);
      setTicket(detail);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

  useEffect(() => {
    void fetchTicket();
  }, [fetchTicket]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!ticketId) return;
    const newStatus = e.target.value as TicketStatus;
    setActionLoading(true);
    try {
      await adminTicketService.updateTicket(ticketId, { status: newStatus });
      UIkit.notification({
        message: t('admin.helpdesk.detail.statusUpdated', 'Ticket status updated.'),
        status: 'success',
        pos: 'top-center',
      });
      await fetchTicket();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!ticketId) return;
    const newPriority = e.target.value as TicketPriority;
    setActionLoading(true);
    try {
      await adminTicketService.updateTicket(ticketId, { priority: newPriority });
      UIkit.notification({
        message: t('admin.helpdesk.detail.priorityUpdated', 'Ticket priority updated.'),
        status: 'success',
        pos: 'top-center',
      });
      await fetchTicket();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const result = await adminUserService.listUsers({ page: 0, size: 100 });
      setStaff(result.content);
    } catch {
      // Fall back to empty staff list — modal will still render
    }
    setIsAssignModalOpen(true);
  };

  const handleAssignConfirm = async (assigneeUserId: string) => {
    if (!ticketId) return;
    setActionLoading(true);
    try {
      await adminTicketService.updateTicket(ticketId, { assigneeUserId });
      UIkit.notification({
        message: t('admin.helpdesk.detail.assignSuccess', 'Ticket assigned successfully.'),
        status: 'success',
        pos: 'top-center',
      });
      setIsAssignModalOpen(false);
      await fetchTicket();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = async (dto: ReplyToTicketDto) => {
    if (!ticketId) return;
    setReplySubmitting(true);
    try {
      await adminTicketService.replyToTicket(ticketId, dto);
      UIkit.notification({
        message: t('admin.helpdesk.detail.replySent', 'Reply sent.'),
        status: 'success',
        pos: 'top-center',
      });
      await fetchTicket();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="uk-flex uk-flex-center uk-margin-large-top">
        <Spinner ratio={2} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Alert variant="danger">{error || t('auth.errors.generic')}</Alert>
    );
  }

  const staffMembers = staff.map(u => ({
    userId: u.userId,
    username: u.username,
    displayName: u.displayName,
  }));

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold uk-text-truncate">{ticket.subject}</span>
      </NavbarPortal>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header Card */}
        <motion.div variants={itemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '8px' }}>
            <h2 className="uk-margin-remove">{ticket.subject}</h2>
            <TicketCategoryBadge category={ticket.category} />
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>

          {/* Info section */}
          <div className="uk-grid uk-grid-small uk-margin-top uk-child-width-1-2@s" uk-grid="">
            <div>
              <div className="uk-text-meta">{t('admin.helpdesk.createdBy')}</div>
              <div>@{ticket.creatorUsername}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.helpdesk.assignee')}</div>
              <div>
                {ticket.assigneeUsername
                  ? `@${ticket.assigneeUsername}`
                  : t('admin.helpdesk.unassigned')}
              </div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.helpdesk.detail.createdDate', 'Created')}</div>
              <div>{formatMicros(ticket.createdAt)}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.helpdesk.messageCount', { count: ticket.messageCount })}</div>
            </div>
          </div>

          {/* Status controls */}
          <div className="uk-grid uk-grid-small uk-margin-top uk-flex-middle" uk-grid="">
            <div className="uk-width-auto">
              <label className="uk-form-label">{t('admin.users.filters.status')}</label>
              <select
                className="uk-select uk-border-rounded uk-form-small"
                value={ticket.status}
                onChange={handleStatusChange}
                disabled={actionLoading}
              >
                {TICKET_STATUSES.map(s => (
                  <option key={s} value={s}>{t(`admin.helpdesk.status.${s}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-auto">
              <label className="uk-form-label">{t('admin.helpdesk.detail.priority', 'Priority')}</label>
              <select
                className="uk-select uk-border-rounded uk-form-small"
                value={ticket.priority}
                onChange={handlePriorityChange}
                disabled={actionLoading}
              >
                {TICKET_PRIORITIES.map(p => (
                  <option key={p} value={p}>{t(`admin.helpdesk.priority.${p}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-auto uk-flex uk-flex-bottom">
              <button
                className="uk-button uk-button-default uk-button-small uk-border-rounded"
                onClick={handleOpenAssignModal}
                disabled={actionLoading}
              >
                <Icon icon="user" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.helpdesk.assign.title')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Related Reports */}
        <AnimatePresence>
          {ticket.relatedReportIds.length > 0 && (
            <motion.div variants={itemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
              <h3 className="uk-card-title">{t('admin.helpdesk.detail.relatedReports', 'Related Reports')}</h3>
              <ul className="uk-list uk-list-bullet">
                {ticket.relatedReportIds.map(reportId => (
                  <li key={reportId}>
                    <Link to={`/admin/reports/${reportId}`}>
                      {t('admin.helpdesk.detail.reportLink', 'Report #{{id}}', { id: reportId })}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation */}
        <motion.div variants={itemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 className="uk-card-title">{t('admin.helpdesk.detail.conversation', 'Conversation')}</h3>
          <TicketConversation messages={ticket.messages} />
        </motion.div>

        {/* Reply Form */}
        <motion.div variants={itemVariants} className="uk-card uk-card-default uk-card-body">
          <TicketReplyForm onSubmit={handleReply} isSubmitting={replySubmitting} />
        </motion.div>
      </motion.div>

      <TicketAssignModal
        isOpen={isAssignModalOpen}
        onConfirm={handleAssignConfirm}
        onClose={() => setIsAssignModalOpen(false)}
        staff={staffMembers}
      />
    </>
  );
};

export default TicketDetailPage;
