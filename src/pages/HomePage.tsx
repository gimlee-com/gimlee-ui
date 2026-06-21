import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { adService } from '../ads/services/adService';
import type { AdDiscoveryPreviewDto } from '../types/api';
import { AdCard } from '../ads/components/AdCard';
import { Grid } from '../components/uikit/Grid/Grid';
import { Heading } from '../components/uikit/Heading/Heading';
import { Spinner } from '../components/uikit/Spinner/Spinner';
import { Alert } from '../components/uikit/Alert/Alert';
import { ExperimentalDisclaimer } from '../components/ExperimentalDisclaimer';
import { ChatFloatingButton } from '../chat/components/ChatFloatingButton/ChatFloatingButton';
import { useAuth } from '../context/AuthContext';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { publicChatId } = useAuth();
  const [featuredAds, setFeaturedAds] = useState<AdDiscoveryPreviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chatSectionRef = useRef<HTMLElement>(null);
  const intersection = useIntersectionObserver(chatSectionRef, { threshold: 0 });
  const isChatVisible = !!intersection?.isIntersecting;

  useEffect(() => {
    const controller = new AbortController();
    
    adService.getFeaturedAds({ signal: controller.signal })
      .then(response => setFeaturedAds(response.content))
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
  }, [t]);

  return (
    <div>
      <ExperimentalDisclaimer />
      
      <section className="uk-section uk-section-small">
        <div className="uk-flex uk-flex-between uk-flex-middle">
          <Heading as="h2">{t('home.featuredAds')}</Heading>
        </div>
        {loading ? (
          <div className="uk-flex uk-flex-center">
            <Spinner ratio={2} />
          </div>
        ) : error ? (
          <Alert variant="danger">
            {error}
          </Alert>
        ) : (
          <Grid gap="adaptive" match className="uk-child-width-1-2 uk-child-width-1-3@s uk-child-width-1-4@m uk-child-width-1-5@l">
            {featuredAds.map(ad => (
              <div key={ad.id}>
                <AdCard ad={ad} />
              </div>
            ))}
          </Grid>
        )}
      </section>

      {publicChatId && (
        <ChatFloatingButton chatId={publicChatId} visible={!isChatVisible} />
      )}
    </div>
  );
};

export default HomePage;
