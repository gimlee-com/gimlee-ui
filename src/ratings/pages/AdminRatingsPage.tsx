import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { ratingService } from '../services/ratingService';
import RatingCard from '../components/RatingCard/RatingCard';
import { SmartPagination } from '../../components/SmartPagination';
import { createPageContainerVariants, pageItemVariants } from '../../animations';
import type { RatingResponseDto } from '../types/ratings';
import type { PageMetadata } from '../../types/api';

export default function AdminRatingsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ratings, setRatings] = useState<RatingResponseDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('p') || '0', 10);

  const fetchRatings = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ratingService.getReportedRatings(page, 20);
      setRatings(res.content);
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
    void fetchRatings(currentPage);
  }, [currentPage, fetchRatings]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('p', page.toString());
    setSearchParams(params);
  };

  const handleHide = async (ratingId: string) => {
    try {
      await UIkit.modal.confirm(t('reviews.admin.hideConfirm'));
      await ratingService.hideRating(ratingId);
      void fetchRatings(currentPage);
    } catch (err: unknown) {
      if (err === true || err === false) return;
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('reviews.errors.generic');
      setError(message);
    }
  };

  const handleRestore = async (ratingId: string) => {
    try {
      await ratingService.restoreRating(ratingId);
      void fetchRatings(currentPage);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('reviews.errors.generic');
      setError(message);
    }
  };

  return (
    <div>
      <h1 className="uk-heading-small uk-margin-bottom">
        {t('reviews.admin.title')}
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

      {!loading && !error && ratings.length === 0 && (
        <div className="uk-text-center uk-text-muted uk-margin-large-top">
          <span uk-icon="icon: check; ratio: 2" className="uk-margin-small-bottom" />
          <p>{t('reviews.admin.empty')}</p>
        </div>
      )}

      {!loading && ratings.length > 0 && (
        <motion.div
          variants={createPageContainerVariants()}
          initial="hidden"
          animate="visible"
        >
          {ratings.map((rating) => (
            <motion.div key={rating.id} variants={pageItemVariants} layout>
              <RatingCard
                rating={rating}
                viewerRole="admin"
                onHide={handleHide}
                onRestore={handleRestore}
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
    </div>
  );
}
