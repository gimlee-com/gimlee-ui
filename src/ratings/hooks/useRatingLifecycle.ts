import { useState, useEffect } from 'react';
import { nowInMicros, isElapsed, formatCountdown } from '../utils/ratingTimeUtils';

interface UseRatingLifecycleResult {
  isEditable: boolean;
  editCountdown: string;
  editDeadlineElapsed: boolean;
}

export function useRatingLifecycle(
  editableUntil: number | undefined | null
): UseRatingLifecycleResult {
  const [now, setNow] = useState(() => nowInMicros());

  useEffect(() => {
    if (!editableUntil || isElapsed(editableUntil)) return;

    const interval = setInterval(() => {
      setNow(nowInMicros());
    }, 30_000);

    return () => clearInterval(interval);
  }, [editableUntil]);

  if (!editableUntil) {
    return { isEditable: false, editCountdown: '', editDeadlineElapsed: true };
  }

  const elapsed = now >= editableUntil;

  return {
    isEditable: !elapsed,
    editCountdown: elapsed ? '' : formatCountdown(editableUntil),
    editDeadlineElapsed: elapsed,
  };
}
