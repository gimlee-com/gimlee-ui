import { useState, useEffect, useRef } from 'react';
import { locationService } from '../services/locationService';

const STORAGE_KEY = 'guestCountryCode';

export function useGuestCountry() {
  const [guestCountryCode, setGuestCountryCodeState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );
  const [loading, setLoading] = useState(false);
  const detectAttempted = useRef(false);

  useEffect(() => {
    if (guestCountryCode || detectAttempted.current) return;
    detectAttempted.current = true;

    const detect = async () => {
      setLoading(true);
      try {
        const code = await locationService.detectCountry();
        if (code) {
          localStorage.setItem(STORAGE_KEY, code);
          setGuestCountryCodeState(code);
        }
      } catch {
        // GeoIP is best-effort — fail silently
      } finally {
        setLoading(false);
      }
    };

    void detect();
  }, [guestCountryCode]);

  const setGuestCountryCode = (code: string | null) => {
    if (code) {
      localStorage.setItem(STORAGE_KEY, code);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setGuestCountryCodeState(code);
  };

  return { guestCountryCode, setGuestCountryCode, loading };
}
