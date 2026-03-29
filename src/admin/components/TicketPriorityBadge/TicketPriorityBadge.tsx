import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TicketPriority } from '../../types/adminTicket';

const priorityClassMap: Record<TicketPriority, string> = {
  LOW: 'uk-label',
  MEDIUM: 'uk-label-warning',
  HIGH: 'uk-label-danger',
  URGENT: 'uk-label-danger',
};

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.helpdesk.priority.${priority}`);
  const badgeClass = priorityClassMap[priority] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default TicketPriorityBadge;
