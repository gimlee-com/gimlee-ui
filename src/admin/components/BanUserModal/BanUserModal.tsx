import React, { useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUIKit } from '../../../hooks/useUIkit';
import { Input } from '../../../components/uikit/Form/Form';
import { BAN_REASON_MIN_LENGTH, BAN_REASON_MAX_LENGTH } from '../../types/adminUser';

interface BanUserFormValues {
  reason: string;
  isPermanent: boolean;
  bannedUntil: string;
}

interface BanUserModalProps {
  username: string;
  isOpen: boolean;
  onConfirm: (reason: string, bannedUntil: number | null) => void;
  onClose: () => void;
}

const BanUserModal: React.FC<BanUserModalProps> = ({ username, isOpen, onConfirm, onClose }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const { instance } = useUIKit(modalRef, 'modal', { container: false, stack: true });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<BanUserFormValues>({
    mode: 'onBlur',
    defaultValues: {
      reason: '',
      isPermanent: true,
      bannedUntil: '',
    },
  });

  const isPermanent = watch('isPermanent');

  const handleHide = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!instance) return;
    if (isOpen) {
      instance.show();
    } else {
      instance.hide();
    }
  }, [isOpen, instance]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    el.addEventListener('hidden', handleHide);
    return () => el.removeEventListener('hidden', handleHide);
  }, [handleHide]);

  const onSubmit = (data: BanUserFormValues) => {
    let bannedUntil: number | null = null;
    if (!data.isPermanent && data.bannedUntil) {
      // Convert local datetime to epoch microseconds
      bannedUntil = new Date(data.bannedUntil).getTime() * 1000;
    }
    onConfirm(data.reason, bannedUntil);
    reset();
  };

  return (
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">{t('admin.users.ban.banUser')}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="uk-modal-body">
            <p className="uk-text-meta">
              {t('admin.users.ban.confirmBan', { username })}
            </p>

            <div className="uk-margin">
              <label className="uk-form-label">{t('admin.users.ban.reason')}</label>
              <div className="uk-form-controls">
                <textarea
                  className={`uk-textarea${errors.reason ? ' uk-form-danger' : ''}`}
                  rows={4}
                  placeholder={t('admin.users.ban.reasonPlaceholder')}
                  {...register('reason', {
                    required: true,
                    minLength: {
                      value: BAN_REASON_MIN_LENGTH,
                      message: t('admin.users.ban.reasonMinLength', { count: BAN_REASON_MIN_LENGTH }),
                    },
                    maxLength: {
                      value: BAN_REASON_MAX_LENGTH,
                      message: t('admin.users.ban.reasonMaxLength', { count: BAN_REASON_MAX_LENGTH }),
                    },
                  })}
                />
                {errors.reason && (
                  <p className="uk-text-danger uk-text-small uk-margin-small-top">
                    {errors.reason.message}
                  </p>
                )}
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label">
                <input
                  className="uk-checkbox uk-margin-small-right"
                  type="checkbox"
                  {...register('isPermanent')}
                />
                {t('admin.users.ban.permanent')}
              </label>
            </div>

            {!isPermanent && (
              <div className="uk-margin">
                <label className="uk-form-label">{t('admin.users.ban.until')}</label>
                <div className="uk-form-controls">
                  <Input
                    type="datetime-local"
                    {...register('bannedUntil', {
                      required: !isPermanent,
                    })}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="uk-modal-footer uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close uk-margin-small-right" type="button">
              {t('common.cancel')}
            </button>
            <button className="uk-button uk-button-danger" type="submit" disabled={!isValid}>
              {t('admin.users.ban.banUser')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BanUserModal;
