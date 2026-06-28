import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader } from '../../../components/uikit/Card/Card';
import { Heading } from '../../../components/uikit/Heading/Heading';
import { Label } from '../../../components/uikit/Label/Label';
import { formatPrice } from '../../../utils/currencyUtils';
import { TransactionCard } from '../../../components/TransactionCard/TransactionCard';
import type { CryptoTransactionDto } from '../../../types/api';

interface OrderTransactionsSectionProps {
  transactions: CryptoTransactionDto[];
  totalAmount: number;
  currency: string;
}

export const OrderTransactionsSection: React.FC<OrderTransactionsSectionProps> = ({
  transactions,
  totalAmount,
  currency,
}) => {
  const { t } = useTranslation();

  const totalPaid = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const diff = totalPaid - totalAmount;
  
  // Use a small epsilon for float comparison
  const EPSILON = 0.00000001;
  const isFullyPaid = Math.abs(diff) < EPSILON;
  const isOverpaid = diff >= EPSILON;
  const isUnderpaid = diff <= -EPSILON && totalPaid > 0;

  return (
    <Card className="uk-margin-medium-top uk-border-rounded uk-box-shadow-small">
      <CardHeader className="uk-padding-small">
        <div className="uk-flex uk-flex-between uk-flex-middle">
          <Heading as="h4" className="uk-margin-remove">
            {t('common.transactions.title')}
          </Heading>
          {totalPaid > 0 && (
            <div className="uk-flex uk-flex-middle">
              <span className="uk-text-meta uk-margin-small-right">
                {t('common.transactions.totalPaid')}:
              </span>
              <span className="uk-text-bold uk-margin-small-right">
                {formatPrice(totalPaid, currency)}
              </span>
              {isFullyPaid && (
                <Label variant="success">{t('common.transactions.fullyPaid')}</Label>
              )}
              {isOverpaid && (
                <Label variant="warning">{t('common.transactions.overpaid')} (+{formatPrice(diff, currency)})</Label>
              )}
              {isUnderpaid && (
                <Label variant="danger">{t('common.transactions.underpaid')} ({formatPrice(diff, currency)})</Label>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody className="uk-padding-small">
        {transactions.length === 0 ? (
          <div className="uk-text-center uk-text-muted uk-padding-small">
            {t('common.transactions.noTransactions')}
          </div>
        ) : (
          <div className="uk-grid-small uk-child-width-1-1" data-uk-grid>
            {transactions.map((tx) => (
              <div key={tx.txid}>
                <TransactionCard transaction={tx} />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
