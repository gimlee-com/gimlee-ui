import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUIKit } from '../../../hooks/useUIkit';
import StarRating from '../StarRating/StarRating';
import { MarkdownEditor } from '../../../components/Markdown/MarkdownEditor';
import { Form, FormLabel, FormControls, Input, FormMessage, AnimatePresence, motion } from '../../../components/Form/Form';
import type { CreateRatingRequestDto, EditRatingRequestDto, RatingResponseDto } from '../../types/ratings';
import styles from './RatingForm.module.scss';

interface RatingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRatingRequestDto | EditRatingRequestDto) => void;
  existingRating?: RatingResponseDto | null;
  contextId?: string;
  isSubmitting?: boolean;
}

interface RatingFormValues {
  score: number;
  title: string;
  body: string;
}

export default function RatingForm({
  isOpen,
  onClose,
  onSubmit,
  existingRating,
  contextId,
  isSubmitting = false,
}: RatingFormProps) {
  const { t } = useTranslation();
  const { ref: modalRef, element: modalEl, instance } = useUIKit<{ show: () => void; hide: () => void }, HTMLDivElement>('modal', { container: false, stack: true });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, touchedFields },
  } = useForm<RatingFormValues>({
    mode: 'onChange',
    defaultValues: {
      score: 0,
      title: '',
      body: '',
    },
  });

  const [titleFocused, setTitleFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);

  const titleRegister = register('title', {
    maxLength: {
      value: 100,
      message: t('reviews.ratingForm.titleTooLong'),
    },
  });

  const handleHide = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!instance) return;
    if (isOpen) {
      if (existingRating) {
        reset({
          score: existingRating.score,
          title: existingRating.title || '',
          body: existingRating.body || '',
        });
      } else {
        reset({ score: 0, title: '', body: '' });
      }
      instance.show();
    } else {
      instance.hide();
    }
  }, [isOpen, instance, existingRating, reset]);

  useEffect(() => {
    const el = modalEl;
    if (!el) return;
    el.addEventListener('hidden', handleHide);
    return () => el.removeEventListener('hidden', handleHide);
  }, [handleHide, modalEl]);

  const handleFormSubmit = (data: RatingFormValues) => {
    if (existingRating) {
      const editData: EditRatingRequestDto = {
        score: data.score,
        title: data.title || undefined,
        body: data.body || undefined,
      };
      onSubmit(editData);
    } else {
      if (!contextId) return;
      const createData: CreateRatingRequestDto = {
        contextType: 'ORDER',
        contextId,
        score: data.score,
        title: data.title || undefined,
        body: data.body || undefined,
      };
      onSubmit(createData);
    }
  };

  return createPortal(
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">
            {existingRating
              ? t('reviews.ratingForm.editTitle')
              : t('reviews.ratingForm.title')}
          </h2>
        </div>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="uk-modal-body">
            <motion.div layout className="uk-margin">
              <FormLabel>{t('reviews.ratingForm.score')}</FormLabel>
              <div className={styles.starRow}>
                <Controller
                  name="score"
                  control={control}
                  rules={{
                    min: { value: 1, message: t('reviews.ratingForm.scoreRequired') },
                  }}
                  render={({ field }) => (
                    <StarRating
                      value={field.value}
                      size="lg"
                      interactive
                      onChange={field.onChange}
                    />
                  )}
                />
                <AnimatePresence>
                  {errors.score && touchedFields.score && (
                    <FormMessage>{errors.score.message}</FormMessage>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div layout className="uk-margin">
              <FormLabel>{t('reviews.ratingForm.titleLabel')}</FormLabel>
              <FormControls>
                <Input
                  {...titleRegister}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={(e) => {
                    titleRegister.onBlur(e);
                    setTitleFocused(false);
                  }}
                  status={errors.title && !titleFocused && touchedFields.title ? 'danger' : undefined}
                  type="text"
                  placeholder={t('reviews.ratingForm.titlePlaceholder')}
                  maxLength={100}
                />
                <AnimatePresence>
                  {errors.title && !titleFocused && touchedFields.title && (
                    <FormMessage>{errors.title.message}</FormMessage>
                  )}
                </AnimatePresence>
              </FormControls>
            </motion.div>

            <motion.div layout className="uk-margin">
              <FormLabel>{t('reviews.ratingForm.bodyLabel')}</FormLabel>
              <FormControls>
                <Controller
                  name="body"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 5000,
                      message: t('reviews.ratingForm.bodyTooLong'),
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
              {isSubmitting
                ? t('common.loading')
                : existingRating
                  ? t('reviews.ratingForm.editSubmit')
                  : t('reviews.ratingForm.submit')}
            </button>
          </div>
        </Form>
      </div>
    </div>,
    document.getElementById('root') || document.body
  );
}
