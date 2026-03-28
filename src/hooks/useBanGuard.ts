import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook that wraps action handlers to prevent execution when user is banned.
 * Provides a guard function and the current ban status for UI disabling.
 *
 * Usage:
 * ```tsx
 * const { guardAction, isBanned } = useBanGuard();
 * <button disabled={isBanned} onClick={guardAction(handleCreateAd)}>Create Ad</button>
 * ```
 */
export function useBanGuard() {
  const { isBanned } = useAuth();

  const guardAction = useCallback(
    <T extends unknown[]>(handler: (...args: T) => void) => {
      return (...args: T) => {
        if (isBanned) return;
        handler(...args);
      };
    },
    [isBanned],
  );

  return { isBanned, guardAction };
}
