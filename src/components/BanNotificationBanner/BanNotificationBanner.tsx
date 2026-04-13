import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { bannerProps } from '../../animations';
import { Alert } from '../uikit/Alert/Alert';
import { Icon } from '../uikit/Icon/Icon';
import { useAuth } from '../../context/AuthContext';
import { useCountdown } from '../../hooks/useCountdown';

const BanCountdown: React.FC<{ bannedUntil: number }> = ({ bannedUntil }) => {
  const { t } = useTranslation();
  const { days, hours, minutes, seconds, isExpired } = useCountdown(bannedUntil);

  if (isExpired) return null;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return (
    <p className="uk-margin-remove uk-margin-small-top">
      <span className="uk-text-bold">{t('ban.banner.temporary')}</span>{' '}
      <span className="uk-text-bold">{parts.join(' ')}</span>
    </p>
  );
};

export const BanNotificationBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isBanned, banReason, bannedUntil } = useAuth();

  return (
    <AnimatePresence>
      {isBanned && (
        <motion.div
          {...bannerProps}
          className="uk-margin-small-bottom"
        >
          <Alert variant="danger" className="uk-border-rounded">
            <div className="uk-flex uk-flex-middle">
              <Icon icon="ban" className="uk-margin-small-right" ratio={1.2} />
              <div>
                <p className="uk-margin-remove uk-text-bold">
                  {t('ban.banner.message')}
                </p>
                {banReason && (
                  <p className="uk-margin-remove uk-margin-small-top">
                    {t('ban.banner.reason', { reason: banReason })}
                  </p>
                )}
                {bannedUntil ? (
                  <BanCountdown bannedUntil={bannedUntil} />
                ) : (
                  <p className="uk-margin-remove uk-margin-small-top uk-text-bold">
                    {t('ban.banner.permanent')}
                  </p>
                )}
                <p className="uk-margin-remove uk-margin-small-top uk-text-meta">
                  {t('ban.banner.contactSupport')}
                </p>
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
