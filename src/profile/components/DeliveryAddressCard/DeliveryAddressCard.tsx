import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { motion, AnimatePresence } from 'motion/react';
import { userService } from '../../services/userService';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Heading } from '../../../components/uikit/Heading/Heading';
import { Button } from '../../../components/uikit/Button/Button';
import {
  Input,
  FormLabel,
  FormControls,
  FormMessage,
  Checkbox,
} from '../../../components/Form/Form';
import { CountrySelector } from '../../../components/CountrySelector/CountrySelector';
import { useCountries } from '../../../hooks/useCountries';
import type { DeliveryAddressDto, AddDeliveryAddressRequestDto } from '../../../types/api';

const DeliveryAddressCard: React.FC = () => {
  const { t } = useTranslation();

  const [addresses, setAddresses] = useState<DeliveryAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { getCountryName } = useCountries();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddDeliveryAddressRequestDto>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      fullName: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      phoneNumber: '',
      isDefault: false,
    },
  });

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
    try {
      await userService.addDeliveryAddress(data);
      UIkit.notification({
        message: t('profile.deliveryAddresses.addSuccess'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
      reset();
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="uk-margin">
                  <FormLabel>{t('profile.deliveryAddresses.name')}</FormLabel>
                  <FormControls>
                    <Input
                      status={errors.name ? 'danger' : undefined}
                      {...register('name', {
                        required: t('auth.errors.required', {
                          field: t('profile.deliveryAddresses.name'),
                        }),
                      })}
                    />
                  </FormControls>
                  <AnimatePresence>
                    {errors.name && (
                      <FormMessage type="error">{errors.name.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>

                <div className="uk-margin">
                  <FormLabel>{t('profile.deliveryAddresses.fullName')}</FormLabel>
                  <FormControls>
                    <Input
                      status={errors.fullName ? 'danger' : undefined}
                      {...register('fullName', {
                        required: t('auth.errors.required', {
                          field: t('profile.deliveryAddresses.fullName'),
                        }),
                      })}
                    />
                  </FormControls>
                  <AnimatePresence>
                    {errors.fullName && (
                      <FormMessage type="error">{errors.fullName.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>

                <div className="uk-margin">
                  <FormLabel>{t('profile.deliveryAddresses.street')}</FormLabel>
                  <FormControls>
                    <Input
                      status={errors.street ? 'danger' : undefined}
                      {...register('street', {
                        required: t('auth.errors.required', {
                          field: t('profile.deliveryAddresses.street'),
                        }),
                      })}
                    />
                  </FormControls>
                  <AnimatePresence>
                    {errors.street && (
                      <FormMessage type="error">{errors.street.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>

                <div className="uk-grid-small uk-child-width-1-2@s" uk-grid="">
                  <div>
                    <FormLabel>{t('profile.deliveryAddresses.city')}</FormLabel>
                    <FormControls>
                      <Input
                        status={errors.city ? 'danger' : undefined}
                        {...register('city', {
                          required: t('auth.errors.required', {
                            field: t('profile.deliveryAddresses.city'),
                          }),
                        })}
                      />
                    </FormControls>
                    <AnimatePresence>
                      {errors.city && (
                        <FormMessage type="error">{errors.city.message}</FormMessage>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <FormLabel>{t('profile.deliveryAddresses.postalCode')}</FormLabel>
                    <FormControls>
                      <Input
                        status={errors.postalCode ? 'danger' : undefined}
                        {...register('postalCode', {
                          required: t('auth.errors.required', {
                            field: t('profile.deliveryAddresses.postalCode'),
                          }),
                        })}
                      />
                    </FormControls>
                    <AnimatePresence>
                      {errors.postalCode && (
                        <FormMessage type="error">{errors.postalCode.message}</FormMessage>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="uk-margin">
                  <FormLabel>{t('profile.deliveryAddresses.country')}</FormLabel>
                  <FormControls>
                    <Controller
                      name="country"
                      control={control}
                      rules={{
                        required: t('auth.errors.required', {
                          field: t('profile.deliveryAddresses.country'),
                        }),
                      }}
                      render={({ field }) => (
                        <CountrySelector
                          value={field.value || null}
                          onChange={(code) => field.onChange(code ?? '')}
                          status={errors.country ? 'danger' : undefined}
                        />
                      )}
                    />
                  </FormControls>
                  <AnimatePresence>
                    {errors.country && (
                      <FormMessage type="error">{errors.country.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>

                <div className="uk-margin">
                  <FormLabel>{t('profile.deliveryAddresses.phoneNumber')}</FormLabel>
                  <FormControls>
                    <Input
                      type="tel"
                      status={errors.phoneNumber ? 'danger' : undefined}
                      {...register('phoneNumber', {
                        required: t('auth.errors.required', {
                          field: t('profile.deliveryAddresses.phoneNumber'),
                        }),
                      })}
                    />
                  </FormControls>
                  <AnimatePresence>
                    {errors.phoneNumber && (
                      <FormMessage type="error">{errors.phoneNumber.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>

                <div className="uk-margin">
                  <label>
                    <Checkbox {...register('isDefault')} />{' '}
                    {t('profile.deliveryAddresses.setAsDefault')}
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isValid || isSubmitting}
                >
                  {t('profile.deliveryAddresses.save')}
                </Button>
              </form>
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
