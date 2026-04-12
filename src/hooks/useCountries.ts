import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { locationService } from '../services/locationService';
import type { CountryDto } from '../types/api';

const cache = new Map<string, CountryDto[]>();
const pendingFetches = new Map<string, Promise<CountryDto[]>>();

export function useCountries() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [countries, setCountries] = useState<CountryDto[]>(cache.get(currentLanguage) ?? []);
  const [loading, setLoading] = useState(!cache.has(currentLanguage));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const cached = cache.get(currentLanguage);
    if (cached) {
      setCountries(cached);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        // Deduplicate concurrent fetches for the same language
        if (!pendingFetches.has(currentLanguage)) {
          pendingFetches.set(currentLanguage, locationService.listCountries());
        }
        const result = await pendingFetches.get(currentLanguage)!;
        cache.set(currentLanguage, result);
        pendingFetches.delete(currentLanguage);
        if (mountedRef.current && i18n.language === currentLanguage) {
          setCountries(Array.isArray(result) ? result : []);
        }
      } catch (e) {
        console.error('Failed to load countries', e);
        pendingFetches.delete(currentLanguage);
      } finally {
        if (mountedRef.current && i18n.language === currentLanguage) {
          setLoading(false);
        }
      }
    };

    void load();
  }, [currentLanguage, i18n]);

  const getCountryName = useCallback((code: string): string => {
    const current = cache.get(currentLanguage) ?? countries;
    const country = current.find(c => c.code === code);
    return country?.name ?? code;
  }, [currentLanguage, countries]);

  return { countries, loading, getCountryName };
}
