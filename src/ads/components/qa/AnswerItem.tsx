import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AnswerDto } from '../../types/qa';
import { formatRelativeTimeFromIso } from '../../../utils/dateUtils';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import { Label } from '../../../components/uikit/Label/Label';
import ReportButton from '../../../components/ReportButton/ReportButton';
import styles from './AnswerItem.module.scss';

interface AnswerItemProps {
  answer: AnswerDto;
}

export const AnswerItem: React.FC<AnswerItemProps> = ({ answer }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.answerContainer}>
      <div className="uk-grid-small uk-flex-middle" data-uk-grid="">
        <div className="uk-width-auto">
          <GeometricAvatar username={answer.authorUsername} size={28} />
        </div>
        <div className="uk-width-expand">
          <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: 6 }}>
            <span className="uk-text-bold uk-text-small">{answer.authorUsername}</span>
            {answer.type === 'SELLER' ? (
              <Label variant="success" className={styles.sellerBadge}>
                {t('questions.sellerAnswer')}
              </Label>
            ) : (
              <Label className={styles.communityBadge}>
                {t('questions.communityAnswer')}
              </Label>
            )}
            <span className="uk-text-meta">{formatRelativeTimeFromIso(answer.createdAt)}</span>
          </div>
        </div>
      </div>
      <p className="uk-margin-small-top uk-margin-remove-bottom uk-text-break">
        {answer.text}
      </p>
      <div className="uk-margin-small-top">
        <ReportButton targetType="ANSWER" targetId={answer.id} />
      </div>
    </div>
  );
};
