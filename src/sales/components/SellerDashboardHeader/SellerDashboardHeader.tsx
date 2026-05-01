import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { createCardContainerVariants, cardItemVariants } from '../../../animations';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { formatPrice } from '../../../utils/currencyUtils';
import { salesService } from '../../services/salesService';
import type { SalesStatsDto, StatsPeriod } from '../../../types/api';
import styles from './SellerDashboardHeader.module.scss';

const PERIODS: StatsPeriod[] = ['DAILY', 'MONTHLY', 'YEARLY', 'ALL_TIME'];

export const SellerDashboardHeader: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SalesStatsDto | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('ALL_TIME');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    salesService.getStats(period).then(data => {
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [period]);

  return (
    <motion.div
      variants={createCardContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <Card className={styles.dashboard}>
        <CardBody className={styles.body}>
          {/* Period selector */}
          <motion.div variants={cardItemVariants} className={styles.periodSelector}>
            {PERIODS.map(p => (
              <button
                key={p}
                className={`${styles.periodChip} ${p === period ? styles.active : ''}`}
                onClick={() => setPeriod(p)}
              >
                {t(`sales.dashboard.period.${p}`)}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="uk-flex uk-flex-center uk-padding-small"
              >
                <Spinner ratio={1} />
              </motion.div>
            ) : stats ? (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.statsGrid}
              >
                {/* Revenue */}
                <div className={styles.statBlock}>
                  <div className={styles.statLabel}>{t('sales.dashboard.revenue')}</div>
                  <div className={styles.statValue}>
                    {stats.revenue.length > 0
                      ? stats.revenue.map((r, i) => (
                          <span key={r.currency}>
                            {i > 0 && <span className="uk-text-muted"> · </span>}
                            {formatPrice(r.amount, r.currency)}
                          </span>
                        ))
                      : <span className="uk-text-muted">{t('sales.dashboard.noRevenue')}</span>
                    }
                  </div>
                </div>

                {/* Active Orders */}
                <div className={styles.statBlock}>
                  <div className={styles.statLabel}>{t('sales.dashboard.activeOrders')}</div>
                  <div className={styles.statValue}>{stats.activeOrdersCount}</div>
                </div>

                {/* Completed */}
                <div className={styles.statBlock}>
                  <div className={styles.statLabel}>{t('sales.dashboard.completedOrders')}</div>
                  <div className={styles.statValue}>{stats.completedOrdersCount}</div>
                </div>

                {/* Total / Active Ads */}
                <div className={styles.statBlock}>
                  <div className={styles.statLabel}>{t('sales.dashboard.activeAds')}</div>
                  <div className={styles.statValue}>
                    {stats.activeAdsCount}
                    <span className="uk-text-meta"> / {stats.totalAdsCount} {t('sales.dashboard.totalAds').toLowerCase()}</span>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
};
