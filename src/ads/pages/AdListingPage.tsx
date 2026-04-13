import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { adService } from '../services/adService';
import type { PageAdDiscoveryPreviewDto } from '../../types/api';
import { AdCard } from '../components/AdCard';
import { AdSearchFilters } from '../components/AdSearchFilters/AdSearchFilters';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { SmartPagination } from '../../components/SmartPagination';
import { createPageContainerVariants, pageItemVariants } from '../../animations';

const AdListingPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageAdDiscoveryPreviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setLoading(true);
    setError(null);
    const params = Object.fromEntries(searchParams.entries());
    adService.searchAds(params, { signal: controller.signal })
      .then(setData)
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
  }, [searchParams, t]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('p', page.toString());
    setSearchParams(newParams);
  };

  return (
    <motion.div
      variants={createPageContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={pageItemVariants}>
        <Heading as="h2">{t('ads.browseTitle')}</Heading>
      </motion.div>
  
      <motion.div variants={pageItemVariants}>
        <AdSearchFilters />
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="uk-flex uk-flex-center"
          >
            <Spinner ratio={2} />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            variants={pageItemVariants}
          >
            <Alert variant="danger">
              {error}
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial="hidden"
            animate="visible"
            variants={createPageContainerVariants(0.05)}
          >
            <Grid gap="medium" match className="uk-child-width-1-2@s uk-child-width-1-4@m">
              <AnimatePresence mode="popLayout">
                {data?.content.map(ad => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </AnimatePresence>
            </Grid>
            
            {data && data.page.totalPages > 1 && (
              <motion.div variants={pageItemVariants} className="uk-margin-large-top">
                <SmartPagination 
                  currentPage={data.page.number} 
                  totalPages={data.page.totalPages} 
                  onPageChange={handlePageChange}
                  className="uk-flex-center"
                />
              </motion.div>
            )}
            
            {data?.content.length === 0 && (
              <motion.div variants={pageItemVariants} className="uk-text-center uk-margin-large-top">
                <p>{t('ads.noAdsFound')}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdListingPage;
