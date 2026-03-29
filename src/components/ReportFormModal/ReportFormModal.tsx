import React, { useEffect, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { useUIKit } from '../../hooks/useUIkit';
import { Select } from '../uikit/Form/Form';
import { reportService } from '../../services/reportService';
import type { ReportTargetType, ReportReason, ReportReasonDto, SubmitReportDto } from '../../admin/types/adminReport';

interface ReportFormModalProps {
  targetType: ReportTargetType;
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ReportFormValues {
  reason: ReportReason | '';
  description: string;
}

const ReportFormModal: React.FC<ReportFormModalProps> = ({ targetType, targetId, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [reasons, setReasons] = useState<ReportReasonDto[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const { ref: modalRef, instance } = useUIKit<{ show: () => void; hide: () => void }, HTMLDivElement>('modal', {
    container: false,
    stack: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ReportFormValues>({
    mode: 'onBlur',
    defaultValues: { reason: '', description: '' },
  });

  // Fetch applicable reasons when the modal opens or targetType changes
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingReasons(true);
    reportService.getReasons(targetType)
      .then((data) => { if (!cancelled) setReasons(data); })
      .catch(() => { if (!cancelled) setReasons([]); })
      .finally(() => { if (!cancelled) setLoadingReasons(false); });
    return () => { cancelled = true; };
  }, [isOpen, targetType]);

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

  const onSubmit = async (data: ReportFormValues) => {
    try {
      const dto: SubmitReportDto = {
        targetType,
        targetId,
        reason: data.reason as ReportReason,
        description: data.description,
      };
      await reportService.submitReport(dto);
      UIkit.notification({
        message: t('report.success'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
      reset();
      instance?.hide();
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('report.error');
      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000,
      });
    }
  };

  return (
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">{t('report.title')}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="uk-modal-body">
            <div className="uk-margin">
              <label className="uk-form-label">{t('report.reason')}</label>
              <div className="uk-form-controls">
                <Select
                  status={errors.reason ? 'danger' : undefined}
                  disabled={loadingReasons}
                  {...register('reason', {
                    required: t('report.reasonRequired'),
                    validate: (v) => v !== '' || t('report.reasonRequired'),
                  })}
                >
                  <option value="">
                    {loadingReasons ? t('common.loading') : t('report.reasonPlaceholder')}
                  </option>
                  {reasons.map((r) => (
                    <option key={r.reason} value={r.reason}>
                      {t(`report.reasons.${r.reason}`)}
                    </option>
                  ))}
                </Select>
                {errors.reason && (
                  <p className="uk-text-danger uk-text-small uk-margin-small-top">
                    {errors.reason.message}
                  </p>
                )}
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label">{t('report.description')}</label>
              <div className="uk-form-controls">
                <textarea
                  className={`uk-textarea${errors.description ? ' uk-form-danger' : ''}`}
                  rows={4}
                  placeholder={t('report.descriptionPlaceholder')}
                  {...register('description', {
                    required: t('report.descriptionRequired'),
                    minLength: {
                      value: 10,
                      message: t('report.descriptionMinLength', { count: 10 }),
                    },
                  })}
                />
                {errors.description && (
                  <p className="uk-text-danger uk-text-small uk-margin-small-top">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="uk-modal-footer uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close uk-margin-small-right" type="button">
              {t('common.cancel')}
            </button>
            <button className="uk-button uk-button-primary" type="submit" disabled={!isValid || isSubmitting || loadingReasons}>
              {isSubmitting ? t('common.loading') : t('report.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFormModal;
