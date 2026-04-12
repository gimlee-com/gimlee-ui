import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { motion, AnimatePresence } from 'motion/react';
import { userService } from '../../services/userService';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Heading } from '../../../components/uikit/Heading/Heading';
import { Button } from '../../../components/uikit/Button/Button';
import { useCountries } from '../../../hooks/useCountries';
import { AddressForm } from '../AddressForm/AddressForm';
import type { DeliveryAddressDto, AddDeliveryAddressRequestDto } from '../../../types/api';

const DeliveryAddressCard: React.FC = () => {
  const { t } = useTranslation();

  const [addresses, setAddresses] = useState<DeliveryAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getCountryName } = useCountries();

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getDeliveryAddresses();
      setAddresses(data);
    } catch {
      // Silently handle — the list will just be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const onSubmit = async (data: AddDeliveryAddressRequestDto) => {
    setIsSubmitting(true);
    try {
      await userService.addDeliveryAddress(data);
      UIkit.notification({
        message: t('profile.deliveryAddresses.addSuccess'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
      setShowForm(false);
      void fetchAddresses();
    } catch (err: unknown) {
      let message: string;
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        (err as { status: string }).status === 'USER_MAX_ADDRESSES_REACHED'
      ) {
        message = t('profile.deliveryAddresses.maxReached');
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = (err as { message: string }).message;
      } else {
        message = t('profile.deliveryAddresses.addError');
      }
      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="uk-margin-bottom">
      <CardBody>
        <div className="uk-flex uk-flex-between uk-flex-middle uk-margin-bottom">
          <Heading as="h4" className="uk-margin-remove">
            {t('profile.deliveryAddresses.title')}
          </Heading>
          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? t('common.cancel') : t('profile.deliveryAddresses.addAddress')}
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              style={{ overflow: 'hidden' }}
              className="uk-margin-bottom"
            >
              <AddressForm
                onSubmit={onSubmit}
                onCancel={() => setShowForm(false)}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="uk-text-center uk-margin-top">
            <div uk-spinner="" />
          </div>
        )}

        {!loading && addresses.length === 0 && (
          <div className="uk-text-center uk-text-muted uk-margin-top">
            <span uk-icon="icon: location; ratio: 2" className="uk-margin-small-bottom" />
            <p>{t('profile.deliveryAddresses.noAddresses')}</p>
          </div>
        )}

        {!loading && addresses.length > 0 && (
          <div className="uk-flex uk-flex-column" style={{ gap: '12px' }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="uk-card uk-card-default uk-card-body uk-card-small"
              >
                <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                  <span className="uk-text-bold">{addr.name}</span>
                  {addr.isDefault && (
                    <span className="uk-label">
                      {t('profile.deliveryAddresses.default')}
                    </span>
                  )}
                </div>
                <div className="uk-text-meta uk-margin-small-top">
                  {addr.fullName}
                </div>
                <div className="uk-text-small">{addr.street}</div>
                <div className="uk-text-small">
                  {addr.city}, {addr.postalCode}
                </div>
                <div className="uk-text-small">{getCountryName(addr.country)}</div>
                {addr.phoneNumber && (
                  <div className="uk-text-small uk-text-muted">{addr.phoneNumber}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DeliveryAddressCard;
