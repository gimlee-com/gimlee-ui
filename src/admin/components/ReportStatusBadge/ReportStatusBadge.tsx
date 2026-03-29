import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportStatus } from '../../types/adminReport';

const statusClassMap: Record<ReportStatus, string> = {
  OPEN: 'uk-label-warning',
  IN_REVIEW: 'uk-label',
  RESOLVED: 'uk-label-success',
  DISMISSED: 'uk-label-danger',
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.reports.status.${status}`);
  const badgeClass = statusClassMap[status] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default ReportStatusBadge;
