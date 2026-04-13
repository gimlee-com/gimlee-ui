import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { scaleItemVariants } from '../../animations';
import type { AdDto } from '../../types/api';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { Label } from '../../components/uikit/Label/Label';
import { Button } from '../../components/uikit/Button/Button';
import { Icon } from '../../components/uikit/Icon/Icon';
import { Grid } from '../../components/uikit/Grid/Grid';
import { formatPrice } from '../../utils/currencyUtils';
import { Image } from '../../components/Image/Image';
import styles from './SalesAdCard.module.scss';

interface SalesAdCardProps {
  ad: AdDto;
  onToggleStatus: (ad: AdDto) => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const SalesAdCard: React.FC<SalesAdCardProps> = ({ ad, onToggleStatus }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const photoUrl = ad.mainPhotoPath 
    ? `${API_URL}/api/media?p=/thumbs-sm${ad.mainPhotoPath}` 
    : '/placeholder-image.svg';

  const statusVariant = ad.status === 'ACTIVE' ? 'success' : 'warning';

  // Freeze-aware status for active ads
  const getFreezeStatus = () => {
    if (ad.status !== 'ACTIVE') return null;
    if (!ad.volatilityProtection) return null;
    const frozen = ad.frozenCurrencies || [];
    const settlements = ad.settlementCurrencies || [];
    if (frozen.length === 0) return null;
    if (frozen.length >= settlements.length) return 'fullyFrozen';
    return 'partiallyFrozen';
  };
  const freezeStatus = getFreezeStatus();

  return (
    <motion.div
      layout
      variants={scaleItemVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      className="uk-height-1-1"
    >
      <Card className={styles.salesCard}>
        <div className={styles.mediaWrapper}>
          <Image 
            src={photoUrl} 
            alt={ad.title} 
            className={styles.image} 
            containerClassName={styles.image}
          />
          <div className={styles.statusOverlay}>
            <Label variant={statusVariant}>{ad.status}</Label>
            {freezeStatus === 'fullyFrozen' && (
              <Label variant="danger" className="uk-margin-xsmall-left">{t('pricing.frozenStatus.fullyFrozen')}</Label>
            )}
            {freezeStatus === 'partiallyFrozen' && (
              <Label variant="warning" className="uk-margin-xsmall-left">{t('pricing.frozenStatus.partiallyFrozen')}</Label>
            )}
          </div>
        </div>

        <CardBody className={styles.content}>
          <Link 
            to={`/ads/${ad.id}`} 
            state={{ from: location.pathname + location.search }}
            className={styles.titleLink}
          >
            {ad.title}
          </Link>
          
          <div className={styles.price}>
            {ad.price ? (
              formatPrice(ad.price.amount, ad.price.currency)
            ) : (
              <span className="uk-text-muted">-</span>
            )}
          </div>

          <div className={styles.meta}>
            {/* Settlement currencies */}
            <div className={styles.metaItem}>
              <span className={styles.icon}><Icon icon="credit-card" ratio={0.75} /></span>
              {ad.settlementCurrencies.join(', ')}
              {ad.volatilityProtection && (
                <span className="uk-text-primary uk-margin-xsmall-left" title={t('pricing.volatilityProtection')}>
                  <Icon icon="lock" ratio={0.7} />
                </span>
              )}
            </div>
            {ad.location?.city && (
              <div className={styles.metaItem}>
                <span className={styles.icon}><Icon icon="location" ratio={0.75} /></span>
                {ad.location.city.name}{ad.location.city.district ? `, ${ad.location.city.district}` : ''}
              </div>
            )}
            {ad.createdAt && (
              <div className={styles.metaItem}>
                <span className={styles.icon}><Icon icon="calendar" ratio={0.75} /></span>
                {new Date(ad.createdAt).toLocaleDateString()}
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.icon}><Icon icon="cart" ratio={0.75} /></span>
              {t('ads.stock')}: {ad.availableStock} / {ad.stock}
            </div>
          </div>
        </CardBody>

        <div className={styles.actions}>
          <Grid gap="small" className="uk-child-width-1-2">
            <div>
              <Link 
                to={`/sales/ads/edit/${ad.id}`} 
                className="uk-button uk-button-default uk-button-small uk-width-1-1"
                style={{ borderRadius: '6px' }}
              >
                {t('common.edit')}
              </Link>
            </div>
            <div>
              <Button 
                size="small" 
                variant={ad.status === 'ACTIVE' ? 'default' : 'primary'}
                onClick={() => onToggleStatus(ad)}
                className="uk-width-1-1"
                style={{ borderRadius: '6px' }}
              >
                {ad.status === 'ACTIVE' ? t('ads.deactivate') : t('ads.activate')}
              </Button>
            </div>
          </Grid>
        </div>
      </Card>
    </motion.div>
  );
};
