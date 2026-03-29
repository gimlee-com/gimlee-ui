import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportTargetType } from '../../types/adminReport';

const typeClassMap: Record<ReportTargetType, string> = {
  AD: 'uk-label',
  USER: 'uk-label-warning',
  MESSAGE: 'uk-label',
  QUESTION: 'uk-label',
  ANSWER: 'uk-label',
};

interface ReportTypeBadgeProps {
  targetType: ReportTargetType;
  className?: string;
}

const ReportTypeBadge: React.FC<ReportTypeBadgeProps> = ({ targetType, className }) => {
  const { t } = useTranslation();

  const label = t(`admin.reports.targetType.${targetType}`);
  const badgeClass = typeClassMap[targetType] ?? 'uk-label';

  return (
    <span className={`uk-label ${badgeClass}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
};

export default ReportTypeBadge;
