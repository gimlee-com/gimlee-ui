const MICROS_PER_MS = 1000;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function epochMicrosToMs(micros: number): number {
  return Math.floor(micros / MICROS_PER_MS);
}

export function epochMicrosToDate(micros: number): Date {
  return new Date(epochMicrosToMs(micros));
}

export function nowInMicros(): number {
  return Date.now() * MICROS_PER_MS;
}

export function isElapsed(micros: number): boolean {
  return nowInMicros() >= micros;
}

export function formatRelativeTime(micros: number): string {
  const diffMs = epochMicrosToMs(micros) - Date.now();
  const absDiff = Math.abs(diffMs);

  if (absDiff < MS_PER_MINUTE) {
    return diffMs > 0 ? 'in a few seconds' : 'just now';
  }
  if (absDiff < MS_PER_HOUR) {
    const mins = Math.round(absDiff / MS_PER_MINUTE);
    return diffMs > 0 ? `in ${mins}m` : `${mins}m ago`;
  }
  if (absDiff < MS_PER_DAY) {
    const hours = Math.round(absDiff / MS_PER_HOUR);
    return diffMs > 0 ? `in ${hours}h` : `${hours}h ago`;
  }
  const days = Math.round(absDiff / MS_PER_DAY);
  return diffMs > 0 ? `in ${days}d` : `${days}d ago`;
}

export function formatCountdown(micros: number): string {
  const diffMs = epochMicrosToMs(micros) - Date.now();
  if (diffMs <= 0) return '';

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatDateTime(micros: number): string {
  return epochMicrosToDate(micros).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(micros: number): string {
  return epochMicrosToDate(micros).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
