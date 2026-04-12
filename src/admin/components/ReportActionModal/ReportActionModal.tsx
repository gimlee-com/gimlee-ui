import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUIKit } from '../../../hooks/useUIkit';
import type { ReportResolution, ResolveReportDto } from '../../types/adminReport';

interface ReportActionFormValues {
  resolution: ReportResolution | '';
  internalNotes: string;
}

interface ReportActionModalProps {
  isOpen: boolean;
  onConfirm: (dto: ResolveReportDto) => void;
  onClose: () => void;
}

const RESOLVE_RESOLUTIONS: ReportResolution[] = [
  'CONTENT_REMOVED',
  'USER_WARNED',
  'USER_BANNED',
  'OTHER',
];

const DISMISS_RESOLUTIONS: ReportResolution[] = [
  'NO_VIOLATION',
  'DUPLICATE',
];

const ReportActionModal: React.FC<ReportActionModalProps> = ({ isOpen, onConfirm, onClose }) => {
  const { t } = useTranslation();
  const { ref: modalRef, instance } = useUIKit<{ show: () => void; hide: () => void }, HTMLDivElement>('modal', { container: false, stack: true });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ReportActionFormValues>({
    mode: 'onChange',
    defaultValues: {
      resolution: '',
      internalNotes: '',
    },
  });

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
  }, [handleHide, modalRef]);

  const onSubmit = (data: ReportActionFormValues) => {
    if (!data.resolution) return;
    const dto: ResolveReportDto = {
      resolution: data.resolution as ReportResolution,
      ...(data.internalNotes.trim() && { internalNotes: data.internalNotes.trim() }),
    };
    onConfirm(dto);
    reset();
  };

  return createPortal(
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">{t('admin.reports.actionModal.title')}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="uk-modal-body">
            <fieldset className="uk-fieldset uk-margin">
              <legend className="uk-legend uk-text-bold">{t('admin.reports.actionModal.resolve')}</legend>
              {RESOLVE_RESOLUTIONS.map((res) => (
                <label key={res} className="uk-display-block uk-margin-small-top">
                  <input
                    className="uk-radio uk-margin-small-right"
                    type="radio"
                    value={res}
                    {...register('resolution', { required: t('admin.reports.actionModal.resolutionRequired') })}
                  />
                  {t(`admin.reports.resolution.${res}`)}
                </label>
              ))}
            </fieldset>

            <fieldset className="uk-fieldset uk-margin">
              <legend className="uk-legend uk-text-bold">{t('admin.reports.actionModal.dismiss')}</legend>
              {DISMISS_RESOLUTIONS.map((res) => (
                <label key={res} className="uk-display-block uk-margin-small-top">
                  <input
                    className="uk-radio uk-margin-small-right"
                    type="radio"
                    value={res}
                    {...register('resolution', { required: t('admin.reports.actionModal.resolutionRequired') })}
                  />
                  {t(`admin.reports.resolution.${res}`)}
                </label>
              ))}
            </fieldset>

            <div className="uk-margin">
              <label className="uk-form-label">{t('admin.reports.actionModal.internalNotes')}</label>
              <div className="uk-form-controls">
                <textarea
                  className="uk-textarea"
                  rows={3}
                  placeholder={t('admin.reports.actionModal.internalNotesPlaceholder')}
                  {...register('internalNotes')}
                />
              </div>
            </div>
          </div>
          <div className="uk-modal-footer uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close uk-margin-small-right" type="button">
              {t('common.cancel')}
            </button>
            <button className="uk-button uk-button-primary" type="submit" disabled={!isValid}>
              {t('admin.reports.actionModal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('root') || document.body
  );
};

export default ReportActionModal;
