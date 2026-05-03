/**
 * Formats a city label for display. Centralizes the logic used across
 * CitySelector, EditAdPage, AdCard, SalesAdCard, and AdDetailsPage.
 */
export function formatCityLabel(city: { name: string; countryCode: string; region?: string; district?: string }): string {
  const parts = [city.name];
  if (city.district && city.district !== city.name) parts.push(city.district);
  if (city.region) parts.push(city.region);
  return `${parts.join(', ')}, ${city.countryCode}`;
}

/**
 * Builds a short admin area description (adm2, adm1) for displaying
 * beneath the city name in suggestion dropdowns.
 * Omits the district when it matches the city name (redundant).
 * Returns `undefined` when there is nothing to show.
 */
export function formatAdminArea(city: { name: string; region?: string; district?: string }): string | undefined {
  const parts: string[] = [];
  if (city.district && city.district !== city.name) parts.push(city.district);
  if (city.region) parts.push(city.region);
  return parts.length > 0 ? parts.join(', ') : undefined;
}
