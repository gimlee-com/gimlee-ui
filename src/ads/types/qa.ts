import type { PageMetadata } from '../../types/api';

// --- Question ---

export type QuestionStatus = 'PENDING' | 'ANSWERED' | 'HIDDEN' | 'REMOVED';

export interface QuestionDto {
  id: string;
  adId: string;
  authorId: string;
  authorUsername: string;
  text: string;
  upvoteCount: number;
  isPinned: boolean;
  isUpvotedByMe: boolean;
  status: QuestionStatus;
  answerCount: number;
  answers: AnswerDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedQuestionDto {
  content: QuestionDto[];
  page: PageMetadata;
}

export interface AskQuestionRequestDto {
  text: string;
}

// --- Answer ---

export type AnswerType = 'SELLER' | 'COMMUNITY';

export interface AnswerDto {
  id: string;
  questionId: string;
  authorId: string;
  authorUsername: string;
  type: AnswerType;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitAnswerRequestDto {
  text: string;
}

export interface EditAnswerRequestDto {
  text: string;
}

// --- Stats ---

export interface QaStatsDto {
  totalAnswered: number;
  totalUnanswered: number;
}

// --- Report ---

export type ReportTargetType = 'QUESTION' | 'ANSWER';

export interface ReportRequestDto {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

// --- Sort ---

export type QuestionSort = 'UPVOTES' | 'RECENT';
