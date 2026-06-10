import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { spring } from '../../../animations/springs';
import { Image } from '../../../components/Image/Image';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import { useUserLookup } from '../../hooks/useUserLookup';
import { formatCountdown, isElapsed, nowInMicros } from '../../utils/ratingTimeUtils';
import type { EligibilityResponseDto } from '../../types/ratings';
import styles from './EligibilityCard.module.scss';

interface EligibilityCardProps {
  eligibility: EligibilityResponseDto;
  onRate?: (eligibility: EligibilityResponseDto) => void;
}

export default function EligibilityCard({
  eligibility,
  onRate,
}: EligibilityCardProps) {
  const { t } = useTranslation();
  const { userMap } = useUserLookup([eligibility.rateeId]);
  const ratee = userMap.get(eligibility.rateeId);

  const isActive = eligibility.status === 'CSD';
  const isExpired = !isActive && isElapsed(eligibility.expiresAt);

  const timeRemaining = isActive
    ? formatCountdown(eligibility.expiresAt, nowInMicros())
    : null;

  return (
    <motion.div
      className={`${styles.card} ${isExpired ? styles.expired : ''}`}
      layout
      transition={spring}
    >
      <div className={styles.header}>
        <div className={styles.rateeInfo}>
          <GeometricAvatar username={eligibility.rateeId} size={32} />
          <div>
            <span className={styles.rateeName}>
              {ratee?.username || t('common.loading')}
            </span>
            <span className={styles.contextId}>
              {t('reviews.eligibilityCard.contextId')}: {eligibility.contextId.slice(0, 8)}...
            </span>
          </div>
        </div>

        <div className={styles.statusBadge}>
          {isActive ? (
            <span className={styles.statusActive}>
              {t('reviews.eligibilityCard.active')}
            </span>
          ) : (
            <span className={styles.statusPending}>
              {t('reviews.eligibilityCard.pending')}
            </span>
          )}
        </div>
      </div>

      {timeRemaining && (
        <div className={styles.countdown}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.clockIcon}>
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          <span>{t('reviews.eligibilityCard.expiresIn', { time: timeRemaining })}</span>
        </div>
      )}

      {eligibility.snapshot && eligibility.snapshot.items.length > 0 && (
        <div className={styles.snapshot}>
          {eligibility.snapshot.items.map((item, idx) => (
            <div key={idx} className={styles.snapshotItem}>
              {item.thumbPath && (
                <Image
                  src={item.thumbPath}
                  alt={item.name}
                  containerClassName={styles.snapshotThumb}
                />
              )}
              <span className={styles.snapshotName}>{item.name}</span>
              <span className={styles.snapshotQty}>×{item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {onRate && isActive && (
        <button
          className="uk-button uk-button-primary uk-width-1-1"
          onClick={() => onRate(eligibility)}
          type="button"
        >
          {t('reviews.eligibilityCard.writeReview')}
        </button>
      )}

      {isExpired && (
        <div className={styles.expiredNotice}>
          {t('reviews.eligibilityCard.expired')}
        </div>
      )}
    </motion.div>
  );
}
