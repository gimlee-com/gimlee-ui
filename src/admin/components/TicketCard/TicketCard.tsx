import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { pageItemVariants } from '../../../animations';
import TicketCategoryBadge from '../TicketCategoryBadge/TicketCategoryBadge';
import TicketStatusBadge from '../TicketStatusBadge/TicketStatusBadge';
import TicketPriorityBadge from '../TicketPriorityBadge/TicketPriorityBadge';
import type { TicketListItemDto } from '../../types/adminTicket';

interface TicketCardProps {
  ticket: TicketListItemDto;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const createdDate = new Date(ticket.createdAt / 1000).toLocaleDateString();
  const lastMessageDate = ticket.lastMessageAt
    ? new Date(ticket.lastMessageAt / 1000).toLocaleDateString()
    : null;

  return (
    <motion.div variants={pageItemVariants} layout>
      <Link
        to={`/admin/tickets/${ticket.id}`}
        state={{ from: location.pathname + location.search }}
        className="uk-link-reset"
      >
        <div className="uk-card uk-card-default uk-card-hover uk-card-body uk-card-small">
          <div className="uk-flex uk-flex-middle uk-flex-between">
            <div className="uk-flex-1" style={{ minWidth: 0 }}>
              <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                <span className="uk-text-bold uk-text-truncate">{ticket.subject}</span>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
              <div className="uk-flex uk-flex-wrap uk-margin-small-top" style={{ gap: '6px' }}>
                <TicketCategoryBadge category={ticket.category} />
                <span className="uk-text-meta">
                  {t('admin.helpdesk.messageCount', { count: ticket.messageCount })}
                </span>
              </div>
              <div className="uk-text-meta uk-margin-small-top">
                {t('admin.helpdesk.createdBy')} @{ticket.creatorUsername} · {createdDate}
              </div>
              <div className="uk-text-meta">
                {t('admin.helpdesk.assignee')}:{' '}
                {ticket.assigneeUsername
                  ? `@${ticket.assigneeUsername}`
                  : t('admin.helpdesk.unassigned')}
                {lastMessageDate && (
                  <span>
                    {' '}· {t('admin.helpdesk.lastMessage')} {lastMessageDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TicketCard;
