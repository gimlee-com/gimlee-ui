import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { createPageContainerVariants, timelineItemVariants } from '../../animations';
import { Label } from '../uikit/Label/Label';
import type { StatusChangeDto, PurchaseStatus } from '../../types/api';
import styles from './OrderStatusTimeline.module.scss';

interface OrderStatusTimelineProps {
  history: StatusChangeDto[];
}

const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status as PurchaseStatus) {
    case 'COMPLETE': return 'success';
    case 'AWAITING_PAYMENT': return 'warning';
    case 'CANCELLED':
    case 'FAILED_PAYMENT_TIMEOUT':
    case 'FAILED_PAYMENT_UNDERPAID': return 'danger';
    default: return 'default';
  }
};

const getStatusLabel = (status: string, t: (key: string) => string): string => {
  switch (status) {
    case 'CREATED': return t('purchases.statusCreated');
    case 'AWAITING_PAYMENT': return t('purchases.statusAwaiting');
    case 'COMPLETE': return t('purchases.statusComplete');
    case 'CANCELLED': return t('purchases.statusCancelled');
    case 'FAILED_PAYMENT_TIMEOUT': return t('purchases.statusFailedTimeout');
    case 'FAILED_PAYMENT_UNDERPAID': return t('purchases.statusFailedUnderpaid');
    default: return status;
  }
};

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ history }) => {
  const { t } = useTranslation();

  if (!history || history.length === 0) return null;

  return (
    <motion.div
      variants={createPageContainerVariants(0.06)}
      initial="hidden"
      animate="visible"
      className={styles.timeline}
    >
      {history.map((entry, index) => (
        <motion.div
          key={`${entry.status}-${index}`}
          variants={timelineItemVariants}
          className={styles.entry}
        >
          <div className={styles.indicator}>
            <div className={`${styles.dot} ${styles[getStatusVariant(entry.status)]}`} />
            {index < history.length - 1 && <div className={styles.line} />}
          </div>
          <div className={styles.content}>
            <Label variant={getStatusVariant(entry.status)} className={styles.statusLabel}>
              {getStatusLabel(entry.status, t)}
            </Label>
            <span className="uk-text-meta uk-margin-small-left">
              {new Date(entry.timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
