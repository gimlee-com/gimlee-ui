import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { watchlistService } from '../services/watchlistService';
import type { AdDiscoveryPreviewDto } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Icon } from '../../components/uikit/Icon/Icon';
import { Button } from '../../components/uikit/Button/Button';
import { AdCard } from '../components/AdCard';
import { createPageContainerVariants, pageItemVariants } from '../../animations';

const AdWatchlistPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [ads, setAds] = useState<AdDiscoveryPreviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setLoading(true);
    setError(null);

    watchlistService.getMyWatchedAds({ signal: controller.signal })
      .then(data => setAds(data))
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('auth.errors.generic'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated, navigate, location.pathname, t]);

  const handleWatchToggle = useCallback((adId: string, isWatched: boolean) => {
    if (!isWatched) {
      // Remove from list with animation
      setAds(prev => prev.filter(ad => ad.id !== adId));
    }
  }, []);

  if (loading) {
    return <div className="uk-flex uk-flex-center"><Spinner ratio={2} /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <motion.div
      variants={createPageContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={pageItemVariants}>
        <Heading as="h2">{t('watchlist.title')}</Heading>
      </motion.div>

      {ads.length === 0 ? (
        <motion.div variants={pageItemVariants} className="uk-text-center uk-padding-large">
          <Icon icon="heart" ratio={3} className="uk-text-muted uk-margin-small-bottom" />
          <Heading as="h4" className="uk-text-muted">{t('watchlist.empty')}</Heading>
          <p className="uk-text-muted">{t('watchlist.emptyHint')}</p>
          <Button variant="primary" className="uk-border-rounded" onClick={() => navigate('/ads')}>
            {t('navbar.browseAds')}
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <Grid className="uk-child-width-1-2 uk-child-width-1-3@s uk-child-width-1-4@l" gap="medium">
            {ads.map(ad => (
              <motion.div
                key={ad.id}
                variants={pageItemVariants}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                layout
              >
                <AdCard ad={{ ...ad, isWatched: true }} onWatchToggle={handleWatchToggle} />
              </motion.div>
            ))}
          </Grid>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AdWatchlistPage;
