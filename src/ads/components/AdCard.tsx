import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { scaleItemVariants } from '../../animations';
import type { AdDiscoveryPreviewDto } from '../../types/api';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { Label } from '../../components/uikit/Label/Label';
import { Icon } from '../../components/uikit/Icon/Icon';
import { formatPrice } from '../../utils/currencyUtils';
import { Image } from '../../components/Image/Image';
import { WatchButton } from './WatchButton/WatchButton';
import styles from './AdCard.module.scss';

interface AdCardProps {
  ad: AdDiscoveryPreviewDto;
  onWatchToggle?: (adId: string, isWatched: boolean) => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const AdCard: React.FC<AdCardProps> = ({ ad, onWatchToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isWatched, setIsWatched] = useState(!!ad.isWatched);
  const photoUrl = ad.mainPhotoPath ? `${API_URL}/api/media?p=/thumbs-sm${ad.mainPhotoPath}` : '/placeholder-image.svg';

  const isOutOfStock = ad.isBuyable === false;
  const isFrozen = (ad.frozenCurrencies?.length || 0) > 0;

  return (
    <motion.div
      variants={scaleItemVariants}
      initial="hidden"
      animate="visible"
      className="uk-height-1-1"
    >
      <Card className={styles.adCard}>
        <div className={styles.mediaWrapper}>
          <div className={styles.badges}>
            {isOutOfStock && !isFrozen && <Label variant="warning">{t('ads.status.outOfStock')}</Label>}
            {isFrozen && !isOutOfStock && <Label variant="warning">{t('pricing.partiallyFrozen')}</Label>}
          </div>
          <WatchButton
            adId={ad.id}
            isWatched={isWatched}
            variant="overlay"
            onToggle={(watched) => {
              setIsWatched(watched);
              onWatchToggle?.(ad.id, watched);
            }}
          />
          <Image 
            src={photoUrl} 
            alt={ad.title} 
            className={styles.image} 
            containerClassName={styles.image}
            loading="lazy" 
          />
        </div>

        <CardBody className={styles.content}>
          <Link 
            to={`/ads/${ad.id}`} 
            state={{ from: location.pathname + location.search }}
            className={styles.title}
          >
            {ad.title}
          </Link>

          <div className={styles.priceWrapper}>
            {ad.preferredPrice ? (
              <span className={styles.primaryPrice}>
                {formatPrice(ad.preferredPrice.amount, ad.preferredPrice.currency)}
              </span>
            ) : (
              <span className="uk-text-muted">-</span>
            )}
          </div>

          {ad.settlementCurrencies && ad.settlementCurrencies.length > 0 && (
            <div className={styles.locationWrapper}>
              <span className={styles.icon}>
                <Icon icon="credit-card" ratio={0.8} />
              </span>
              <span>{ad.settlementCurrencies.join(', ')}</span>
            </div>
          )}

          {ad.location?.city && (
            <div className={styles.locationWrapper}>
              <span className={styles.icon}>
                <Icon icon="location" ratio={0.8} />
              </span>
              <span>
                {ad.location.city.name}{ad.location.city.district ? `, ${ad.location.city.district}` : ''}
              </span>
            </div>
          )}

          <div className={styles.footer}>
            <Icon icon="chevron-right" ratio={0.8} className="uk-text-muted" />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
