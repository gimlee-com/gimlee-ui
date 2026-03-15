import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../context/AuthContext';
import { qaService } from '../../services/qaService';
import { Button } from '../../../components/uikit/Button/Button';
import { Icon } from '../../../components/uikit/Icon/Icon';
import type { QuestionDto } from '../../types/qa';

interface AskQuestionFormProps {
  adId: string;
  isSeller: boolean;
  onQuestionSubmitted: (question: QuestionDto) => void;
}

interface QuestionFormData {
  text: string;
}

const MAX_CHARS = 500;

export const AskQuestionForm: React.FC<AskQuestionFormProps> = ({
  adId,
  isSeller,
  onQuestionSubmitted,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<QuestionFormData>({ mode: 'onChange' });

  const textValue = watch('text', '');

  const onSubmit = useCallback(async (data: QuestionFormData) => {
    try {
      setServerError(null);
      const question = await qaService.askQuestion(adId, data.text);
      onQuestionSubmitted(question);
      reset();
      setIsOpen(false);
    } catch (error: unknown) {
      const err = error as { status?: string; message?: string };
      if (err.status === 'QUESTION_OWN_AD') {
        setServerError(t('questions.errors.ownAd'));
      } else if (err.status === 'QUESTION_LIMIT_REACHED') {
        setServerError(t('questions.errors.limitReached'));
      } else if (err.status === 'QUESTION_COOLDOWN_ACTIVE') {
        setServerError(t('questions.errors.cooldown'));
      } else {
        setServerError(err.message || t('questions.errors.askFailed'));
      }
    }
  }, [adId, onQuestionSubmitted, reset, t]);

  // Sellers can't ask on their own ad
  if (isSeller) return null;

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="uk-margin-medium-bottom">
        <Link
          to="/login"
          state={{ from: location.pathname + location.search }}
          className="uk-button uk-button-default"
        >
          <Icon icon="commenting" className="uk-margin-small-right" />
          {t('questions.loginToAsk')}
        </Link>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="uk-margin-medium-bottom">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          <Icon icon="commenting" className="uk-margin-small-right" />
          {t('questions.askQuestion')}
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="uk-margin-medium-bottom"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="uk-margin-small">
            <textarea
              className={`uk-textarea ${errors.text ? 'uk-form-danger' : ''}`}
              rows={3}
              placeholder={t('questions.questionPlaceholder')}
              {...register('text', {
                required: true,
                maxLength: {
                  value: MAX_CHARS,
                  message: t('questions.charLimit', { current: MAX_CHARS, max: MAX_CHARS }),
                },
              })}
            />
            <div className="uk-flex uk-flex-between uk-margin-xsmall-top">
              <span className="uk-text-meta">
                {t('questions.charLimit', { current: textValue.length, max: MAX_CHARS })}
              </span>
              {errors.text && (
                <span className="uk-text-danger uk-text-small">{errors.text.message}</span>
              )}
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
              {isSubmitting ? t('questions.submitting') : t('questions.submit')}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
