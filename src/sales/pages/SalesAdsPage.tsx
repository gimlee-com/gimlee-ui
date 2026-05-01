import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { motion, AnimatePresence } from 'motion/react';
import { salesService } from '../services/salesService';
import type { SalesAdDto, PageSalesAdDto } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Button } from '../../components/uikit/Button/Button';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Alert } from '../../components/uikit/Alert/Alert';
import { SalesAdCard } from '../components/SalesAdCard';
import { SmartPagination } from '../../components/SmartPagination';
import { SellerDashboardHeader } from '../components/SellerDashboardHeader/SellerDashboardHeader';
import SalesSubNav from '../components/SalesSubNav';
import { useListParams, type ListParamDef } from '../../hooks/useListParams';
import { createPageContainerVariants, pageItemVariants } from '../../animations';

const paramDefs: ListParamDef[] = [
  { key: 'p', type: 'number', defaultValue: 0 },
];

interface AdsListParams {
  p?: number;
}

const SalesAdsPage: React.FC = () => {
  const { t } = useTranslation();
  const { params, setPage } = useListParams<AdsListParams>(paramDefs);
  const [adsPage, setAdsPage] = useState<PageSalesAdDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await salesService.getMyAds({
        by: 'CREATED_DATE',
        dir: 'DESC',
        p: (params.p as number) || 0,
      });
      setAdsPage(response);
    } catch (err: unknown) {
      setError((err as Error).message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [params, t]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleToggleStatus = async (ad: SalesAdDto) => {
    try {
      if (ad.status === 'ACTIVE') {
        await salesService.deactivateAd(ad.id);
      } else {
        await salesService.activateAd(ad.id);
      }
      fetchAds();
    } catch (err: unknown) {
      UIkit.modal.alert((err as Error).message || t('auth.errors.generic'));
    }
  };

  return (
    <motion.div
      variants={createPageContainerVariants()}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={pageItemVariants} className="uk-flex uk-flex-between uk-flex-middle uk-margin-bottom">
        <Heading as="h2">{t('sales.title')}</Heading>
        <Button variant="primary" onClick={() => navigate('/sales/ads/create')}>
          {t('ads.createNew')}
        </Button>
      </motion.div>

      <motion.div variants={pageItemVariants}>
        <SellerDashboardHeader />
      </motion.div>

      <motion.div variants={pageItemVariants}>
        <SalesSubNav />
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && !adsPage ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            className="uk-flex uk-flex-center uk-margin-large-top"
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
        ) : adsPage?.content.length === 0 ? (
          <motion.div
            key="empty"
            variants={pageItemVariants}
            className="uk-text-center uk-text-muted uk-padding-large"
          >
            {t('ads.noAdsYet')}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial="hidden"
            animate="visible"
            variants={createPageContainerVariants(0.05)}
          >
            <Grid gap="medium" match className="uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l">
              <AnimatePresence mode="sync">
                {adsPage?.content.map((ad) => (
                  <SalesAdCard 
                    key={ad.id} 
                    ad={ad} 
                    onToggleStatus={handleToggleStatus} 
                  />
                ))}
              </AnimatePresence>
            </Grid>

            {adsPage && adsPage.page.totalPages > 1 && (
              <motion.div variants={pageItemVariants} className="uk-margin-large-top">
                <SmartPagination
                  currentPage={adsPage.page.number}
                  totalPages={adsPage.page.totalPages}
                  onPageChange={setPage}
                  className="uk-flex-center"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesAdsPage;
