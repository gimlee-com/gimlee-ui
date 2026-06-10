import type { RatingAggregateResponseDto } from '../../types/ratings';
import styles from './ReputationBadge.module.scss';

interface ReputationBadgeProps {
  aggregate: RatingAggregateResponseDto;
  size?: 'sm' | 'md';
  className?: string;
}

function getTierClass(avg: number): string {
  if (avg >= 4.5) return styles.tierExcellent;
  if (avg >= 3.5) return styles.tierGood;
  if (avg >= 2.5) return styles.tierAverage;
  return styles.tierPoor;
}

export default function ReputationBadge({
  aggregate,
  size = 'md',
  className,
}: ReputationBadgeProps) {
  if (!aggregate) return null;

  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const tierClass = getTierClass(aggregate.average);

  return (
    <span className={`${styles.badge} ${sizeClass} ${tierClass} ${className || ''}`}>
      <svg className={styles.star} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>{aggregate.average.toFixed(1)}</span>
      <span>({aggregate.count})</span>
    </span>
  );
}
