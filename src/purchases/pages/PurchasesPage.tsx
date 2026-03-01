import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, stagger } from 'motion/react';
import { purchaseService } from '../services/purchaseService';
import type { PagePurchaseHistoryDto } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Alert } from '../../components/uikit/Alert/Alert';
import { SmartPagination } from '../../components/SmartPagination';
import { OrderItemCard } from '../../components/OrderItemCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: stagger(0.1)
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 }
  }
} as const;

const orderVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 40 }
  }
} as const;

const PurchasesPage: React.FC = () => {
  const { t } = useTranslation();
  const [purchasesPage, setPurchasesPage] = useState<PagePurchaseHistoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await purchaseService.getPurchases(page);
      setPurchasesPage(response);
    } catch (err: unknown) {
      setError((err as Error).message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="uk-flex uk-flex-between uk-flex-middle uk-margin-bottom">
        <Heading as="h2">{t('purchases.title')}</Heading>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && !purchasesPage ? (
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
            variants={itemVariants}
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
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  delayChildren: stagger(0.05)
                }
              }
            }}
          >
            <Grid gap="medium" className="uk-child-width-1-1 uk-child-width-1-2@m">
              <AnimatePresence mode="popLayout">
                {purchasesPage?.content.map((purchase) => (
                  <motion.div
                    key={purchase.id}
                    layout
                    variants={orderVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <OrderItemCard order={purchase} type="purchase" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Grid>
            {purchasesPage?.content.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="uk-text-center uk-text-muted uk-padding-large"
              >
                {t('purchases.noPurchases')}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {purchasesPage && purchasesPage.page.totalPages > 1 && (
        <motion.div variants={itemVariants} className="uk-margin-large-top">
          <SmartPagination 
            currentPage={purchasesPage.page.number} 
            totalPages={purchasesPage.page.totalPages} 
            onPageChange={fetchPurchases}
            className="uk-flex-center"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default PurchasesPage;
