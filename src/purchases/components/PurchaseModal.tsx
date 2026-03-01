import { useEffect, useState, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import type { Transition } from 'motion/react';
import UIkit from 'uikit';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Modal, 
  ModalDialog, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalTitle 
} from '../../components/uikit/Modal/Modal';
import { Button } from '../../components/uikit/Button/Button';
import { Icon } from '../../components/uikit/Icon/Icon';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Progress } from '../../components/uikit/Progress/Progress';
import { useAppDispatch } from '../../store';
import { updateActivePurchaseStatus, setModalOpen, clearActivePurchase } from '../../store/purchaseSlice';
import { formatPrice } from '../../utils/currencyUtils';
import { Image } from '../../components/Image/Image';
import { purchaseService } from '../services/purchaseService';
import { currencyService } from '../../payments/services/currencyService';
import { useAuth } from '../../context/AuthContext';
import type { PurchaseResponseDto, PurchaseStatus, ConversionResultDto } from '../../types/api';
import { useUIKit } from '../../hooks/useUIkit';
import { useMergeRefs } from '../../hooks/useMergeRefs';
import styles from './PurchaseModal.module.scss';

interface PurchaseModalProps {
  purchase: PurchaseResponseDto;
  onClose?: () => void;
  onStatusChange?: (status: PurchaseStatus) => void;
}

