import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketStatusBadge from '../../admin/components/TicketStatusBadge/TicketStatusBadge';
import TicketCategoryBadge from '../../admin/components/TicketCategoryBadge/TicketCategoryBadge';
import TicketConversation from '../../admin/components/TicketConversation/TicketConversation';
import TicketReplyForm from '../../admin/components/TicketReplyForm/TicketReplyForm';
import type { TicketDetailDto, ReplyToTicketDto } from '../../admin/types/adminTicket';

const UserTicketDetailPage: React.FC = () => {
  useNavbarMode('focused', '/tickets');
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ticketId } = useParams<{ ticketId: string }>();

  const [ticket, setTicket] = useState<TicketDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ticketService.getTicketDetail(ticketId);
      setTicket(res);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('tickets.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchTicket();
  }, [isAuthenticated, fetchTicket]);

  const handleReply = async (dto: ReplyToTicketDto) => {
    if (!ticketId) return;
    setReplying(true);
    try {
      await ticketService.replyToTicket(ticketId, dto);
      UIkit.notification({
        message: t('tickets.replySent'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
      await fetchTicket();
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('tickets.error');
      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000,
      });
    } finally {
      setReplying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="uk-text-center uk-margin-large-top">
        <p>{t('auth.loginRequired')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="uk-text-center uk-margin-large-top">
        <div uk-spinner="" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="uk-alert-danger" uk-alert="">
        <p>{error}</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="uk-text-center uk-text-muted uk-margin-large-top">
        <p>{t('tickets.notFound')}</p>
      </div>
    );
  }

  const createdDate = new Date(ticket.createdAt / 1000).toLocaleString();
  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  return (
    <div>
      <div className="uk-margin-bottom">
        <h1 className="uk-heading-small uk-margin-remove-bottom">{ticket.subject}</h1>
        <div className="uk-flex uk-flex-wrap uk-margin-small-top" style={{ gap: '6px' }}>
          <TicketStatusBadge status={ticket.status} />
          <TicketCategoryBadge category={ticket.category} />
        </div>
        <div className="uk-text-meta uk-margin-small-top">{createdDate}</div>
      </div>

      <div className="uk-margin">
        <TicketConversation messages={ticket.messages} />
      </div>

      {!isClosed && (
        <div className="uk-card uk-card-default uk-card-body uk-margin-top">
          <TicketReplyForm onSubmit={handleReply} isSubmitting={replying} />
        </div>
      )}
    </div>
  );
};

export default UserTicketDetailPage;
