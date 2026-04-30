import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { salesService } from '../services/salesService';
import type { SalesOrdersRequestDto } from '../services/salesService';
import type { PageSalesOrderDto, PurchaseStatus } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Icon } from '../../components/uikit/Icon/Icon';
import { SmartPagination } from '../../components/SmartPagination';
import { OrderCard } from '../../components/OrderCard/OrderCard';
import { ActiveFilterBadges, type FilterBadge } from '../../components/ActiveFilterBadges';
import { FilterDrawer } from '../../components/FilterDrawer/FilterDrawer';
import { SellerDashboardHeader } from '../components/SellerDashboardHeader/SellerDashboardHeader';
import SalesSubNav from '../components/SalesSubNav';
import { useListParams, type ListParamDef } from '../../hooks/useListParams';
import { createPageContainerVariants, pageItemVariants, scaleItemVariants } from '../../animations';

const STATUS_OPTIONS: PurchaseStatus[] = [
  'AWAITING_PAYMENT', 'COMPLETE', 'CANCELLED', 'FAILED_PAYMENT_TIMEOUT', 'FAILED_PAYMENT_UNDERPAID',
];

const SORT_OPTIONS = [
  { by: 'DATE' as const, dir: 'DESC' as const, labelKey: 'common.dateNewest' },
  { by: 'DATE' as const, dir: 'ASC' as const, labelKey: 'common.dateOldest' },
  { by: 'AMOUNT' as const, dir: 'DESC' as const, labelKey: 'common.amountHighest' },
  { by: 'AMOUNT' as const, dir: 'ASC' as const, labelKey: 'common.amountLowest' },
];

const DATE_PRESETS = [
  { key: 'today', labelKey: 'common.today', getDates: () => { const d = new Date(); d.setHours(0,0,0,0); return { from: d.toISOString() }; } },
  { key: '7d', labelKey: 'common.last7Days', getDates: () => { const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return { from: d.toISOString() }; } },
  { key: '30d', labelKey: 'common.last30Days', getDates: () => { const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0,0,0,0); return { from: d.toISOString() }; } },
];

const paramDefs: ListParamDef[] = [
  { key: 'p', type: 'number', defaultValue: 0 },
  { key: 'status', type: 'string[]' },
  { key: 'q', type: 'string' },
  { key: 'adId', type: 'string' },
  { key: 'from', type: 'string' },
  { key: 'to', type: 'string' },
  { key: 'by', type: 'string', defaultValue: 'DATE' },
  { key: 'dir', type: 'string', defaultValue: 'DESC' },
];

interface OrderListParams {
  p?: number;
  status?: string[];
  q?: string;
  adId?: string;
  from?: string;
  to?: string;
  by?: string;
  dir?: string;
}

const SalesOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { params, setParam, setMultipleParams, clearParam, setPage } = useListParams<OrderListParams>(paramDefs);
  const [ordersPage, setOrdersPage] = useState<PageSalesOrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(params.q || '');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const req: SalesOrdersRequestDto = {
        p: (params.p as number) || 0,
        status: params.status as PurchaseStatus[] | undefined,
        q: params.q as string | undefined,
        adId: params.adId as string | undefined,
        from: params.from as string | undefined,
        to: params.to as string | undefined,
        by: (params.by as 'DATE' | 'AMOUNT') || 'DATE',
        dir: (params.dir as 'ASC' | 'DESC') || 'DESC',
      };
      const response = await salesService.getSalesOrders(req);
      setOrdersPage(response);
    } catch (err: unknown) {
      setError((err as Error).message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [params, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setSearchInput(params.q as string || '');
  }, [params.q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('q', searchInput.trim() || undefined);
  };

  const badges = useMemo(() => {
    const result: FilterBadge[] = [];
    if (params.q) result.push({ key: 'q', label: `"${params.q}"` });
    if (params.adId) result.push({ key: 'adId', label: t('sales.filterByAd'), variant: 'primary' });
    if (params.status && (params.status as string[]).length > 0) {
      (params.status as string[]).forEach(s => result.push({ key: `status:${s}`, label: s, variant: 'warning' }));
    }
    if (params.from) result.push({ key: 'from', label: t('common.dateRange'), variant: 'primary' });
    return result;
  }, [params, t]);

  const handleRemoveBadge = (key: string) => {
    if (key.startsWith('status:')) {
      const statusToRemove = key.replace('status:', '');
      const current = (params.status as string[]) || [];
      const updated = current.filter(s => s !== statusToRemove);
      setParam('status', updated.length > 0 ? updated : undefined);
    } else if (key === 'from') {
      clearParam('from');
      clearParam('to');
    } else {
      clearParam(key);
    }
  };

  const getStatusLabel = (status: PurchaseStatus): string => {
    switch (status) {
      case 'AWAITING_PAYMENT': return t('purchases.statusAwaiting');
      case 'COMPLETE': return t('purchases.statusComplete');
      case 'CANCELLED': return t('purchases.statusCancelled');
      case 'FAILED_PAYMENT_TIMEOUT': return t('purchases.statusFailedTimeout');
      case 'FAILED_PAYMENT_UNDERPAID': return t('purchases.statusFailedUnderpaid');
      default: return status;
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
      </motion.div>

      <motion.div variants={pageItemVariants}>
        <SellerDashboardHeader />
      </motion.div>

      <motion.div variants={pageItemVariants}>
        <SalesSubNav />
      </motion.div>

      {/* Filters */}
      <motion.div variants={pageItemVariants}>
        <FilterDrawer>
          <div className="uk-flex uk-flex-wrap" style={{ gap: '10px' }}>
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="uk-width-medium@s">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon"><Icon icon="search" ratio={0.85} /></span>
                <input
                  className="uk-input uk-form-small uk-form-width-medium"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t('sales.searchOrders')}
                />
              </div>
            </form>

            {/* Status filter */}
            <div className="uk-flex uk-flex-wrap" style={{ gap: '4px' }}>
              {STATUS_OPTIONS.map(s => {
                const isActive = ((params.status as string[]) || []).includes(s);
                return (
                  <button
                    key={s}
                    className={`uk-button uk-button-small ${isActive ? 'uk-button-primary' : 'uk-button-default'}`}
                    style={{ borderRadius: '16px', fontSize: '0.8rem' }}
                    onClick={() => {
                      const current = ((params.status as string[]) || []);
                      if (isActive) {
                        setParam('status', current.filter(x => x !== s));
                      } else {
                        setParam('status', [...current, s]);
                      }
                    }}
                  >
                    {getStatusLabel(s)}
                  </button>
                );
              })}
            </div>

            {/* Date presets */}
            <div className="uk-flex uk-flex-wrap" style={{ gap: '4px' }}>
              {DATE_PRESETS.map(dp => (
                <button
                  key={dp.key}
                  className={`uk-button uk-button-small ${params.from === dp.getDates().from ? 'uk-button-primary' : 'uk-button-default'}`}
                  style={{ borderRadius: '16px', fontSize: '0.8rem' }}
                  onClick={() => {
                    const dates = dp.getDates();
                    setParam('from', dates.from);
                  }}
                >
                  {t(dp.labelKey)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              className="uk-select uk-form-small uk-form-width-medium"
              value={`${params.by || 'DATE'}_${params.dir || 'DESC'}`}
              onChange={e => {
                const [by, dir] = e.target.value.split('_');
                setMultipleParams({ by, dir });
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={`${opt.by}_${opt.dir}`} value={`${opt.by}_${opt.dir}`}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </FilterDrawer>
      </motion.div>

      {/* Active filter badges */}
      {badges.length > 0 && (
        <motion.div variants={pageItemVariants}>
          <ActiveFilterBadges badges={badges} onRemove={handleRemoveBadge} />
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading && !ordersPage ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="uk-flex uk-flex-center uk-margin-large-top"
          >
            <Spinner ratio={2} />
          </motion.div>
        ) : error ? (
          <motion.div key="error" variants={pageItemVariants}>
            <Alert variant="danger">{error}</Alert>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial="hidden"
            animate="visible"
            variants={createPageContainerVariants(0.05)}
          >
            <div className="uk-flex uk-flex-column" style={{ gap: '12px' }}>
              <AnimatePresence mode="popLayout">
                {ordersPage?.content.map((order) => (
                  <OrderCard key={order.id} order={order} type="sale" />
                ))}
              </AnimatePresence>
            </div>
            {ordersPage?.content.length === 0 && (
              <motion.div
                variants={pageItemVariants}
                className="uk-text-center uk-text-muted uk-padding-large"
              >
                {t('sales.noOrders')}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {ordersPage && ordersPage.page.totalPages > 1 && (
        <motion.div variants={pageItemVariants} className="uk-margin-large-top">
          <SmartPagination 
            currentPage={ordersPage.page.number} 
            totalPages={ordersPage.page.totalPages} 
            onPageChange={setPage}
            className="uk-flex-center"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default SalesOrdersPage;
