import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { spacesService } from '../../spaces/services/spacesService';
import { ratingService } from '../services/ratingService';
import RatingCard from '../components/RatingCard/RatingCard';
import ReputationSummary from '../components/ReputationSummary/ReputationSummary';
import { SmartPagination } from '../../components/SmartPagination';
import { createPageContainerVariants, pageItemVariants } from '../../animations';
import type { RatingResponseDto, RepKind } from '../types/ratings';
import type { PageMetadata } from '../../types/api';

export default function UserReviewsPage() {
  const { userName } = useParams<{ userName: string }>();
  useNavbarMode('focused', userName ? `/u/${userName}` : '/');
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const repKindParam = searchParams.get('repKind') as RepKind | null;
  const [repKind, setRepKind] = useState<RepKind>(repKindParam || 'SEL');
  const [userId, setUserId] = useState<string | null>(null);

  const [ratings, setRatings] = useState<RatingResponseDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('p') || '0', 10);

  useEffect(() => {
    if (!userName) return;
    spacesService.fetchUserSpace(userName, 0)
      .then((data) => setUserId(data.user.userId))
      .catch(() => setError(t('reviews.errors.generic')));
  }, [userName, t]);

  const fetchRatings = useCallback(async (page: number, kind: RepKind, uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ratingService.getRatingsReceived(uid, kind, page, 20);
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
    if (!userId) return;
    void fetchRatings(currentPage, repKind, userId);
  }, [currentPage, repKind, userId, fetchRatings]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('p', page.toString());
    setSearchParams(params);
  };

  const handleRepKindChange = (kind: RepKind) => {
    setRepKind(kind);
    const params = new URLSearchParams(searchParams);
    params.set('p', '0');
    params.set('repKind', kind);
    setSearchParams(params);
  };

  return (
    <div>
      <h1 className="uk-heading-small uk-margin-bottom">
        {t('reviews.userReviewsPage.title', { username: userName })}
      </h1>

      {userId && (
        <div className="uk-margin-bottom">
          <ReputationSummary userId={userId} initialRepKind={repKind} />
        </div>
      )}

      <div className="uk-margin-bottom">
        <div className="uk-button-group">
          <button
            className={`uk-button ${repKind === 'SEL' ? 'uk-button-primary' : 'uk-button-default'}`}
            onClick={() => handleRepKindChange('SEL')}
            type="button"
          >
            {t('reviews.reputation.sellerRep')}
          </button>
          <button
            className={`uk-button ${repKind === 'BUY' ? 'uk-button-primary' : 'uk-button-default'}`}
            onClick={() => handleRepKindChange('BUY')}
            type="button"
          >
            {t('reviews.reputation.buyerRep')}
          </button>
        </div>
      </div>

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
          <p>{t('reviews.userReviewsPage.empty')}</p>
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
              <RatingCard rating={rating} viewerRole="public" />
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
