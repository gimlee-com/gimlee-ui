import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../../../context/AuthContext';
import { qaService } from '../../services/qaService';
import { QuestionCard } from './QuestionCard';
import { AskQuestionForm } from './AskQuestionForm';
import { SmartPagination } from '../../../components/SmartPagination';
import { Heading } from '../../../components/uikit/Heading/Heading';
import { Button } from '../../../components/uikit/Button/Button';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import type { QuestionDto, QuestionSort } from '../../types/qa';

interface QuestionsSectionProps {
  adId: string;
  sellerId?: string;
}

const PAGE_SIZE = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
} as const;

export const QuestionsSection: React.FC<QuestionsSectionProps> = ({ adId, sellerId }) => {
  const { t } = useTranslation();
  const { isAuthenticated, userProfile } = useAuth();

  const isSeller = Boolean(sellerId && userProfile?.userId === sellerId);

  // Public answered questions
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState<QuestionSort>('UPVOTES');
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pending questions (user's own or seller's unanswered)
  const [pendingQuestions, setPendingQuestions] = useState<QuestionDto[]>([]);

  const fetchQuestions = useCallback(async (p: number, s: QuestionSort) => {
    setFetching(true);
    setError(null);
    try {
      const result = await qaService.getQuestions(adId, p, PAGE_SIZE, s);
      setQuestions(result.content);
      setTotalPages(result.page.totalPages);
      setPage(p);
    } catch {
      setError(t('questions.errors.loadFailed'));
    } finally {
      setFetching(false);
      setInitialLoading(false);
    }
  }, [adId, t]);

  const fetchPending = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      if (isSeller) {
        const result = await qaService.getSellerUnanswered(adId);
        setPendingQuestions(result.content);
      } else {
        const result = await qaService.getMyUnanswered(adId);
        setPendingQuestions(result);
      }
    } catch {
      // Non-critical — don't block the page
    }
  }, [adId, isAuthenticated, isSeller]);

  useEffect(() => {
    fetchQuestions(0, sort);
  }, [adId, sort, fetchQuestions]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handlePageChange = useCallback((newPage: number) => {
    fetchQuestions(newPage, sort);
  }, [sort, fetchQuestions]);

  const handleSortChange = useCallback((newSort: QuestionSort) => {
    setSort(newSort);
    // fetchQuestions will be triggered by the sort useEffect
  }, []);

  const handleQuestionSubmitted = useCallback((question: QuestionDto) => {
    setPendingQuestions((prev) => [question, ...prev]);
  }, []);

  const handleQuestionUpdated = useCallback((updated: QuestionDto) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setPendingQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === updated.id);
      if (idx === -1) return prev;

      // If it moved to ANSWERED, remove from pending and prepend to main list
      if (updated.status === 'ANSWERED') {
        setQuestions((qs) => [updated, ...qs]);
        return prev.filter((q) => q.id !== updated.id);
      }

      // If hidden/removed, just remove from pending
      if (updated.status === 'HIDDEN' || updated.status === 'REMOVED') {
        return prev.filter((q) => q.id !== updated.id);
      }

      return prev.map((q) => (q.id === updated.id ? updated : q));
    });
  }, []);

  return (
    <div className="uk-margin-large-top">
      <Heading as="h4" divider>{t('questions.title')}</Heading>

      {/* Ask question form */}
      <AskQuestionForm
        adId={adId}
        isSeller={isSeller}
        onQuestionSubmitted={handleQuestionSubmitted}
      />

      {/* Pending questions */}
      {pendingQuestions.length > 0 && (
        <div className="uk-margin-medium-bottom">
          <h5 className="uk-text-bold uk-text-muted uk-margin-small-bottom">
            {isSeller ? t('questions.unanswered') : t('questions.yourPending')}
            <span className="uk-badge uk-margin-small-left">{pendingQuestions.length}</span>
          </h5>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {pendingQuestions.map((q) => (
              <motion.div key={q.id} variants={itemVariants}>
                <QuestionCard
                  question={q}
                  isSeller={isSeller}
                  isLoggedIn={isAuthenticated}
                  onQuestionUpdated={handleQuestionUpdated}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Sort controls */}
      {!initialLoading && questions.length > 0 && (
        <div className="uk-flex uk-flex-right uk-margin-small-bottom" style={{ gap: 8 }}>
          <Button
            variant={sort === 'UPVOTES' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleSortChange('UPVOTES')}
            disabled={fetching}
          >
            {t('questions.sortByUpvotes')}
          </Button>
          <Button
            variant={sort === 'RECENT' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleSortChange('RECENT')}
            disabled={fetching}
          >
            {t('questions.sortByRecent')}
          </Button>
        </div>
      )}

      {/* Main content */}
      {initialLoading ? (
        <div className="uk-flex uk-flex-center uk-padding">
          <Spinner ratio={1.5} />
        </div>
      ) : error ? (
        <div className="uk-alert uk-alert-danger" data-uk-alert="">
          <p>{error}</p>
        </div>
      ) : questions.length === 0 && pendingQuestions.length === 0 ? (
        <div className="uk-text-center uk-padding-large uk-background-muted uk-border-rounded">
          <Icon icon="question" ratio={2} className="uk-text-muted uk-margin-small-bottom" />
          <p className="uk-text-muted">{t('questions.noQuestions')}</p>
        </div>
      ) : (
        <div style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.2s ease' }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {questions.map((q) => (
              <motion.div key={q.id} variants={itemVariants}>
                <QuestionCard
                  question={q}
                  isSeller={isSeller}
                  isLoggedIn={isAuthenticated}
                  onQuestionUpdated={handleQuestionUpdated}
                />
              </motion.div>
            ))}
          </motion.div>

          <SmartPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="uk-margin-medium-top"
          />
        </div>
      )}
    </div>
  );
};
