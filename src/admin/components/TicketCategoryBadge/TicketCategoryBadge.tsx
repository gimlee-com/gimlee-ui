import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TicketCategory } from '../../types/adminTicket';

const categoryClassMap: Record<TicketCategory, string> = {
  ACCOUNT_ISSUE: 'uk-label',
  PAYMENT_PROBLEM: 'uk-label-warning',
  ORDER_DISPUTE: 'uk-label-warning',
  TECHNICAL_BUG: 'uk-label',
  FEATURE_REQUEST: 'uk-label',
  SAFETY_CONCERN: 'uk-label-danger',
  OTHER: 'uk-label',
};

interface TicketCategoryBadgeProps {
  category: TicketCategory;
  className?: string;
}

const TicketCategoryBadge: React.FC<TicketCategoryBadgeProps> = ({ category, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.helpdesk.category.${category}`);
  const badgeClass = categoryClassMap[category] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default TicketCategoryBadge;
