import { formatDistanceToNow } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import i18n from '../i18n';

/**
 * Formats a date as a relative time string (e.g., "3 days ago", "an hour ago").
 * Handles epoch microseconds as used in the backend.
 * 
 * @param microseconds Epoch time in microseconds
 * @returns Localized relative time string
 */
export const formatRelativeTime = (microseconds: number): string => {
  const date = new Date(microseconds / 1000);
  
  const locale = i18n.language === 'pl-PL' ? pl : enUS;
  
  return formatDistanceToNow(date, { 
    addSuffix: true,
    locale 
  });
};

/**
 * Formats an ISO 8601 date-time string as a relative time string.
 * Used by Q&A and other features that return ISO timestamps.
 */
export const formatRelativeTimeFromIso = (isoString: string): string => {
  const date = new Date(isoString);

  const locale = i18n.language === 'pl-PL' ? pl : enUS;

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale
  });
};
