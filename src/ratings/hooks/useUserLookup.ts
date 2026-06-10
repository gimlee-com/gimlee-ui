import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/apiClient';
import type { UserSummaryDto } from '../../types/api';

const cache = new Map<string, UserSummaryDto>();
const pending = new Map<string, Promise<UserSummaryDto>>();

async function fetchUserSummary(userId: string): Promise<UserSummaryDto> {
  const cached = cache.get(userId);
  if (cached) return cached;

  const existing = pending.get(userId);
  if (existing) return existing;

  const promise = apiClient
    .get<UserSummaryDto>(`/users/${userId}/summary`)
    .then((data) => {
      cache.set(userId, data);
      pending.delete(userId);
      return data;
    })
    .catch(() => {
      pending.delete(userId);
      return { username: 'Unknown User' } as UserSummaryDto;
    });

  pending.set(userId, promise);
  return promise;
}

export function useUserLookup(userIds: (string | undefined | null)[]) {
  const [userMap, setUserMap] = useState<Map<string, UserSummaryDto>>(() => new Map());
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    const uniqueIds = [...new Set(userIds.filter((id): id is string => !!id))];
    const unresolved = uniqueIds.filter((id) => !cache.has(id) && !userMap.has(id));

    if (unresolved.length === 0) {
      const map = new Map<string, UserSummaryDto>();
      for (const id of uniqueIds) {
        const cached = cache.get(id);
        if (cached) map.set(id, cached);
      }
      setUserMap(map);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(unresolved.map(fetchUserSummary)).then(() => {
      if (abortRef.current) return;
      const map = new Map<string, UserSummaryDto>();
      for (const id of uniqueIds) {
        const cached = cache.get(id);
        if (cached) map.set(id, cached);
      }
      setUserMap(map);
      setLoading(false);
    });

    return () => {
      abortRef.current = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userIds.filter(Boolean))]);

  return { userMap, loading };
}
