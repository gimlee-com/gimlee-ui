import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { scaleItemVariants } from '../../animations';
import { Card, CardBody } from '../uikit/Card/Card';
import { Label } from '../uikit/Label/Label';
import { Icon } from '../uikit/Icon/Icon';
import { Button } from '../uikit/Button/Button';
import { Image } from '../Image/Image';
import { GeometricAvatar } from '../GeometricAvatar/GeometricAvatar';
import { formatPrice } from '../../utils/currencyUtils';
import { conversationService } from '../../chat/services/conversationService';
import type { PurchaseHistoryDto, SalesOrderDto, PurchaseStatus } from '../../types/api';
import styles from './OrderCard.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

interface OrderCardProps {
  order: PurchaseHistoryDto | SalesOrderDto;
  type: 'purchase' | 'sale';
}

const getStatusVariant = (status: PurchaseStatus): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status) {
    case 'COMPLETE': return 'success';
    case 'AWAITING_PAYMENT':
    case 'CREATED': return 'warning';
    case 'CANCELLED':
    case 'FAILED_PAYMENT_TIMEOUT':
    case 'FAILED_PAYMENT_UNDERPAID': return 'danger';
    default: return 'default';
  }
};

const getStatusLabel = (status: PurchaseStatus, t: (key: string) => string): string => {
  switch (status) {
    case 'CREATED': return t('purchases.statusCreated');
    case 'AWAITING_PAYMENT': return t('purchases.statusAwaiting');
    case 'COMPLETE': return t('purchases.statusComplete');
    case 'CANCELLED': return t('purchases.statusCancelled');
    case 'FAILED_PAYMENT_TIMEOUT': return t('purchases.statusFailedTimeout');
    case 'FAILED_PAYMENT_UNDERPAID': return t('purchases.statusFailedUnderpaid');
    default: return status;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, type }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const isPurchase = type === 'purchase';

  const counterparty = isPurchase
    ? (order as PurchaseHistoryDto).seller
    : (order as SalesOrderDto).buyer;

  const detailPath = isPurchase
    ? `/purchases/${order.id}`
    : `/sales/orders/${order.id}`;

  const thumbnailUrl = order.primaryThumbnailPath
    ? `${API_URL}/api/media?p=/thumbs-sm${order.primaryThumbnailPath}`
    : undefined;

  const primaryTitle = order.items[0]?.title ?? '';
  const moreCount = order.itemCount - 1;

  const avatarUrl = counterparty.avatarUrl
    ? `${API_URL}/api/media?p=${counterparty.avatarUrl}`
    : undefined;

  const handleOpenChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoadingChat(true);
    try {
      const result = await conversationService.getOrderConversation(order.id);
      navigate(`/conversations/${result.conversation.id}`, {
        state: { from: location.pathname + location.search },
      });
    } catch (err) {
      console.error('Failed to load order conversation', err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, { dateStyle: 'medium' });

  return (
    <motion.div
      layout
      variants={scaleItemVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className={styles.orderCard}
        onClick={() => navigate(detailPath, { state: { from: location.pathname + location.search } })}
      >
          <CardBody className={styles.cardBody}>
            {/* Thumbnail */}
            <div className={styles.thumbnailCol}>
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={primaryTitle}
                  className={styles.thumbnail}
                  containerClassName={styles.thumbnail}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <Icon icon="bag" ratio={1.5} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.infoCol}>
              <div className={styles.topRow}>
                <span className="uk-text-meta">#{order.id.substring(0, 8)}</span>
                <span className="uk-text-meta">{formatDate(order.createdAt)}</span>
              </div>

              <div className={styles.titleRow}>
                <span className={styles.primaryTitle}>{primaryTitle}</span>
                {moreCount > 0 && (
                  <span className="uk-text-meta uk-margin-xsmall-left">
                    {t('common.nMore', { count: moreCount })}
                  </span>
                )}
              </div>

              <div className={styles.counterpartyRow}>
                <div className={styles.avatarWrapper}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={counterparty.username} className={styles.avatar} />
                  ) : (
                    <GeometricAvatar username={counterparty.username} size={22} />
                  )}
                </div>
                <Link
                  to={`/u/${counterparty.username}`}
                  state={{ from: location.pathname + location.search }}
                  className={styles.counterpartyLink}
                  onClick={e => e.stopPropagation()}
                >
                  {counterparty.username}
                </Link>
              </div>
            </div>

            {/* Status & Actions */}
            <div className={styles.statusCol}>
              <Label variant={getStatusVariant(order.status)}>
                {getStatusLabel(order.status, t)}
              </Label>
              <div className={styles.amount}>
                {formatPrice(order.totalAmount, order.currency)}
              </div>
              <div className={styles.actions}>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleOpenChat}
                  disabled={isLoadingChat}
                  title={isPurchase ? t('chat.chatWithSeller') : t('chat.chatWithBuyer')}
                >
                  {isLoadingChat
                    ? <span uk-spinner="ratio: 0.5"></span>
                    : <Icon icon="comments" ratio={0.85} />
                  }
                </Button>
              </div>
            </div>
          </CardBody>
      </Card>
    </motion.div>
  );
};
