import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from '../StarRating/StarRating';
import { useReputation } from '../../hooks/useReputation';
import type { RepKind } from '../../types/ratings';
import styles from './ReputationSummary.module.scss';

interface ReputationSummaryProps {
  userId: string;
  initialRepKind?: RepKind;
  className?: string;
}

export default function ReputationSummary({
  userId,
  initialRepKind = 'SEL',
  className,
}: ReputationSummaryProps) {
  const { t } = useTranslation();
  const [repKind, setRepKind] = useState<RepKind>(initialRepKind);
  const { aggregate, loading } = useReputation(userId, repKind);

  const maxBarCount = aggregate
    ? Math.max(...Object.values(aggregate.dist), 1)
    : 1;

  return (
    <div className={`${styles.summary} ${className || ''}`}>
      <div className={styles.scoreSection}>
        {aggregate && aggregate.count > 0 ? (
          <>
            <span className={styles.bigScore}>{aggregate.average.toFixed(1)}</span>
            <StarRating value={aggregate.average} size="md" />
            <span className={styles.totalCount}>
              {t('reviews.reputation.basedOn', { count: aggregate.count })}
            </span>
          </>
        ) : (
          !loading && (
            <span className={styles.noReviews}>
              {t('reviews.reputation.noReviews')}
            </span>
          )
        )}
      </div>

      {aggregate && aggregate.count > 0 && (
        <div className={styles.histogramSection}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = aggregate.dist[String(star)] || 0;
            const pct = maxBarCount > 0 ? (count / maxBarCount) * 100 : 0;
            return (
              <div key={star} className={styles.histogramRow}>
                <span className={styles.starLabel}>
                  {t('reviews.reputation.starLabel', { count: star })}
                </span>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${repKind === 'SEL' ? styles.active : ''}`}
          onClick={() => setRepKind('SEL')}
          type="button"
        >
          {t('reviews.reputation.sellerRep')}
        </button>
        <button
          className={`${styles.tab} ${repKind === 'BUY' ? styles.active : ''}`}
          onClick={() => setRepKind('BUY')}
          type="button"
        >
          {t('reviews.reputation.buyerRep')}
        </button>
      </div>
    </div>
  );
}
