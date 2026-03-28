import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Countdown hook for displaying time remaining until a target timestamp.
 *
 * @param targetMicros - Target timestamp in **epoch microseconds** (backend convention).
 *                       Pass `null` or `undefined` for permanent/no-expiry scenarios.
 * @returns Remaining time broken into days/hours/minutes/seconds plus an `isExpired` flag.
 */
export function useCountdown(targetMicros: number | null | undefined): CountdownResult {
  const computeRemaining = useCallback((): CountdownResult => {
    if (targetMicros == null) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false };
    }

    const targetMs = targetMicros / 1000;
    const diff = targetMs - Date.now();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      isExpired: false,
    };
  }, [targetMicros]);

  const [remaining, setRemaining] = useState<CountdownResult>(computeRemaining);

  useEffect(() => {
    if (targetMicros == null) return;

    setRemaining(computeRemaining());

    const interval = setInterval(() => {
      const next = computeRemaining();
      setRemaining(next);
      if (next.isExpired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMicros, computeRemaining]);

  return remaining;
}
