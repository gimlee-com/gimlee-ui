import { useEffect, useState, useCallback, forwardRef } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  updateActivePurchaseStatus, 
  setModalOpen, 
  clearActivePurchase,
  setActivePurchase,
  setSelectedAddress,
} from '../../store/purchaseSlice';
import { formatPrice } from '../../utils/currencyUtils';
import { Image } from '../../components/Image/Image';
import { purchaseService } from '../services/purchaseService';
import { currencyService } from '../../payments/services/currencyService';
import { userService } from '../../profile/services/userService';
import { useAuth } from '../../context/AuthContext';
import { useCountries } from '../../hooks/useCountries';
import { getCountryFlag } from '../../utils/countryUtils';
import { AddressForm } from '../../profile/components/AddressForm/AddressForm';
import type { 
  PurchaseStatus, 
  ConversionResultDto, 
  DeliveryAddressDto, 
  StatusResponseDto,
  AddDeliveryAddressRequestDto,
} from '../../types/api';
import { useUIKit } from '../../hooks/useUIkit';
import { useMergeRefs } from '../../hooks/useMergeRefs';
import styles from './PurchaseModal.module.scss';

type AddressLoadState = 'loading' | 'error' | 'empty' | 'list';

export const PurchaseModal = forwardRef<HTMLDivElement>(
  (_props, ref) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { preferredCurrency, countryOfResidence } = useAuth();
    const { activePurchase, purchaseIntent, selectedAddress } = useAppSelector(state => state.purchase);
    const { getCountryName } = useCountries();

    // Derive step from Redux state
    const step: 'address' | 'payment' = activePurchase ? 'payment' : 'address';
    const purchase = activePurchase;

    // Address selection state
    const [addresses, setAddresses] = useState<DeliveryAddressDto[]>([]);
    const [addressLoadState, setAddressLoadState] = useState<AddressLoadState>('loading');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    // Payment state (only relevant when step === 'payment')
    const [status, setStatus] = useState<PurchaseStatus>(purchase?.status ?? 'AWAITING_PAYMENT');
    const [paidAmount, setPaidAmount] = useState<number>(purchase?.payment?.paidAmount ?? 0);
    const [isCancelling, setIsCancelling] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [conversion, setConversion] = useState<ConversionResultDto | null>(null);
    
    const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
      escClose: false,
      bgClose: false,
      container: false
    });

    const mergedRef = useMergeRefs(modalRef, ref);

    // Reset payment state when purchase changes
    useEffect(() => {
      if (purchase) {
        setStatus(purchase.status);
        setPaidAmount(purchase.payment?.paidAmount ?? 0);
      }
    }, [purchase?.purchaseId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (modalInstance) {
        modalInstance.show();
      }
    }, [modalInstance]);

    useEffect(() => {
      const element = modalRef.current;
      if (!element) return;

      const handleHidden = () => {
        dispatch(setModalOpen(false));
        // If still on address step (no purchase created), clear the intent
        if (!activePurchase) {
          dispatch(clearActivePurchase());
        } else if (status !== 'AWAITING_PAYMENT') {
          dispatch(clearActivePurchase());
        }
      };

      UIkit.util.on(element, 'hidden', handleHidden);
    }, [dispatch, status, modalRef]);

    // Fetch delivery addresses for step 1
    const fetchAddresses = useCallback(async () => {
      setAddressLoadState('loading');
      try {
        const all = await userService.getDeliveryAddresses();
        const filtered = countryOfResidence
          ? all.filter(a => a.country.toUpperCase() === countryOfResidence.toUpperCase())
          : all;
        setAddresses(filtered);
        setAddressLoadState(filtered.length > 0 ? 'list' : 'empty');

        // Auto-select default or first address
        if (filtered.length > 0 && !selectedAddress) {
          const defaultAddr = filtered.find(a => a.isDefault) ?? filtered[0];
          dispatch(setSelectedAddress(defaultAddr));
        }
      } catch {
        setAddressLoadState('error');
      }
    }, [countryOfResidence, selectedAddress, dispatch]);

    useEffect(() => {
      if (step === 'address') {
        void fetchAddresses();
      }
    }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

    // Status polling (payment step only)
    useEffect(() => {
      if (step !== 'payment' || !purchase) return;
      if (status === 'AWAITING_PAYMENT') {
        const interval = setInterval(async () => {
          try {
            const response = await purchaseService.getPurchaseStatus(purchase.purchaseId);
            if (response.status !== status) {
              setStatus(response.status);
              dispatch(updateActivePurchaseStatus(response.status));
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
    }, [purchase?.purchaseId, status, dispatch, step]); // eslint-disable-line react-hooks/exhaustive-deps

    // Countdown timer (payment step only)
    useEffect(() => {
      if (step !== 'payment' || !purchase) return;
      if (status === 'AWAITING_PAYMENT' && purchase.payment?.deadline) {
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
    }, [status, purchase?.payment?.deadline, step]); // eslint-disable-line react-hooks/exhaustive-deps

    // Currency conversion (payment step only)
    useEffect(() => {
      if (step !== 'payment' || !purchase) return;

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
    }, [preferredCurrency, purchase?.currency, purchase?.payment?.amount, status, step]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handleConfirmAndPay = async () => {
      if (!purchaseIntent || !selectedAddress) return;
      setIsCreatingPurchase(true);
      setPurchaseError(null);
      try {
        const response = await purchaseService.createPurchase({
          ...purchaseIntent,
          deliveryAddressId: selectedAddress.id,
        });
        dispatch(setActivePurchase({
          ...response,
          currency: response.currency || purchaseIntent.currency,
        }));
      } catch (error: unknown) {
        const err = error as StatusResponseDto;
        if (err.status === 'PURCHASE_CURRENCY_FROZEN') {
          setPurchaseError(t('purchases.currencyFrozen', { currency: purchaseIntent.currency }));
        } else if (err.status === 'PURCHASE_PRICE_MISMATCH') {
          setPurchaseError(t('purchases.priceMismatch'));
        } else if (err.status === 'PURCHASE_DELIVERY_ADDRESS_COUNTRY_MISMATCH') {
          setPurchaseError(t('purchases.addressCountryMismatch'));
        } else if (err.status === 'PURCHASE_COUNTRY_OF_RESIDENCE_REQUIRED') {
          setPurchaseError(t('purchases.countryOfResidenceRequired'));
        } else {
          setPurchaseError(err.message || t('auth.errors.generic'));
        }
      } finally {
        setIsCreatingPurchase(false);
      }
    };

    const handleAddAddress = async (data: AddDeliveryAddressRequestDto) => {
      setIsAddingAddress(true);
      try {
        await userService.addDeliveryAddress(data);
        setShowAddForm(false);
        // Re-fetch addresses and auto-select the new one
        const all = await userService.getDeliveryAddresses();
        const filtered = countryOfResidence
          ? all.filter(a => a.country.toUpperCase() === countryOfResidence.toUpperCase())
          : all;
        setAddresses(filtered);
        setAddressLoadState(filtered.length > 0 ? 'list' : 'empty');
        // Select the most recently added (last in the list)
        if (filtered.length > 0) {
          dispatch(setSelectedAddress(filtered[filtered.length - 1]));
        }
      } catch (err: unknown) {
        const error = err as StatusResponseDto;
        UIkit.notification({
          message: error.message || t('profile.deliveryAddresses.addError'),
          status: 'danger',
          pos: 'top-center',
          timeout: 5000,
        });
      } finally {
        setIsAddingAddress(false);
      }
    };

    const handleCancel = async () => {
      if (!purchase) return;

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
          dispatch(updateActivePurchaseStatus('CANCELLED'));
        } catch (error: unknown) {
          console.error('Failed to cancel purchase', error);
          UIkit.modal.alert((error as Error).message || t('auth.errors.generic'), { 
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
        dispatch(setModalOpen(false));
        if (status !== 'AWAITING_PAYMENT') {
          dispatch(clearActivePurchase());
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
              
              {purchase && (
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
              )}
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

    const renderAddressSummary = (addr: DeliveryAddressDto) => (
      <div className={`uk-card uk-card-default uk-card-body uk-card-small uk-margin-bottom ${styles.addressSummary}`}>
        <p className="uk-text-small uk-text-muted uk-margin-remove-bottom">{t('purchases.deliveryTo')}</p>
        <p className="uk-text-bold uk-margin-remove">{addr.name}</p>
        <p className="uk-text-small uk-margin-remove">
          {addr.fullName} · {addr.street} · {addr.city}, {addr.postalCode}
        </p>
        <p className="uk-text-small uk-margin-remove">
          {getCountryFlag(addr.country)} {getCountryName(addr.country)} · {addr.phoneNumber}
        </p>
      </div>
    );

    const springTransition: Transition = { type: 'spring', stiffness: 400, damping: 40 };

    const renderAddressStep = () => (
      <>
        {!countryOfResidence && (
          <div className="uk-alert-warning" uk-alert="">
            <p>{t('purchases.countryOfResidenceRequired')}</p>
          </div>
        )}

        {addressLoadState === 'loading' && (
          <div className="uk-text-center uk-margin-large-top uk-margin-large-bottom">
            <Spinner ratio={2} />
          </div>
        )}

        {addressLoadState === 'error' && (
          <div className="uk-text-center uk-margin-top">
            <Icon icon="warning" ratio={2} className="uk-text-danger uk-margin-small-bottom" />
            <p className="uk-text-danger">{t('purchases.loadAddressesError')}</p>
            <Button variant="default" size="small" onClick={fetchAddresses}>
              {t('common.retry')}
            </Button>
          </div>
        )}

        {addressLoadState === 'empty' && !showAddForm && (
          <div className="uk-text-center uk-margin-top">
            <Icon icon="location" ratio={2} className="uk-text-muted uk-margin-small-bottom" />
            <p className="uk-text-muted">
              {t('purchases.noAddressesForCountry')}
            </p>
            <Button variant="primary" size="small" onClick={() => setShowAddForm(true)}>
              {t('purchases.addAddress')}
            </Button>
          </div>
        )}

        {addressLoadState === 'list' && !showAddForm && (
          <div className="uk-flex uk-flex-column" style={{ gap: '8px' }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`uk-card uk-card-body uk-card-small ${styles.addressCard} ${
                  selectedAddress?.id === addr.id ? styles.addressCardSelected : 'uk-card-default'
                }`}
                onClick={() => dispatch(setSelectedAddress(addr))}
                role="radio"
                aria-checked={selectedAddress?.id === addr.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dispatch(setSelectedAddress(addr));
                  }
                }}
              >
                <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                  <span className={`${styles.radioIndicator} ${selectedAddress?.id === addr.id ? styles.radioSelected : ''}`} />
                  <span className="uk-text-bold">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="uk-label uk-label-success" style={{ fontSize: '0.7rem' }}>
                      {t('profile.deliveryAddresses.default')}
                    </span>
                  )}
                </div>
                <div className="uk-text-small uk-margin-small-top" style={{ paddingLeft: '22px' }}>
                  <div>{addr.fullName}</div>
                  <div>{addr.street}</div>
                  <div>{addr.city}, {addr.postalCode}</div>
                  <div>{getCountryFlag(addr.country)} {getCountryName(addr.country)}</div>
                  {addr.phoneNumber && <div className="uk-text-muted">{addr.phoneNumber}</div>}
                </div>
              </div>
            ))}
            <Button
              variant="text"
              size="small"
              className="uk-margin-small-top"
              onClick={() => setShowAddForm(true)}
            >
              <Icon icon="plus" ratio={0.8} /> {t('purchases.addAddress')}
            </Button>
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTransition}
              style={{ overflow: 'hidden' }}
              className="uk-margin-top"
            >
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={() => setShowAddForm(false)}
                isSubmitting={isAddingAddress}
                lockedCountry={countryOfResidence ?? undefined}
                showDefault={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {purchaseError && (
          <div className="uk-alert-danger uk-margin-top" uk-alert="">
            <p>{purchaseError}</p>
          </div>
        )}
      </>
    );

    const renderPaymentStep = () => {
      if (!purchase) return null;
      return (
        <>
          {selectedAddress && renderAddressSummary(selectedAddress)}

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
        </>
      );
    };

    return (
      <Modal ref={mergedRef} container={false} escClose={false} bgClose={false}>
        <ModalDialog>
          <ModalHeader>
            <ModalTitle>
              {step === 'address' ? t('purchases.selectAddress') : t('purchases.paymentTitle')}
            </ModalTitle>
            {purchaseIntent && (
              <span className="uk-text-muted uk-text-small">
                {t('purchases.stepOf', { current: step === 'address' ? 1 : 2, total: 2 })}
              </span>
            )}
          </ModalHeader>
          <ModalBody>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: step === 'payment' ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === 'payment' ? -30 : 30 }}
                transition={springTransition}
              >
                {step === 'address' ? renderAddressStep() : renderPaymentStep()}
              </motion.div>
            </AnimatePresence>
          </ModalBody>
          <ModalFooter>
            <div className="uk-grid-small uk-child-width-1-1 uk-child-width-auto@s uk-flex-right" uk-grid="">
              {step === 'address' && (
                <>
                  <div>
                    <Button variant="default" className="uk-width-1-1" onClick={handleClose}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                  <div>
                    <Button 
                      variant="primary" 
                      className="uk-width-1-1"
                      onClick={handleConfirmAndPay}
                      disabled={!selectedAddress || isCreatingPurchase || !countryOfResidence}
                    >
                      {isCreatingPurchase ? <Spinner ratio={0.6} /> : t('purchases.confirmAndPay')}
                    </Button>
                  </div>
                </>
              )}
              {step === 'payment' && (
                <>
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
                </>
              )}
            </div>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    );
  }
);
