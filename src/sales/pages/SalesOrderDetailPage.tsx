import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { createPageContainerVariants, pageItemVariants } from '../../animations';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import NavbarPortal from '../../components/Navbar/NavbarPortal';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Label } from '../../components/uikit/Label/Label';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Button } from '../../components/uikit/Button/Button';
import { Icon } from '../../components/uikit/Icon/Icon';
import { GeometricAvatar } from '../../components/GeometricAvatar/GeometricAvatar';
import { OrderItemRow } from '../../components/OrderItemRow/OrderItemRow';
import { OrderStatusTimeline } from '../../components/OrderStatusTimeline/OrderStatusTimeline';
import { formatPrice } from '../../utils/currencyUtils';
import { salesService } from '../services/salesService';
import { conversationService } from '../../chat/services/conversationService';
import type { SalesOrderDetailDto, PurchaseStatus } from '../../types/api';
import styles from './SalesOrderDetailPage.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status as PurchaseStatus) {
    case 'COMPLETE': return 'success';
    case 'AWAITING_PAYMENT':
    case 'CREATED': return 'warning';
    case 'CANCELLED':
    case 'FAILED_PAYMENT_TIMEOUT':
    case 'FAILED_PAYMENT_UNDERPAID': return 'danger';
    default: return 'default';
  }
};

const SalesOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  useNavbarMode('focused', '/sales/orders');

  const [order, setOrder] = useState<SalesOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    salesService.getSalesOrderById(id)
      .then(setOrder)
      .catch((err: unknown) => setError((err as Error).message || t('auth.errors.generic')))
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleOpenChat = async () => {
    if (!id) return;
    setChatLoading(true);
    try {
      const result = await conversationService.getOrderConversation(id);
      navigate(`/conversations/${result.conversation.id}`, {
        state: { from: location.pathname + location.search },
      });
    } catch (err) {
      console.error('Failed to load order conversation', err);
    } finally {
      setChatLoading(false);
    }
  };

  const buyerAvatarUrl = order?.buyer.avatarUrl
    ? `${API_URL}/api/media?p=${order.buyer.avatarUrl}`
    : undefined;

  return (
    <>
      <NavbarPortal>
        {order ? (
          <div className={styles.navbarContent}>
            {order.items[0]?.thumbnailPath && (
              <img
                src={`${API_URL}/api/media?p=/thumbs-xs${order.items[0].thumbnailPath}`}
                alt=""
                className={styles.navbarThumb}
              />
            )}
            <div className={styles.navbarText}>
              <span className={styles.navbarTitle}>
                {order.items[0]?.title || t('sales.orderDetail.title', { id: order.id })}
              </span>
              <span className={styles.navbarOrderId}>
                {order.id} · {new Date(order.createdAt).toLocaleDateString(i18n.language)}
              </span>
            </div>
          </div>
        ) : (
          <span className="uk-text-bold">{t('common.loading')}</span>
        )}
      </NavbarPortal>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="uk-flex uk-flex-center uk-margin-large-top">
            <Spinner ratio={2} />
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert variant="danger">{error}</Alert>
          </motion.div>
        ) : order ? (
          <motion.div
            key="content"
            variants={createPageContainerVariants()}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={pageItemVariants}>
              <Card className={styles.headerCard}>
                <CardBody className={styles.headerBody}>
                  <div className={styles.headerTop}>
                    <div>
                      <div className={styles.orderIdRow}>
                        <Heading as="h3" className="uk-margin-remove">
                          {t('sales.orderDetail.title', { id: order.id })}
                        </Heading>
                        <button
                          className={`${styles.copyButton} ${copied ? styles.copySuccess : ''}`}
                          onClick={handleCopyOrderId}
                          title={t('common.copyToClipboard')}
                          type="button"
                        >
                          <Icon icon={copied ? 'check' : 'copy'} ratio={0.8} />
                        </button>
                      </div>
                      <span className="uk-text-meta">{new Date(order.createdAt).toLocaleString(i18n.language, { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </div>
                    <div className={styles.headerRight}>
                      <Label variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Label>
                      <div className={styles.totalAmount}>
                        {formatPrice(order.totalAmount, order.currency)}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Items */}
            <motion.div variants={pageItemVariants}>
              <Card className="uk-margin-top">
                <CardBody>
                  <Heading as="h4" className="uk-margin-small-bottom">{t('sales.orderDetail.items')}</Heading>
                  {order.items.map((item, idx) => (
                    <OrderItemRow key={`${item.adId}-${idx}`} item={item} currency={order.currency} />
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            {/* Buyer info */}
            <motion.div variants={pageItemVariants}>
              <Card className="uk-margin-top">
                <CardBody>
                  <Heading as="h4" className="uk-margin-small-bottom">{t('sales.orderDetail.buyerInfo')}</Heading>
                  <div className={styles.counterparty}>
                    <div className={styles.avatarWrapper}>
                      {buyerAvatarUrl ? (
                        <img src={buyerAvatarUrl} alt={order.buyer.username} className={styles.avatarImg} />
                      ) : (
                        <GeometricAvatar username={order.buyer.username} size={40} />
                      )}
                    </div>
                    <Link
                      to={`/u/${order.buyer.username}`}
                      state={{ from: location.pathname + location.search }}
                      className="uk-link-heading uk-text-bold"
                    >
                      {order.buyer.username}
                    </Link>
                    <Button
                      size="small"
                      variant="default"
                      onClick={handleOpenChat}
                      disabled={chatLoading}
                      className="uk-margin-small-left"
                    >
                      <Icon icon="comments" ratio={0.85} className="uk-margin-small-right" />
                      {t('sales.orderDetail.chatWithBuyer')}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Delivery address */}
            {order.deliveryAddress && (
              <motion.div variants={pageItemVariants}>
                <Card className="uk-margin-top">
                  <CardBody>
                    <Heading as="h4" className="uk-margin-small-bottom">{t('sales.orderDetail.deliveryAddress')}</Heading>
                    <div className="uk-text-small">
                      <div className="uk-text-bold">{order.deliveryAddress.fullName}</div>
                      <div>{order.deliveryAddress.street}</div>
                      <div>{order.deliveryAddress.postalCode} {order.deliveryAddress.city}</div>
                      <div>{order.deliveryAddress.country}</div>
                      <div className="uk-text-meta uk-margin-xsmall-top">{order.deliveryAddress.phoneNumber}</div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Payment info */}
            {order.paymentStatus && (
              <motion.div variants={pageItemVariants}>
                <Card className="uk-margin-top">
                  <CardBody>
                    <Heading as="h4" className="uk-margin-small-bottom">{t('sales.orderDetail.paymentInfo')}</Heading>
                    <div className="uk-text-small">
                      <span className="uk-text-meta">{t('common.status')}: </span>
                      <span className="uk-text-emphasis">{order.paymentStatus}</span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Status history */}
            {order.statusHistory.length > 0 && (
              <motion.div variants={pageItemVariants}>
                <Card className="uk-margin-top">
                  <CardBody>
                    <Heading as="h4" className="uk-margin-small-bottom">{t('sales.orderDetail.statusHistory')}</Heading>
                    <OrderStatusTimeline history={order.statusHistory} />
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default SalesOrderDetailPage;
