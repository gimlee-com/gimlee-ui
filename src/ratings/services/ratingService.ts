import { apiClient } from '../../services/apiClient';
import type {
  CreateRatingRequestDto, EditRatingRequestDto,
  AddSupplementRequestDto, AddRatingResponseRequestDto,
  RatingResponseDto, EligibilityResponseDto, RatingAggregateResponseDto,
  PageRatingResponseDto, PageEligibilityResponseDto,
  RepKind,
} from '../types/ratings';
import type { StatusResponseDto } from '../../types/api';

export const ratingService = {
  createRating: (req: CreateRatingRequestDto) =>
    apiClient.post<StatusResponseDto & { data: RatingResponseDto }>('/ratings', req),

  editRating: (ratingId: string, req: EditRatingRequestDto) =>
    apiClient.patch<StatusResponseDto & { data: RatingResponseDto }>(`/ratings/${ratingId}`, req),

  deleteRating: (ratingId: string) =>
    apiClient.delete<StatusResponseDto>(`/ratings/${ratingId}`),

  addSupplement: (ratingId: string, req: AddSupplementRequestDto) =>
    apiClient.post<StatusResponseDto & { data: RatingResponseDto }>(`/ratings/${ratingId}/supplements`, req),

  editSupplement: (ratingId: string, supplementId: string, req: AddSupplementRequestDto) =>
    apiClient.patch<StatusResponseDto & { data: RatingResponseDto }>(`/ratings/${ratingId}/supplements/${supplementId}`, req),

  addResponse: (ratingId: string, req: AddRatingResponseRequestDto) =>
    apiClient.post<StatusResponseDto & { data: RatingResponseDto }>(`/ratings/${ratingId}/response`, req),

  getRatingsReceived: (userId: string, repKind: RepKind = 'SEL', page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(
      `/ratings/user/${userId}?repKind=${repKind}&page=${page}&size=${size}`
    ),

  getRatingsWrittenByUser: (userId: string, page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(
      `/ratings/user/${userId}/written?page=${page}&size=${size}`
    ),

  getRating: (ratingId: string) =>
    apiClient.get<StatusResponseDto & { data: RatingResponseDto }>(`/ratings/public/${ratingId}`),

  getMyRatings: (page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(`/ratings/mine?page=${page}&size=${size}`),

  getPendingEligibility: (page = 0, size = 20) =>
    apiClient.get<PageEligibilityResponseDto>(`/ratings/eligibility?page=${page}&size=${size}`),

  getUserReputation: (userId: string, repKind: RepKind = 'SEL') =>
    apiClient.get<StatusResponseDto & { data: RatingAggregateResponseDto }>(
      `/ratings/aggregate/${userId}?repKind=${repKind}`
    ),

  getReportedRatings: (page = 0, size = 20) =>
    apiClient.get<PageRatingResponseDto>(`/admin/ratings/reported?page=${page}&size=${size}`),

  hideRating: (ratingId: string) =>
    apiClient.post<StatusResponseDto & { data: RatingResponseDto }>(`/admin/ratings/${ratingId}/hide`, {}),

  restoreRating: (ratingId: string) =>
    apiClient.post<StatusResponseDto & { data: RatingResponseDto }>(`/admin/ratings/${ratingId}/restore`, {}),
};
