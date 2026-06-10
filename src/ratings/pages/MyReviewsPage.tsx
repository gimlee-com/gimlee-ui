import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../services/ratingService';
import RatingCard from '../components/RatingCard/RatingCard';
import RatingForm from '../components/RatingForm/RatingForm';
import SupplementForm from '../components/SupplementForm/SupplementForm';
import { SmartPagination } from '../../components/SmartPagination';
import { createPageContainerVariants, pageItemVariants } from '../../animations';
import type {
  RatingResponseDto,
  EditRatingRequestDto,
  AddSupplementRequestDto,
} from '../types/ratings';
import type { PageMetadata } from '../../types/api';

export default function MyReviewsPage() {
  useNavbarMode('focused', '/profile');
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [ratings, setRatings] = useState<RatingResponseDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<RatingResponseDto | null>(null);
  const [supplementFormOpen, setSupplementFormOpen] = useState(false);
  const [supplementRating, setSupplementRating] = useState<RatingResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPage = parseInt(searchParams.get('p') || '0', 10);

  const fetchRatings = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ratingService.getMyRatings(page, 20);
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
    if (!isAuthenticated) return;
    void fetchRatings(currentPage);
  }, [currentPage, isAuthenticated, fetchRatings]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('p', page.toString());
    setSearchParams(params);
  };

  const handleEdit = (rating: RatingResponseDto) => {
    setEditingRating(rating);
    setEditFormOpen(true);
  };

  const handleEditSubmit = async (data: EditRatingRequestDto) => {
    if (!editingRating) return;
    setIsSubmitting(true);
    try {
      await ratingService.editRating(editingRating.id, data as EditRatingRequestDto);
      setEditFormOpen(false);
      setEditingRating(null);
      void fetchRatings(currentPage);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('reviews.errors.generic');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ratingId: string) => {
    try {
      await UIkit.modal.confirm(t('reviews.myReviewsPage.confirmDelete'));
      await ratingService.deleteRating(ratingId);
      void fetchRatings(currentPage);
    } catch (err: unknown) {
      if (err === true || err === false) return;
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('reviews.errors.generic');
      setError(message);
    }
  };

  const handleSupplement = (rating: RatingResponseDto) => {
    setSupplementRating(rating);
    setSupplementFormOpen(true);
  };

  const handleSupplementSubmit = async (data: AddSupplementRequestDto) => {
    if (!supplementRating) return;
    setIsSubmitting(true);
    try {
      await ratingService.addSupplement(supplementRating.id, data);
      setSupplementFormOpen(false);
      setSupplementRating(null);
      void fetchRatings(currentPage);
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
        {t('reviews.myReviewsPage.title')}
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
          <span uk-icon="icon: star; ratio: 2" className="uk-margin-small-bottom" />
          <p>{t('reviews.myReviewsPage.empty')}</p>
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
                viewerRole="owner"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSupplement={handleSupplement}
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
        isOpen={editFormOpen}
        onClose={() => {
          setEditFormOpen(false);
          setEditingRating(null);
        }}
        onSubmit={handleEditSubmit}
        existingRating={editingRating}
        isSubmitting={isSubmitting}
      />

      <SupplementForm
        isOpen={supplementFormOpen}
        onClose={() => {
          setSupplementFormOpen(false);
          setSupplementRating(null);
        }}
        onSubmit={handleSupplementSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
