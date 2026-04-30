import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface ListParamDef {
  key: string;
  type: 'string' | 'string[]' | 'number';
  defaultValue?: string | string[] | number;
}

export interface ListParams {
  [key: string]: string | string[] | number | undefined;
}

/**
 * URL-driven list parameter hook.
 * Reads/writes filter, sort, search, and page params from/to the URL.
 * Resets page to 0 when any non-page filter changes (principle #31).
 */
export function useListParams<T extends ListParams>(defs: ListParamDef[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const result: ListParams = {};
    for (const def of defs) {
      if (def.type === 'string[]') {
        const values = searchParams.getAll(def.key);
        result[def.key] = values.length > 0 ? values : (def.defaultValue as string[] | undefined);
      } else if (def.type === 'number') {
        const raw = searchParams.get(def.key);
        result[def.key] = raw != null ? Number(raw) : (def.defaultValue as number | undefined);
      } else {
        result[def.key] = searchParams.get(def.key) ?? (def.defaultValue as string | undefined);
      }
    }
    return result as T;
  }, [searchParams, defs]);

  const setParam = useCallback((key: string, value: string | string[] | number | undefined) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete(key);
      if (value != null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        if (Array.isArray(value)) {
          value.forEach(v => next.append(key, v));
        } else {
          next.set(key, String(value));
        }
      }
      // Reset page when changing any filter (not the page itself)
      if (key !== 'p') {
        next.delete('p');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setMultipleParams = useCallback((entries: Record<string, string | string[] | number | undefined>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(entries)) {
        next.delete(key);
        if (value != null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            value.forEach(v => next.append(key, v));
          } else {
            next.set(key, String(value));
          }
        }
      }
      // Reset page if any non-page key was changed
      if (!Object.keys(entries).every(k => k === 'p')) {
        next.delete('p');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearParam = useCallback((key: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete(key);
      if (key !== 'p') next.delete('p');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setPage = useCallback((page: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (page === 0) {
        next.delete('p');
      } else {
        next.set('p', String(page));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return { params, setParam, setMultipleParams, clearParam, setPage, clearAll };
}
