import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { adService } from '../../../ads/services/adService';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Heading } from '../../../components/uikit/Heading/Heading';
import type { AdVisitStatsDto } from '../../../types/api';

interface AdVisitStatsCardProps {
  adId: string;
}

const AdVisitStatsCard: React.FC<AdVisitStatsCardProps> = ({ adId }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdVisitStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const data = await adService.getAdStats(adId);
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    };

    void fetchStats();
    return () => { cancelled = true; };
  }, [adId]);

  if (failed) return null;

  if (loading) {
    return (
      <Card className="uk-margin-bottom">
        <CardBody>
          <div className="uk-text-center">
            <div uk-spinner="" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!stats) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = stats.daily?.[today] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <Card className="uk-margin-bottom">
        <CardBody>
          <Heading as="h4">{t('sales.adStats.title')}</Heading>

          <div className="uk-grid-small uk-child-width-1-2@s uk-child-width-1-4@m" uk-grid="">
            <div className="uk-text-center">
              <div className="uk-text-bold uk-text-large">{todayCount}</div>
              <div className="uk-text-meta">{t('sales.adStats.daily')}</div>
            </div>
            <div className="uk-text-center">
              <div className="uk-text-bold uk-text-large">{stats.monthly}</div>
              <div className="uk-text-meta">{t('sales.adStats.monthly')}</div>
            </div>
            <div className="uk-text-center">
              <div className="uk-text-bold uk-text-large">{stats.yearly}</div>
              <div className="uk-text-meta">{t('sales.adStats.yearly')}</div>
            </div>
            <div className="uk-text-center">
              <div className="uk-text-bold uk-text-large">{stats.total}</div>
              <div className="uk-text-meta">{t('sales.adStats.total')}</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AdVisitStatsCard;
