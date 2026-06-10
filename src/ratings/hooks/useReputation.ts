import { useState, useEffect } from 'react';
import { ratingService } from '../services/ratingService';
import type { RatingAggregateResponseDto, RepKind } from '../types/ratings';

interface UseReputationResult {
  aggregate: RatingAggregateResponseDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReputation(
  userId: string | undefined | null,
  repKind: RepKind = 'SEL'
): UseReputationResult {
  const [aggregate, setAggregate] = useState<RatingAggregateResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!userId) {
      setAggregate(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    ratingService
      .getUserReputation(userId, repKind)
      .then((res) => {
        if (!cancelled) {
          setAggregate(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load reputation');
          setAggregate(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, repKind, trigger]);

  return {
    aggregate,
    loading,
    error,
    refetch: () => setTrigger((t) => t + 1),
  };
}
