import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { expandCollapseProps } from '../animations';
import { Heading } from './uikit/Heading/Heading';
import { Card, CardBody } from './uikit/Card/Card';
import { Label } from './uikit/Label/Label';
import { Grid } from './uikit/Grid/Grid';
import { Icon } from './uikit/Icon/Icon';
import { Progress } from './uikit/Progress/Progress';
import { Button } from './uikit/Button/Button';
import { useAppDispatch, useAppSelector } from '../store';
import { formatPrice } from '../utils/currencyUtils';
import { setActivePurchase } from '../store/purchaseSlice';
import { purchaseService } from '../purchases/services/purchaseService';
import type { PurchaseHistoryDto, SalesOrderDto, PurchaseStatus, PurchaseStatusResponseDto } from '../types/api';

interface OrderItemCardProps {
  order: PurchaseHistoryDto | SalesOrderDto;
  type: 'purchase' | 'sale';
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({ order, type }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activePurchase = useAppSelector(state => state.purchase.activePurchase);
  const isPurchase = type === 'purchase';
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusDetails, setStatusDetails] = useState<PurchaseStatusResponseDto | null>(null);

  const fetchStatus = async () => {
    if (!isPurchase || order.status !== 'AWAITING_PAYMENT') return;
    try {
      const details = await purchaseService.getPurchaseStatus(order.id);
      setStatusDetails(details);
    } catch (error) {
      console.error('Failed to fetch status', error);
    }
  };

  const handleExpand = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    if (nextExpanded && !statusDetails) {
      fetchStatus();
    }
  };
  const counterparty = isPurchase 
    ? (order as PurchaseHistoryDto).seller.username 
    : (order as SalesOrderDto).buyer.username;

  const getStatusVariant = (status: PurchaseStatus) => {
    switch (status) {
      case 'COMPLETE': return 'success';
      case 'AWAITING_PAYMENT': return 'warning';
      case 'CANCELLED':
      case 'FAILED_PAYMENT_TIMEOUT':
      case 'FAILED_PAYMENT_UNDERPAID': return 'danger';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusLabel = (status: PurchaseStatus) => {
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
    <Card className="uk-margin-small-bottom uk-border-rounded uk-box-shadow-small uk-box-shadow-hover-medium transition-all uk-height-1-1 uk-flex uk-flex-column">
      <CardBody className="uk-padding-small uk-flex-1">
        <div 
          className="uk-cursor-pointer" 
          onClick={handleExpand}
        >
          <div className="uk-flex uk-flex-between uk-flex-top uk-margin-small-bottom">
            <div className="uk-width-expand uk-min-width-0">
              <Grid gap="small" className="uk-flex-middle uk-child-width-1-1 uk-child-width-auto@s">
                <div>
                  <span className="uk-text-meta">#{order.id.substring(0, 8)}</span>
                </div>
                <div className="uk-min-width-0">
                  <Label 
                    variant={getStatusVariant(order.status)} 
                    className="uk-text-truncate uk-display-inline-block"
                    title={getStatusLabel(order.status)}
                  >
                    {getStatusLabel(order.status)}
                  </Label>
                </div>
              </Grid>
            </div>
            <div className="uk-text-bold uk-text-primary uk-margin-small-left uk-text-nowrap">
              {formatPrice(order.totalAmount, order.currency)}
            </div>
          </div>
          
          <h4 className="uk-margin-remove uk-text-bold uk-text-break">
            {order.items.map(item => item.title).join(', ')}
          </h4>
          
          <div className="uk-flex uk-flex-between uk-flex-middle uk-margin-small-top">
            <div className="uk-text-meta uk-flex uk-flex-wrap uk-flex-middle">
              <span className="uk-margin-small-right uk-text-nowrap">
                <Icon icon={isPurchase ? 'cart' : 'tag'} ratio={0.8} className="uk-margin-small-right" />
                <span className="uk-text-emphasis">{counterparty}</span>
              </span>
              <span className="uk-margin-small-right uk-text-muted uk-visible@s">•</span>
              <span className="uk-text-nowrap">
                <Icon icon="calendar" ratio={0.8} className="uk-margin-small-right" />
                {formatDate(order.createdAt)}
              </span>
            </div>
            <Icon 
              icon={isExpanded ? 'chevron-up' : 'chevron-down'} 
              ratio={1.1} 
              className="uk-text-muted uk-margin-small-left" 
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              {...expandCollapseProps}
              className="uk-overflow-hidden"
            >
              <hr className="uk-margin-small" />
              <div className="uk-padding-small uk-background-muted uk-border-rounded">
                <Heading as="h5" className="uk-margin-small-bottom">{t('purchases.items', 'Items')}</Heading>
                <ul className="uk-list uk-list-divider uk-margin-remove">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      <Grid gap="small" className="uk-flex-middle">
                        <div className="uk-width-expand">
                          <div className="uk-text-bold">{item.title}</div>
                          <div className="uk-text-meta">
                            {item.quantity} x {formatPrice(item.unitPrice, order.currency)}
                          </div>
                        </div>
                        <div className="uk-width-auto uk-text-right">
                          <div className="uk-text-emphasis">
                            {formatPrice(item.quantity * item.unitPrice, order.currency)}
                          </div>
                        </div>
                      </Grid>
                    </li>
                  ))}
                </ul>
                
                <div className="uk-margin-small-top uk-text-meta">
                   {t('common.status')}: <span className="uk-text-emphasis">{order.paymentStatus || order.status}</span>
                </div>

                {isPurchase && statusDetails && (
                  <div className="uk-margin-small-top">
                    <p className="uk-text-small uk-margin-remove-bottom">
                      {t('purchases.paymentProgress', { 
                        paid: formatPrice(statusDetails.paidAmount || 0, order.currency), 
                        total: formatPrice(statusDetails.totalAmount || order.totalAmount, order.currency)
                      })}
                    </p>
                    <Progress 
                      value={statusDetails.paidAmount || 0} 
                      max={statusDetails.totalAmount || order.totalAmount}
                      className="uk-margin-remove-top"
                    />
                  </div>
                )}
                
                {order.status === 'AWAITING_PAYMENT' && isPurchase && (
                   <div className="uk-margin-small-top">
                      <p className="uk-text-small uk-text-warning">
                        <Icon icon="info" ratio={0.8} className="uk-margin-small-right" />
                        {t('purchases.paymentInstructions')}
                      </p>
                      {activePurchase?.purchaseId === order.id ? (
                        <Button 
                          size="small" 
                          variant="primary" 
                          onClick={() => dispatch(setActivePurchase(activePurchase))}
                        >
                          {t('purchases.viewPaymentInfo')}
                        </Button>
                      ) : (
                        <div className="uk-alert-danger uk-padding-small uk-border-rounded">
                          <p className="uk-text-small uk-margin-remove">
                            {t('purchases.pendingPurchaseExists')}
                          </p>
                        </div>
                      )}
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
};
