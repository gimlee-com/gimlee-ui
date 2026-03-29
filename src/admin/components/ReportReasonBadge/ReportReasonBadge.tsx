import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportReason } from '../../types/adminReport';

const reasonClassMap: Record<ReportReason, string> = {
  SPAM: 'uk-label-warning',
  FRAUD: 'uk-label-danger',
  INAPPROPRIATE_CONTENT: 'uk-label-danger',
  COUNTERFEIT: 'uk-label-danger',
  HARASSMENT: 'uk-label-danger',
  COPYRIGHT: 'uk-label-warning',
  WRONG_CATEGORY: 'uk-label',
  OTHER: 'uk-label',
};

interface ReportReasonBadgeProps {
  reason: ReportReason;
  className?: string;
}

const ReportReasonBadge: React.FC<ReportReasonBadgeProps> = ({ reason, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.reports.reason.${reason}`);
  const badgeClass = reasonClassMap[reason] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default ReportReasonBadge;
