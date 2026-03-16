import { apiClient } from '../../services/apiClient';
import type {
  PagedQuestionDto,
  QuestionDto,
  AnswerDto,
  QaStatsDto,
  QuestionSort,
  ReportTargetType,
} from '../types/qa';
import type { StatusResponseDto } from '../../types/api';

/** Backend wraps mutation responses in this envelope */
interface DataEnvelope<T> {
  success: boolean;
  status: string;
  message?: string;
  data: T;
}

export const qaService = {
  /** Public: paginated answered questions (pinned first) */
  getQuestions: (adId: string, page = 0, size = 10, sort: QuestionSort = 'UPVOTES') => {
    const params = new URLSearchParams({ page: String(page), size: String(size), sort });
    return apiClient.get<PagedQuestionDto>(`/qa/ads/${adId}/questions?${params}`);
  },

  /** Auth: submit a question on an ad */
  askQuestion: async (adId: string, text: string) => {
    const envelope = await apiClient.post<DataEnvelope<QuestionDto>>(`/qa/ads/${adId}/questions`, { text });
    return envelope.data;
  },

  /** Auth: caller's own unanswered questions */
  getMyUnanswered: (adId: string) =>
    apiClient.get<QuestionDto[]>(`/qa/ads/${adId}/questions/mine`),

  /** Auth (seller): paginated unanswered questions on seller's ad */
  getSellerUnanswered: (adId: string, page = 0, size = 10) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    return apiClient.get<PagedQuestionDto>(`/qa/ads/${adId}/questions/seller?${params}`);
  },

  /** Public: Q&A stats for an ad */
  getStats: (adId: string) =>
    apiClient.get<QaStatsDto>(`/qa/ads/${adId}/questions/stats`),

  /** Auth: submit an answer to a question */
  submitAnswer: async (questionId: string, text: string) => {
    const envelope = await apiClient.post<DataEnvelope<AnswerDto>>(`/qa/questions/${questionId}/answers`, { text });
    return envelope.data;
  },

  /** Auth: edit own answer */
  editAnswer: async (answerId: string, text: string) => {
    const envelope = await apiClient.put<DataEnvelope<AnswerDto>>(`/qa/answers/${answerId}`, { text });
    return envelope.data;
  },

  /** Auth: toggle upvote on a question */
  toggleUpvote: (questionId: string) =>
    apiClient.post<StatusResponseDto>(`/qa/questions/${questionId}/upvote`),

  /** Auth (seller): toggle pin on a question */
  togglePin: (questionId: string) =>
    apiClient.put<StatusResponseDto>(`/qa/questions/${questionId}/pin`),

  /** Auth (seller): hide a question */
  hideQuestion: (questionId: string) =>
    apiClient.put<StatusResponseDto>(`/qa/questions/${questionId}/hide`),

  /** Auth (admin): permanently remove a question */
  removeQuestion: (questionId: string) =>
    apiClient.delete<StatusResponseDto>(`/qa/questions/${questionId}`),

  /** Auth: report a question or answer */
  report: (targetType: ReportTargetType, targetId: string, reason: string) =>
    apiClient.post<StatusResponseDto>('/reports', { targetType, targetId, reason }),
};
