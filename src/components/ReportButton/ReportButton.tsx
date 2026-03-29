import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import type { ReportTargetType } from '../../admin/types/adminReport';
import ReportFormModal from '../ReportFormModal/ReportFormModal';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ targetType, targetId, className }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        type="button"
        className={`uk-button uk-button-link uk-text-meta${className ? ` ${className}` : ''}`}
        onClick={() => setIsModalOpen(true)}
      >
        <span uk-icon="icon: warning; ratio: 0.8" className="uk-margin-xsmall-right" />
        {t('report.submit')}
      </button>
      <ReportFormModal
        targetType={targetType}
        targetId={targetId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ReportButton;
