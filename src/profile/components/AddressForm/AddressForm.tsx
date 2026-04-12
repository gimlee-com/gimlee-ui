import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import {
  Input,
  FormLabel,
  FormControls,
  FormMessage,
  Checkbox,
} from '../../../components/Form/Form';
import { Button } from '../../../components/uikit/Button/Button';
import { CountrySelector } from '../../../components/CountrySelector/CountrySelector';
import type { AddDeliveryAddressRequestDto } from '../../../types/api';

export interface AddressFormProps {
  onSubmit: (data: AddDeliveryAddressRequestDto) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  /** If provided, locks the country field to this value */
  lockedCountry?: string;
  /** Whether to show the "Set as default" checkbox */
  showDefault?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting: externalSubmitting,
  lockedCountry,
  showDefault = true,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting: formSubmitting },
  } = useForm<AddDeliveryAddressRequestDto>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      fullName: '',
      street: '',
      city: '',
      postalCode: '',
      country: lockedCountry ?? '',
      phoneNumber: '',
      isDefault: false,
    },
  });

  const submitting = externalSubmitting ?? formSubmitting;

  return (
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
                disabled={!!lockedCountry}
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

      {showDefault && (
        <div className="uk-margin">
          <label>
            <Checkbox {...register('isDefault')} />{' '}
            {t('profile.deliveryAddresses.setAsDefault')}
          </label>
        </div>
      )}

      <div className="uk-flex uk-flex-right" style={{ gap: '8px' }}>
        {onCancel && (
          <Button type="button" variant="default" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid || submitting}
        >
          {t('profile.deliveryAddresses.save')}
        </Button>
      </div>
    </form>
  );
};
