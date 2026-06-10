import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUIKit } from '../../../hooks/useUIkit';
import { MarkdownEditor } from '../../../components/Markdown/MarkdownEditor';
import { Form, FormLabel, FormControls, FormMessage, AnimatePresence, motion } from '../../../components/Form/Form';
import type { AddSupplementRequestDto } from '../../types/ratings';

interface SupplementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSupplementRequestDto) => void;
  isSubmitting?: boolean;
}

interface SupplementFormValues {
  body: string;
}

export default function SupplementForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: SupplementFormProps) {
  const { t } = useTranslation();
  const { ref: modalRef, element: modalEl, instance } = useUIKit<{ show: () => void; hide: () => void }, HTMLDivElement>('modal', { container: false, stack: true });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, touchedFields },
  } = useForm<SupplementFormValues>({
    mode: 'onChange',
    defaultValues: {
      body: '',
    },
  });

  const [bodyFocused, setBodyFocused] = useState(false);

  const handleHide = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!instance) return;
    if (isOpen) {
      reset({ body: '' });
      instance.show();
    } else {
      instance.hide();
    }
  }, [isOpen, instance, reset]);

  useEffect(() => {
    const el = modalEl;
    if (!el) return;
    el.addEventListener('hidden', handleHide);
    return () => el.removeEventListener('hidden', handleHide);
  }, [handleHide, modalEl]);

  const handleFormSubmit = (data: SupplementFormValues) => {
    onSubmit({ body: data.body });
  };

  return createPortal(
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">{t('reviews.supplementForm.title')}</h2>
        </div>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="uk-modal-body">
            <p className="uk-text-meta">{t('reviews.supplementForm.description')}</p>

            <motion.div layout className="uk-margin">
              <FormLabel>{t('reviews.supplementForm.bodyLabel')}</FormLabel>
              <FormControls>
                <Controller
                  name="body"
                  control={control}
                  rules={{
                    required: t('reviews.supplementForm.bodyRequired'),
                    maxLength: {
                      value: 5000,
                      message: t('reviews.supplementForm.bodyTooLong'),
                    },
                  }}
                  render={({ field }) => (
                    <MarkdownEditor
                      value={field.value}
                      onChange={field.onChange}
                      onFocus={() => setBodyFocused(true)}
                      onBlur={() => setBodyFocused(false)}
                      status={errors.body && !bodyFocused && touchedFields.body ? 'danger' : undefined}
                    />
                  )}
                />
                <AnimatePresence>
                  {errors.body && !bodyFocused && touchedFields.body && (
                    <FormMessage>{errors.body.message}</FormMessage>
                  )}
                </AnimatePresence>
              </FormControls>
            </motion.div>
          </div>
          <div className="uk-modal-footer uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close uk-margin-small-right" type="button">
              {t('common.cancel')}
            </button>
            <button
              className="uk-button uk-button-primary"
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('reviews.supplementForm.submit')}
            </button>
          </div>
        </Form>
      </div>
    </div>,
    document.getElementById('root') || document.body
  );
}
