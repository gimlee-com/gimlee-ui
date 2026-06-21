import React, { useEffect, useState } from 'react';
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
import { Input } from '../../components/Form/Form';
import { Icon } from '../../components/uikit/Icon/Icon';
import { SalesAdCard } from '../components/SalesAdCard';
import { SmartPagination } from '../../components/SmartPagination';
import { ActiveFilterBadges, type FilterBadge } from '../../components/ActiveFilterBadges';
import { SellerDashboardHeader } from '../components/SellerDashboardHeader/SellerDashboardHeader';
import SalesSubNav from '../components/SalesSubNav';
import { useListParams, type ListParamDef, type ListParams } from '../../hooks/useListParams';
import { createPageContainerVariants, pageItemVariants } from '../../animations';

const paramDefs: ListParamDef[] = [
  { key: 'p', type: 'number', defaultValue: 0 },
  { key: 't', type: 'string' },
];

interface AdsListParams extends ListParams {
  p?: number;
  t?: string;
}

const SalesAdsPage: React.FC = () => {
  const { t } = useTranslation();
  const { params, setPage, setParam, clearParam } = useListParams<AdsListParams>(paramDefs);
  const [adsPage, setAdsPage] = useState<PageSalesAdDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const [text, setText] = useState((params.t as string) || '');
  const [prevParams, setPrevParams] = useState(params);
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey);

  if (params !== prevParams || refreshKey !== prevRefreshKey) {
    setPrevParams(params);
    setPrevRefreshKey(refreshKey);
    if (params.t !== prevParams.t) {
      setText((params.t as string) || '');
    }
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    const searchText = (params.t as string) || undefined;
    salesService.getMyAds(
      {
        by: 'CREATED_DATE',
        dir: 'DESC',
        p: (params.p as number) || 0,
        ...(searchText ? { t: searchText } : {}),
      },
      { signal: controller.signal },
    )
      .then(setAdsPage)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError((err as Error).message || t('auth.errors.generic'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [params, t, refreshKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    setParam('t', trimmed || undefined);
  };

  const handleRemoveBadge = (key: string) => {
    if (key === 't') {
      setText('');
      clearParam('t');
    }
  };

  const badges: FilterBadge[] = [];
  if (params.t) {
    badges.push({ key: 't', label: `${t('common.search')}: ${params.t}` });
  }

  const handleToggleStatus = async (ad: SalesAdDto) => {
    try {
      if (ad.status === 'ACTIVE') {
        await salesService.deactivateAd(ad.id);
      } else {
        await salesService.activateAd(ad.id);
      }
      setRefreshKey(k => k + 1);
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

      <motion.div variants={pageItemVariants}>
        <form onSubmit={handleSearchSubmit} className="uk-margin-bottom">
          <div className="uk-flex uk-flex-middle">
            <div className="uk-inline uk-flex-1">
              <span className="uk-form-icon" uk-icon="icon: search"></span>
              <Input
                className="uk-width-1-1"
                type="text"
                placeholder={t('ads.searchPlaceholder')}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="uk-margin-small-left"
            >
              <Icon icon="search" className="uk-hidden@m" />
              <span className="uk-visible@m">{t('common.search')}</span>
            </Button>
          </div>
        </form>
        <ActiveFilterBadges badges={badges} onRemove={handleRemoveBadge} />
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
            {params.t ? t('ads.noAdsFound') : t('ads.noAdsYet')}
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
