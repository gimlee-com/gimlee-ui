import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { ratingService } from '../services/ratingService';
import RatingCard from '../components/RatingCard/RatingCard';
import type { RatingResponseDto } from '../types/ratings';

export default function RatingDetailPage() {
  const { ratingId } = useParams<{ ratingId: string }>();
  useNavbarMode('focused', '/');
  const { t } = useTranslation();

  const [rating, setRating] = useState<RatingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prevRatingId, setPrevRatingId] = useState(ratingId);
  if (ratingId !== prevRatingId) {
    setPrevRatingId(ratingId);
    setLoading(true);
    setError(null);
    setRating(null);
  }

  useEffect(() => {
    if (!ratingId) return;
    ratingService.getRating(ratingId)
      .then((res) => {
        setRating(res.data);
      })
      .catch((err: unknown) => {
        const message = (err && typeof err === 'object' && 'message' in err)
          ? (err as { message: string }).message
          : t('reviews.errors.generic');
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ratingId, t]);

  return (
    <div>
      <h1 className="uk-heading-small uk-margin-bottom">
        {t('reviews.detailPage.title')}
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

      {!loading && !error && rating && (
        <RatingCard rating={rating} viewerRole="public" />
      )}
    </div>
  );
}
