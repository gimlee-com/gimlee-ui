import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../services/ratingService';
import EligibilityCard from '../components/EligibilityCard/EligibilityCard';
import RatingForm from '../components/RatingForm/RatingForm';
import { SmartPagination } from '../../components/SmartPagination';
import { createPageContainerVariants, pageItemVariants } from '../../animations';
import type { EligibilityResponseDto, CreateRatingRequestDto } from '../types/ratings';
import type { PageMetadata } from '../../types/api';

export default function PendingReviewsPage() {
  useNavbarMode('focused', '/profile');
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [eligibilities, setEligibilities] = useState<EligibilityResponseDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEligibility, setSelectedEligibility] = useState<EligibilityResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPage = parseInt(searchParams.get('p') || '0', 10);

  const fetchEligibilities = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ratingService.getPendingEligibility(page, 20);
      setEligibilities(res.content);
      setPageInfo(res.page);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('reviews.errors.generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchEligibilities(currentPage);
  }, [currentPage, isAuthenticated, fetchEligibilities]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('p', page.toString());
    setSearchParams(params);
  };

  const handleRate = (eligibility: EligibilityResponseDto) => {
    setSelectedEligibility(eligibility);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateRatingRequestDto) => {
    setIsSubmitting(true);
    try {
      await ratingService.createRating(data as CreateRatingRequestDto);
      setFormOpen(false);
      setSelectedEligibility(null);
      void fetchEligibilities(currentPage);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('reviews.errors.generic');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="uk-text-center uk-margin-large-top">
        <p>{t('auth.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="uk-heading-small uk-margin-bottom">
        {t('reviews.pendingPage.title')}
      </h1>

      {loading && (
        <div className="uk-text-center uk-margin-large-top">
          <div uk-spinner="" />
        </div>
      )}

      {error && (
        <div className="uk-alert-danger" uk-alert="">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && eligibilities.length === 0 && (
        <div className="uk-text-center uk-text-muted uk-margin-large-top">
          <span uk-icon="icon: star; ratio: 2" className="uk-margin-small-bottom" />
          <p>{t('reviews.pendingPage.empty')}</p>
        </div>
      )}

      {!loading && eligibilities.length > 0 && (
        <motion.div
          variants={createPageContainerVariants()}
          initial="hidden"
          animate="visible"
        >
          {eligibilities.map((eligibility) => (
            <motion.div key={eligibility.id} variants={pageItemVariants} layout>
              <EligibilityCard
                eligibility={eligibility}
                onRate={handleRate}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {pageInfo && (
        <SmartPagination
          currentPage={pageInfo.number}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          className="uk-margin-medium-top"
        />
      )}

      <RatingForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedEligibility(null);
        }}
        onSubmit={handleFormSubmit}
        contextId={selectedEligibility?.contextId}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
