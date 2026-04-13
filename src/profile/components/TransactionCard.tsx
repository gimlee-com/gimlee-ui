import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { expandCollapseProps } from '../../animations';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { Label } from '../../components/uikit/Label/Label';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Icon } from '../../components/uikit/Icon/Icon';
import { Divider } from '../../components/uikit/Divider/Divider';
import { formatPrice } from '../../utils/currencyUtils';
import type { PirateChainTransaction } from '../../types/api';

interface TransactionCardProps {
  transaction: PirateChainTransaction;
  currency: 'ARRR' | 'YEC';
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, currency }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfirmationVariant = (confirmations: number) => {
    if (confirmations >= 10) return 'success';
    if (confirmations > 0) return 'warning';
    return 'default';
  };

  return (
    <Card className="uk-margin-small-bottom uk-border-rounded uk-box-shadow-small uk-box-shadow-hover-medium transition-all">
      <CardBody className="uk-padding-small">
        <div 
          className="uk-cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="uk-flex uk-flex-between uk-flex-middle">
            <div className="uk-flex uk-flex-middle uk-min-width-0">
              <Icon 
                icon={isExpanded ? 'chevron-down' : 'chevron-right'} 
                ratio={0.8} 
                className="uk-margin-small-right"
              />
              <div className="uk-text-truncate">
                <span className="uk-text-meta">TXID: </span>
                <span className="uk-text-bold">{transaction.txid.substring(0, 12)}...</span>
              </div>
            </div>
            <div className="uk-text-primary uk-text-bold uk-margin-small-left">
              {formatPrice(transaction.amount, currency)}
            </div>
          </div>
          
          <div className="uk-margin-small-top uk-flex uk-flex-between uk-flex-middle">
            <Label variant={getConfirmationVariant(transaction.confirmations)}>
              {transaction.confirmations} {t('common.confirmations')}
            </Label>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              {...expandCollapseProps}
            >
              <Divider className="uk-margin-small" />
              <Grid gap="small" className="uk-child-width-1-1">
                <div>
                  <span className="uk-text-meta">TXID:</span>
                  <div className="uk-text-break uk-text-small">{transaction.txid}</div>
                </div>
                {transaction.memo && (
                  <div>
                    <span className="uk-text-meta">{t('common.memo')}:</span>
                    <div className="uk-text-break">{transaction.memo}</div>
                  </div>
                )}
                <div>
                  <span className="uk-text-meta">zAddress:</span>
                  <div className="uk-text-break uk-text-small">{transaction.zAddress}</div>
                </div>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
};
