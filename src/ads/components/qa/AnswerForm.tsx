import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { qaService } from '../../services/qaService';
import { Button } from '../../../components/uikit/Button/Button';
import type { AnswerDto } from '../../types/qa';

interface AnswerFormProps {
  questionId: string;
  onAnswerSubmitted: (answer: AnswerDto) => void;
}

interface AnswerFormData {
  text: string;
}

const MAX_CHARS = 2000;

export const AnswerForm: React.FC<AnswerFormProps> = ({ questionId, onAnswerSubmitted }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AnswerFormData>({ mode: 'onChange' });

  const textValue = watch('text', '');

  const onSubmit = useCallback(async (data: AnswerFormData) => {
    try {
      setServerError(null);
      const answer = await qaService.submitAnswer(questionId, data.text);
      onAnswerSubmitted(answer);
      reset();
      setIsOpen(false);
    } catch (error: unknown) {
      const err = error as { status?: string; message?: string };
      if (err.status === 'ANSWER_NOT_PREVIOUS_BUYER') {
        setServerError(t('questions.errors.notPreviousBuyer'));
      } else if (err.status === 'ANSWER_ALREADY_EXISTS') {
        setServerError(t('questions.errors.answerAlreadyExists'));
      } else {
        setServerError(err.message || t('questions.errors.answerFailed'));
      }
    }
  }, [questionId, onAnswerSubmitted, reset, t]);

  if (!isOpen) {
    return (
      <Button variant="text" size="small" onClick={() => setIsOpen(true)}>
        {t('questions.reply')}
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="uk-margin-small-top"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="uk-margin-small">
            <textarea
              className={`uk-textarea ${errors.text ? 'uk-form-danger' : ''}`}
              rows={3}
              placeholder={t('questions.answerPlaceholder')}
              {...register('text', {
                required: true,
                maxLength: { value: MAX_CHARS, message: t('questions.charLimit', { current: MAX_CHARS, max: MAX_CHARS }) },
              })}
            />
            <div className="uk-flex uk-flex-between uk-margin-xsmall-top">
              <span className="uk-text-meta">
                {t('questions.charLimit', { current: textValue.length, max: MAX_CHARS })}
              </span>
              {errors.text && <span className="uk-text-danger uk-text-small">{errors.text.message}</span>}
            </div>
          </div>

          {serverError && (
            <div className="uk-alert uk-alert-danger uk-margin-small" data-uk-alert="">
              <p>{serverError}</p>
            </div>
          )}

          <div className="uk-flex uk-flex-right" style={{ gap: 8 }}>
            <Button
              variant="default"
              size="small"
              type="button"
              onClick={() => { reset(); setIsOpen(false); setServerError(null); }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="small" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? t('questions.replying') : t('questions.submitAnswer')}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
