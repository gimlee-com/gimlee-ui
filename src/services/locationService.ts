import { apiClient } from './apiClient';
import type { CountryDto, StatusResponseDto } from '../types/api';

export const locationService = {
  detectCountry: async (): Promise<string | null> => {
    try {
      const response = await apiClient.get<StatusResponseDto>('/location/geoip/country');
      if (response.success && response.data) {
        return (response.data as { countryCode: string }).countryCode;
      }
      return null;
    } catch {
      return null;
    }
  },

  listCountries: () =>
    apiClient.get<CountryDto[]>('/location/countries/'),
};
