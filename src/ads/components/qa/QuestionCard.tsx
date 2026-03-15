import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import UIkit from 'uikit';
import type { QuestionDto, AnswerDto, ReportTargetType } from '../../types/qa';
import { formatRelativeTimeFromIso } from '../../../utils/dateUtils';
import { qaService } from '../../services/qaService';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Label } from '../../../components/uikit/Label/Label';
import { Button } from '../../../components/uikit/Button/Button';
import { AnswerItem } from './AnswerItem';
import { AnswerForm } from './AnswerForm';
import styles from './QuestionCard.module.scss';

interface QuestionCardProps {
  question: QuestionDto;
  isSeller: boolean;
  isLoggedIn: boolean;
  onQuestionUpdated: (question: QuestionDto) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isSeller,
  isLoggedIn,
  onQuestionUpdated,
}) => {
  const { t } = useTranslation();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleUpvote = useCallback(async () => {
    if (!isLoggedIn) return;
    // Optimistic update
    const wasUpvoted = question.isUpvotedByMe;
    onQuestionUpdated({
      ...question,
      isUpvotedByMe: !wasUpvoted,
      upvoteCount: wasUpvoted ? question.upvoteCount - 1 : question.upvoteCount + 1,
    });
    try {
      await qaService.toggleUpvote(question.id);
    } catch {
      // Revert on failure
      onQuestionUpdated(question);
      UIkit.notification({ message: t('questions.errors.upvoteFailed'), status: 'danger' });
    }
  }, [question, isLoggedIn, onQuestionUpdated, t]);

  const handlePin = useCallback(async () => {
    try {
      setLoadingAction('pin');
      await qaService.togglePin(question.id);
      onQuestionUpdated({ ...question, isPinned: !question.isPinned });
    } catch (error: unknown) {
      const err = error as { status?: string };
      if (err.status === 'PIN_LIMIT_REACHED') {
        UIkit.notification({ message: t('questions.errors.pinLimitReached'), status: 'warning' });
      } else {
        UIkit.notification({ message: t('questions.errors.pinFailed'), status: 'danger' });
      }
    } finally {
      setLoadingAction(null);
    }
  }, [question, onQuestionUpdated, t]);

  const handleHide = useCallback(async () => {
    try {
      await UIkit.modal.confirm(t('questions.hideConfirm'), {
        stack: true,
        i18n: { ok: t('common.ok'), cancel: t('common.cancel') },
      });
    } catch {
      return; // User cancelled
    }
    try {
      setLoadingAction('hide');
      await qaService.hideQuestion(question.id);
      onQuestionUpdated({ ...question, status: 'HIDDEN' });
    } catch {
      UIkit.notification({ message: t('questions.errors.hideFailed'), status: 'danger' });
    } finally {
      setLoadingAction(null);
    }
  }, [question, onQuestionUpdated, t]);

  const handleReport = useCallback(async (targetType: ReportTargetType, targetId: string) => {
    const reason = await new Promise<string | null>((resolve) => {
      UIkit.modal.prompt(t('questions.reportPlaceholder'), '', {
        stack: true,
        i18n: { ok: t('questions.reportSubmit'), cancel: t('common.cancel') },
      }).then(
        (value: string | null) => resolve(value),
        () => resolve(null)
      );
    });
    if (!reason) return;
    try {
      await qaService.report(targetType, targetId, reason);
      UIkit.notification({ message: t('questions.reportSuccess'), status: 'success' });
    } catch (error: unknown) {
      const err = error as { status?: string };
      if (err.status === 'ALREADY_REPORTED') {
        UIkit.notification({ message: t('questions.reportAlreadyReported'), status: 'warning' });
      } else {
        UIkit.notification({ message: t('questions.errors.reportFailed'), status: 'danger' });
      }
    }
  }, [t]);

  const handleAnswerSubmitted = useCallback((answer: AnswerDto) => {
    onQuestionUpdated({
      ...question,
      answers: [...question.answers, answer],
      answerCount: question.answerCount + 1,
      status: 'ANSWERED',
    });
  }, [question, onQuestionUpdated]);

  if (question.status === 'HIDDEN' && !isSeller) return null;

  const cardClassName = [
    'uk-card uk-card-default uk-card-body uk-card-small',
    styles.questionCard,
    question.isPinned ? styles.pinnedCard : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassName}>
      {question.isPinned && (
        <div className="uk-text-small uk-text-primary uk-margin-small-bottom">
          <Icon icon="bolt" ratio={0.75} className="uk-margin-small-right" />
          {t('questions.pinned')}
        </div>
      )}

      <div className="uk-grid-small" data-uk-grid="">
        {/* Upvote column */}
        <div className="uk-width-auto">
          <button
            className={`${styles.upvoteButton} ${question.isUpvotedByMe ? styles.upvoteActive : ''}`}
            onClick={handleUpvote}
            disabled={!isLoggedIn}
            title={t('questions.upvote')}
            type="button"
          >
            <Icon icon="triangle-up" ratio={1.2} />
            <span className={styles.upvoteCount}>{question.upvoteCount}</span>
          </button>
        </div>

        {/* Content column */}
        <div className="uk-width-expand">
          {/* Author row */}
          <div className="uk-flex uk-flex-middle uk-margin-small-bottom" style={{ gap: 8 }}>
            <GeometricAvatar username={question.authorUsername} size={24} />
            <span className="uk-text-bold uk-text-small">{question.authorUsername}</span>
            <span className="uk-text-meta">{formatRelativeTimeFromIso(question.createdAt)}</span>
            {question.status === 'PENDING' && (
              <Label variant="warning">{t('questions.unanswered')}</Label>
            )}
            {question.status === 'HIDDEN' && (
              <Label variant="danger">{t('questions.hide')}</Label>
            )}
          </div>

          {/* Question text */}
          <p className="uk-margin-remove-top uk-margin-small-bottom uk-text-break">
            {question.text}
          </p>

          {/* Answers */}
          {question.answers.length > 0 && (
            <div className={styles.answers}>
              {question.answers.map((answer) => (
                <div key={answer.id}>
                  <AnswerItem answer={answer} />
                  {isLoggedIn && (
                    <div className="uk-text-right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleReport('ANSWER', answer.id)}
                      >
                        <Icon icon="warning" ratio={0.7} className="uk-margin-small-right" />
                        {t('questions.report')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className={styles.actionBar}>
            {isLoggedIn && (
              <AnswerForm questionId={question.id} onAnswerSubmitted={handleAnswerSubmitted} />
            )}

            {isSeller && (
              <>
                <Button
                  variant="text"
                  size="small"
                  onClick={handlePin}
                  disabled={loadingAction === 'pin'}
                >
                  <Icon icon="bolt" ratio={0.7} className="uk-margin-small-right" />
                  {question.isPinned ? t('questions.unpin') : t('questions.pin')}
                </Button>

                {question.status !== 'HIDDEN' && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleHide}
                    disabled={loadingAction === 'hide'}
                  >
                    <Icon icon="ban" ratio={0.7} className="uk-margin-small-right" />
                    {t('questions.hide')}
                  </Button>
                )}
              </>
            )}

            {isLoggedIn && (
              <Button
                variant="text"
                size="small"
                onClick={() => handleReport('QUESTION', question.id)}
              >
                <Icon icon="warning" ratio={0.7} className="uk-margin-small-right" />
                {t('questions.report')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
