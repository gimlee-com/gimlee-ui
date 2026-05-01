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
import { useAppDispatch } from '../../store';
import { setActivePurchase } from '../../store/purchaseSlice';
import { purchaseService } from '../services/purchaseService';
import { conversationService } from '../../chat/services/conversationService';
import type { PurchaseDetailDto, PurchaseStatus, PurchaseResponseDto } from '../../types/api';
import styles from './PurchaseDetailPage.module.scss';

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

/**
 * Adapts PurchaseDetailDto to PurchaseResponseDto shape
 * so we can reuse the existing PurchaseModal.
 */
const toPurchaseResponseDto = (detail: PurchaseDetailDto): PurchaseResponseDto | null => {
  if (!detail.payment) return null;
  return {
    purchaseId: detail.id,
    status: detail.status as PurchaseStatus,
    currency: detail.currency,
    payment: {
      amount: detail.payment.amount,
      paidAmount: detail.payment.paidAmount,
      address: detail.payment.address,
      memo: detail.payment.memo,
      deadline: detail.payment.deadline,
      qrCodeUri: detail.payment.qrCodeUri,
    },
  };
};

const PurchaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  useNavbarMode('focused', '/purchases');

  const [purchase, setPurchase] = useState<PurchaseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (!purchase) return;
    navigator.clipboard.writeText(purchase.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    purchaseService.getPurchaseById(id)
      .then(setPurchase)
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

  const handleViewPayment = () => {
    if (!purchase) return;
    const adapted = toPurchaseResponseDto(purchase);
    if (adapted) {
      dispatch(setActivePurchase(adapted));
    }
  };

  const sellerAvatarUrl = purchase?.seller.avatarUrl
    ? `${API_URL}/api/media?p=${purchase.seller.avatarUrl}`
    : undefined;

  return (
    <>
      <NavbarPortal>
        {purchase ? (
          <div className={styles.navbarContent}>
            {purchase.items[0]?.thumbnailPath && (
              <img
                src={`${API_URL}/api/media?p=/thumbs-xs${purchase.items[0].thumbnailPath}`}
                alt=""
                className={styles.navbarThumb}
              />
            )}
            <div className={styles.navbarText}>
              <span className={styles.navbarTitle}>
                {purchase.items[0]?.title || t('purchases.detail.title', { id: purchase.id })}
              </span>
              <span className={styles.navbarOrderId}>
                {purchase.id} · {new Date(purchase.createdAt).toLocaleDateString()}
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
        ) : purchase ? (
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
                          {t('purchases.detail.title', { id: purchase.id })}
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
                      <span className="uk-text-meta">{new Date(purchase.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </div>
                    <div className={styles.headerRight}>
                      <Label variant={getStatusVariant(purchase.status)}>
                        {purchase.status}
                      </Label>
                      <div className={styles.totalAmount}>
                        {formatPrice(purchase.totalAmount, purchase.currency)}
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
                  <Heading as="h4" className="uk-margin-small-bottom">{t('purchases.detail.items')}</Heading>
                  {purchase.items.map((item, idx) => (
                    <OrderItemRow key={`${item.adId}-${idx}`} item={item} currency={purchase.currency} />
                  ))}
                </CardBody>
              </Card>
            </motion.div>

            {/* Seller info */}
            <motion.div variants={pageItemVariants}>
              <Card className="uk-margin-top">
                <CardBody>
                  <Heading as="h4" className="uk-margin-small-bottom">{t('purchases.detail.sellerInfo')}</Heading>
                  <div className={styles.counterparty}>
                    <div className={styles.avatarWrapper}>
                      {sellerAvatarUrl ? (
                        <img src={sellerAvatarUrl} alt={purchase.seller.username} className={styles.avatarImg} />
                      ) : (
                        <GeometricAvatar username={purchase.seller.username} size={40} />
                      )}
                    </div>
                    <Link
                      to={`/u/${purchase.seller.username}`}
                      state={{ from: location.pathname + location.search }}
                      className="uk-link-heading uk-text-bold"
                    >
                      {purchase.seller.username}
                    </Link>
                    <Button
                      size="small"
                      variant="default"
                      onClick={handleOpenChat}
                      disabled={chatLoading}
                      className="uk-margin-small-left"
                    >
                      <Icon icon="comments" ratio={0.85} className="uk-margin-small-right" />
                      {t('purchases.detail.chatWithSeller')}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Delivery address */}
            {purchase.deliveryAddress && (
              <motion.div variants={pageItemVariants}>
                <Card className="uk-margin-top">
                  <CardBody>
                    <Heading as="h4" className="uk-margin-small-bottom">{t('purchases.detail.deliveryAddress')}</Heading>
                    <div className="uk-text-small">
                      <div className="uk-text-bold">{purchase.deliveryAddress.fullName}</div>
                      <div>{purchase.deliveryAddress.street}</div>
                      <div>{purchase.deliveryAddress.postalCode} {purchase.deliveryAddress.city}</div>
                      <div>{purchase.deliveryAddress.country}</div>
                      <div className="uk-text-meta uk-margin-xsmall-top">{purchase.deliveryAddress.phoneNumber}</div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Payment info */}
            {purchase.payment && (
              <motion.div variants={pageItemVariants}>
                <Card className="uk-margin-top">
                  <CardBody>
                    <Heading as="h4" className="uk-margin-small-bottom">{t('purchases.detail.paymentInfo')}</Heading>
                    <div className={styles.paymentGrid}>
                      <div className="uk-text-meta">{t('purchases.detail.paymentAmount')}</div>
                      <div className="uk-text-bold">{formatPrice(purchase.payment.amount, purchase.currency)}</div>

                      <div className="uk-text-meta">{t('purchases.detail.paymentPaid')}</div>
                      <div className="uk-text-bold">{formatPrice(purchase.payment.paidAmount, purchase.currency)}</div>

                      <div className="uk-text-meta">{t('purchases.detail.paymentDeadline')}</div>
                      <div>{new Date(purchase.payment.deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                    {purchase.status === 'AWAITING_PAYMENT' && (
                      <div className="uk-margin-top">
                        <Button variant="primary" size="small" onClick={handleViewPayment}>
                          <Icon icon="credit-card" ratio={0.85} className="uk-margin-small-right" />
                          {t('purchases.detail.openPaymentModal')}
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Status history */}
            {purchase.statusHistory.length > 0 && (
              <motion.div variants={pageItemVariants}>
                <Card className="uk-margin-top uk-margin-bottom">
                  <CardBody>
                    <Heading as="h4" className="uk-margin-small-bottom">{t('purchases.detail.statusHistory')}</Heading>
                    <OrderStatusTimeline history={purchase.statusHistory} />
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

export default PurchaseDetailPage;