export const PurchaseModal = forwardRef<HTMLDivElement, PurchaseModalProps>(
  ({ purchase, onClose, onStatusChange }, ref) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { preferredCurrency } = useAuth();
    const [status, setStatus] = useState<PurchaseStatus>(purchase.status);
    const [paidAmount, setPaidAmount] = useState<number>(purchase.payment.paidAmount);
    const [isCancelling, setIsCancelling] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [conversion, setConversion] = useState<ConversionResultDto | null>(null);
    
    const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
      escClose: false,
      bgClose: false,
      container: false
    });

    const mergedRef = useMergeRefs(modalRef, ref);

    useEffect(() => {
      if (modalInstance) {
        modalInstance.show();
      }
    }, [modalInstance]);

    useEffect(() => {
      const element = modalRef.current;
      if (!element) return;

      const handleHidden = () => {
        if (onClose) {
          onClose();
        } else {
          dispatch(setModalOpen(false));
          if (status !== 'AWAITING_PAYMENT') {
            dispatch(clearActivePurchase());
          }
        }
      };

      UIkit.util.on(element, 'hidden', handleHidden);
    }, [onClose, dispatch, status, modalRef]);

    useEffect(() => {
      if (status === 'AWAITING_PAYMENT') {
        const interval = setInterval(async () => {
          try {
            const response = await purchaseService.getPurchaseStatus(purchase.purchaseId);
            if (response.status !== status) {
              setStatus(response.status);
              if (onStatusChange) {
                onStatusChange(response.status);
              } else {
                dispatch(updateActivePurchaseStatus(response.status));
              }
            }
            if (response.paidAmount !== undefined) {
              setPaidAmount(response.paidAmount);
            }
          } catch (error) {
            console.error('Failed to fetch purchase status', error);
          }
        }, 5000);

        return () => clearInterval(interval);
      }
    }, [purchase.purchaseId, status, onStatusChange, dispatch]);

    useEffect(() => {
      if (status === 'AWAITING_PAYMENT' && purchase.payment.deadline) {
        const calculateTimeLeft = () => {
          const deadline = new Date(purchase.payment.deadline).getTime();
          const now = new Date().getTime();
          const diff = Math.max(0, Math.floor((deadline - now) / 1000));
          setSecondsLeft(diff);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
      } else {
        setSecondsLeft(null);
      }
    }, [status, purchase.payment.deadline]);

    useEffect(() => {
      const fetchConversion = () => {
        if (preferredCurrency && preferredCurrency !== purchase.currency) {
          currencyService.convertCurrency(purchase.payment.amount, purchase.currency, preferredCurrency)
            .then(setConversion)
            .catch(err => console.error('Failed to convert currency', err));
        } else {
          setConversion(null);
        }
      };

      fetchConversion();

      if (status === 'AWAITING_PAYMENT' && preferredCurrency && preferredCurrency !== purchase.currency) {
        const interval = setInterval(fetchConversion, 60000);
        return () => clearInterval(interval);
      }
    }, [preferredCurrency, purchase.currency, purchase.payment.amount, status]);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColorClass = (seconds: number) => {
      if (seconds > 1800) return 'uk-text-primary';
      if (seconds > 600) return 'uk-text-warning';
      return 'uk-text-danger';
    };

    const handleCancel = async () => {
      const confirmMessage = paidAmount > 0 
        ? t('purchases.partialPaymentWarning', { 
            paid: formatPrice(paidAmount, purchase.currency)
          })
        : t('purchases.confirmCancel');

      UIkit.modal.confirm(confirmMessage, { 
        stack: true,
        i18n: {
          ok: t('common.ok'),
          cancel: t('common.cancel')
        }
      }).then(async () => {
        setIsCancelling(true);
        try {
          await purchaseService.cancelPurchase(purchase.purchaseId);
          setStatus('CANCELLED');
          if (onStatusChange) {
            onStatusChange('CANCELLED');
          } else {
            dispatch(updateActivePurchaseStatus('CANCELLED'));
          }
        } catch (error: any) {
          console.error('Failed to cancel purchase', error);
          UIkit.modal.alert(error.message || t('auth.errors.generic'), { 
            stack: true,
            i18n: {
              ok: t('common.ok'),
              cancel: t('common.cancel')
            }
          });
        } finally {
          setIsCancelling(false);
        }
      }, () => {
        // user clicked cancel or closed the confirmation modal
      });
    };

    const handleClose = () => {
      if (modalInstance) {
        modalInstance.hide();
      } else {
        if (onClose) {
          onClose();
        } else {
          dispatch(setModalOpen(false));
          if (status !== 'AWAITING_PAYMENT') {
            dispatch(clearActivePurchase());
          }
        }
      }
    };

    const renderStatus = () => {
      switch (status) {
        case 'AWAITING_PAYMENT':
          return (
            <div className="uk-text-center">
              <div className="uk-inline uk-margin-small-bottom">
                <Spinner 
                  ratio={2} 
                  className={secondsLeft !== null ? getTimerColorClass(secondsLeft) : 'uk-text-primary'} 
                />
                {secondsLeft !== null && (
                  <span className={`uk-position-center uk-text-bold ${getTimerColorClass(secondsLeft)} ${styles.countdownInSpinner}`}>
                    {formatTime(secondsLeft)}
                  </span>
                )}
              </div>
              
              <p className={`uk-text-bold uk-margin-remove-top uk-margin-small-bottom ${secondsLeft !== null ? getTimerColorClass(secondsLeft) : 'uk-text-primary'}`}>
                {t('purchases.statusAwaiting')}
              </p>
              
              <div className="uk-margin-small-top">
                <p className="uk-text-small uk-margin-remove-bottom">
                  {t('purchases.paymentProgress', { 
                    paid: formatPrice(paidAmount, purchase.currency), 
                    total: formatPrice(purchase.payment.amount, purchase.currency)
                  })}
                </p>
                <Progress 
                  value={paidAmount} 
                  max={purchase.payment.amount}
                  className="uk-margin-remove-top"
                />
              </div>
            </div>
          );
        case 'COMPLETE':
          return (
            <div className="uk-text-center">
              <Icon icon="check" ratio={3} className="uk-text-success uk-margin-bottom" />
              <p className="uk-text-success uk-text-bold">{t('purchases.statusComplete')}</p>
            </div>
          );
        case 'FAILED_PAYMENT_TIMEOUT':
          return (
            <div className="uk-text-center">
              <Icon icon="history" ratio={3} className="uk-text-danger uk-margin-bottom" />
              <p className="uk-text-danger uk-text-bold">{t('purchases.statusFailedTimeout')}</p>
            </div>
          );
        case 'FAILED_PAYMENT_UNDERPAID':
          return (
            <div className="uk-text-center">
              <Icon icon="warning" ratio={3} className="uk-text-danger uk-margin-bottom" />
              <p className="uk-text-danger uk-text-bold">{t('purchases.statusFailedUnderpaid')}</p>
            </div>
          );
        case 'CANCELLED':
          return (
            <div className="uk-text-center">
              <Icon icon="close" ratio={3} className="uk-text-muted uk-margin-bottom" />
              <p className="uk-text-muted uk-text-bold">{t('purchases.statusCancelled')}</p>
            </div>
          );
        default:
          return null;
      }
    };

    const springTransition: Transition = { type: 'spring', stiffness: 400, damping: 40 };

    return (
      <Modal ref={mergedRef} container={false} escClose={false} bgClose={false}>
        <ModalDialog>
          <ModalHeader>
            <ModalTitle>{t('purchases.paymentTitle')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="uk-grid-small uk-flex-middle" uk-grid="">
              <div className="uk-width-auto">
                <Image 
                  src={purchase.currency === 'YEC' ? '/currencies/yec-primary.svg' : '/currencies/pirate-black.svg'}
                  alt={purchase.currency} 
                  width="40" 
                  height="40" 
                />
              </div>
              <div className="uk-width-expand">
                <p className="uk-margin-remove uk-text-large uk-text-bold">
                  {formatPrice(purchase.payment.amount, purchase.currency)}
                </p>
                {conversion && (
                  <p className="uk-margin-remove uk-text-muted uk-text-small">
                    ≈ {formatPrice(conversion.targetAmount, conversion.to)}
                    {conversion.isVolatile && (
                      <span 
                        className="uk-margin-small-left uk-text-warning" 
                        uk-tooltip={t('purchases.volatilityWarning', { currency: conversion.to })}
                      >
                        <Icon icon="warning" ratio={0.8} />
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="uk-margin-medium-top uk-text-center">
              <div className="uk-inline uk-padding-small uk-border-rounded uk-box-shadow-large">
                <QRCodeSVG 
                  value={purchase.payment.qrCodeUri} 
                  size={200}
                  level="H"
                  marginSize={8}
                  imageSettings={{
                    src: purchase.currency === 'YEC' ? "/currencies/yec-qr-logo.svg" : "/currencies/pirate-qr-logo.svg",
                    height: 45,
                    width: 45,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            <div className="uk-margin-medium-top">
              <p className="uk-margin-small-bottom uk-text-muted uk-text-small">{t('purchases.toAddress')}:</p>
              <div className="uk-padding-small uk-background-muted uk-border-rounded uk-text-break uk-text-emphasis uk-text-small">
                {purchase.payment.address}
              </div>
            </div>

            <div className="uk-margin">
              <p className="uk-margin-small-bottom uk-text-muted uk-text-small">{t('purchases.memo')}:</p>
              <div className="uk-padding-small uk-background-muted uk-border-rounded uk-text-emphasis">
                {purchase.payment.memo}
              </div>
            </div>

            <hr />

            <div className={`uk-height-small uk-flex uk-flex-column uk-flex-center uk-flex-middle uk-margin-medium-top ${styles.statusContainer}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springTransition}
                  className="uk-width-1-1"
                >
                  {renderStatus()}
                </motion.div>
              </AnimatePresence>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="uk-grid-small uk-child-width-1-1 uk-child-width-auto@s uk-flex-right" uk-grid="">
              {status === 'AWAITING_PAYMENT' && (
                <div>
                  <Button 
                    variant="default" 
                    className="uk-width-1-1" 
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? <Spinner ratio={0.6} /> : t('purchases.cancelPurchase')}
                  </Button>
                </div>
              )}
              <div>
                <Button variant="primary" className="uk-width-1-1" onClick={handleClose}>
                  {t('purchases.close')}
                </Button>
              </div>
            </div>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    );
  }
);
