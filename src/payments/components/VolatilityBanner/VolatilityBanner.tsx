import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { bannerProps } from '../../../animations';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { useAuth } from '../../../context/AuthContext';
import { useVolatilityStatus } from '../../hooks/useVolatilityStatus';

const CountdownTimer: React.FC<{ endsAt: string }> = ({ endsAt }) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!remaining) return null;
  return <span className="uk-text-bold"> ({remaining})</span>;
};

export const VolatilityBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { volatileCurrencies, staleCurrencies, cooldownCurrencies, hasIssues, loading } = useVolatilityStatus({ enabled: isAuthenticated });

  if (loading || !hasIssues) return null;

  return (
    <AnimatePresence>
      <motion.div
        {...bannerProps}
        className="uk-margin-small-bottom"
      >
        {volatileCurrencies.map(s => (
          <Alert key={`volatile-${s.currency}`} variant="warning" className="uk-border-rounded uk-margin-small-bottom">
            <div className="uk-flex uk-flex-middle">
              <Icon icon="warning" className="uk-margin-small-right" ratio={1.1} />
              <p className="uk-margin-remove">
                {t('volatility.banner.volatile', { currency: s.currency })}
              </p>
            </div>
          </Alert>
        ))}

        {staleCurrencies.map(s => (
          <Alert key={`stale-${s.currency}`} variant="warning" className="uk-border-rounded uk-margin-small-bottom">
            <div className="uk-flex uk-flex-middle">
              <Icon icon="warning" className="uk-margin-small-right" ratio={1.1} />
              <p className="uk-margin-remove">
                {t('volatility.banner.stale', { currency: s.currency })}
              </p>
            </div>
          </Alert>
        ))}

        {cooldownCurrencies.map(s => (
          <Alert key={`cooldown-${s.currency}`} variant="primary" className="uk-border-rounded uk-margin-small-bottom">
            <div className="uk-flex uk-flex-middle">
              <Icon icon="clock" className="uk-margin-small-right" ratio={1.1} />
              <p className="uk-margin-remove">
                {t('volatility.banner.cooldown', { currency: s.currency })}
                {s.cooldownEndsAt && <CountdownTimer endsAt={s.cooldownEndsAt} />}
              </p>
            </div>
          </Alert>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
