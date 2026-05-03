import { apiClient } from '../../services/apiClient';
import i18n from '../../i18n';
import type { CitySuggestionDto, CityDto } from '../../types/api';

export interface CitySuggestionsParams {
  query: string;
  cc?: string | null;
  limit?: number;
}

export const cityService = {
  getSuggestions: ({ query, cc, limit }: CitySuggestionsParams) => {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('lang', i18n.language);
    if (cc) params.set('cc', cc);
    if (limit) params.set('limit', String(limit));
    return apiClient.get<CitySuggestionDto[]>(`/cities/suggestions?${params.toString()}`);
  },

  getCityById: (id: string) => {
    const params = new URLSearchParams();
    params.set('lang', i18n.language);
    return apiClient.get<CityDto>(`/cities/${id}?${params.toString()}`);
  },
};
