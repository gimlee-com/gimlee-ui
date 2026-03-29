import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TicketStatus } from '../../types/adminTicket';

const statusClassMap: Record<TicketStatus, string> = {
  OPEN: 'uk-label-warning',
  IN_PROGRESS: 'uk-label',
  AWAITING_USER: 'uk-label',
  RESOLVED: 'uk-label-success',
  CLOSED: 'uk-label-danger',
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.helpdesk.status.${status}`);
  const badgeClass = statusClassMap[status] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default TicketStatusBadge;
