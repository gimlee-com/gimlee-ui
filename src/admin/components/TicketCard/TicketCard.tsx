import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { pageItemVariants } from '../../../animations';
import TicketPriorityBadge from '../TicketPriorityBadge/TicketPriorityBadge';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { ticketCategoryIcon } from '../../utils/ticketCategoryIcon';
import { formatRelativeTime } from '../../../utils/dateUtils';
import type { TicketListItemDto, TicketStatus } from '../../types/adminTicket';
import styles from './TicketCard.module.scss';

interface TicketCardProps {
  ticket: TicketListItemDto;
}

const statusCardClasses: Record<TicketStatus, string> = {
  OPEN: styles.statusOpen,
  IN_PROGRESS: styles.statusInProgress,
  AWAITING_USER: styles.statusAwaitingUser,
  RESOLVED: styles.statusResolved,
  CLOSED: styles.statusClosed,
};

const dotClasses: Record<TicketStatus, string> = {
  OPEN: styles.dotOpen,
  IN_PROGRESS: styles.dotInProgress,
  AWAITING_USER: styles.dotAwaitingUser,
  RESOLVED: styles.dotResolved,
  CLOSED: styles.dotClosed,
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <motion.div variants={pageItemVariants} layout>
      <Link
        to={`/admin/tickets/${ticket.id}`}
        state={{ from: location.pathname + location.search }}
        className="uk-link-reset"
      >
        <div className={`uk-card uk-card-default uk-card-hover uk-card-body uk-card-small ${styles.card} ${statusCardClasses[ticket.status]}`}>
          {/* Header: Category icon+label | Status dot + Message count */}
          <div className={styles.header}>
            <span className={styles.categoryLabel}>
              <Icon icon={ticketCategoryIcon[ticket.category]} ratio={0.8} />
              {t(`admin.helpdesk.category.${ticket.category}`)}
            </span>
            <div className={styles.headerRight}>
              <span className={styles.statusDot}>
                <span className={`${styles.dot} ${dotClasses[ticket.status]}`} />
                {t(`admin.helpdesk.status.${ticket.status}`)}
              </span>
              {ticket.messageCount > 0 && (
                <span className={styles.messageCount}>
                  <Icon icon="comment" ratio={0.7} />
                  {ticket.messageCount}
                </span>
              )}
            </div>
          </div>

          {/* Content: Subject */}
          <div className={styles.content}>
            <div className={styles.subject}>{ticket.subject}</div>
          </div>

          {/* Footer: Priority badge | Creator + time | Last activity | Assignee */}
          <div className={styles.footer}>
            <TicketPriorityBadge priority={ticket.priority} />
            <div className={styles.footerRight}>
              <span className={styles.creatorInfo}>
                @{ticket.creatorUsername} · {formatRelativeTime(ticket.createdAt)}
              </span>
              {ticket.lastMessageAt && (
                <span className={styles.lastActivity}>
                  {t('admin.helpdesk.card.lastActivity')}: {formatRelativeTime(ticket.lastMessageAt)}
                </span>
              )}
              <span className={styles.assigneeInfo}>
                {ticket.assigneeUsername
                  ? `→ @${ticket.assigneeUsername}`
                  : t('admin.helpdesk.unassigned')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TicketCard;
