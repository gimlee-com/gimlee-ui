import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { salesService } from '../services/salesService';
import type { PageSalesOrderDto } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Alert } from '../../components/uikit/Alert/Alert';
import { SmartPagination } from '../../components/SmartPagination';
import { OrderItemCard } from '../../components/OrderItemCard';
import SalesSubNav from '../components/SalesSubNav';
import { createPageContainerVariants, pageItemVariants, scaleItemVariants } from '../../animations';

const SalesOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [ordersPage, setOrdersPage] = useState<PageSalesOrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await salesService.getSalesOrders(page);
      setOrdersPage(response);
    } catch (err: unknown) {
      setError((err as Error).message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        <SalesSubNav />
      </motion.div>

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
            <Grid gap="medium" className="uk-child-width-1-1 uk-child-width-1-2@m">
              <AnimatePresence mode="popLayout">
                {ordersPage?.content.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    variants={scaleItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <OrderItemCard order={order} type="sale" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Grid>
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
            onPageChange={fetchOrders}
            className="uk-flex-center"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default SalesOrdersPage;
