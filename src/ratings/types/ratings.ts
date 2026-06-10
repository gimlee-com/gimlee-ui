import type { PageMetadata } from '../../types/api';

export type RepKind = 'SEL' | 'BUY';
export type RatingStatus = 'PUB' | 'HID' | 'DEL';
export type EligibilityStatus = 'PND' | 'CSD';
export type ContextType = 'ORDER';

export interface RatingSnapshotItemDto {
  adId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  currency: string;
  thumbPath: string | null;
}

export interface RatingSnapshotDto {
  refType: string;
  items: RatingSnapshotItemDto[];
}

export interface SupplementResponseDto {
  id: string;
  body: string;
  status: RatingStatus;
  editableUntil: number;
  createdAt: number;
}

export interface RateeReplyDto {
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface RatingResponseDto {
  id: string;
  contextType: string;
  contextId: string;
  repKind: RepKind;
  raterId: string;
  rateeId: string;
  score: number;
  title: string | null;
  body: string | null;
  photoPaths: string[] | null;
  snapshot: RatingSnapshotDto | null;
  status: RatingStatus;
  edited: boolean;
  editableUntil: number;
  supplements: SupplementResponseDto[] | null;
  response: RateeReplyDto | null;
  helpfulCount: number;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}

export interface EligibilityResponseDto {
  id: string;
  contextType: string;
  contextId: string;
  raterId: string;
  rateeId: string;
  repKind: RepKind;
  status: EligibilityStatus;
  activeFrom: number;
  expiresAt: number;
  snapshot: RatingSnapshotDto | null;
  createdAt: number;
}

export interface RatingAggregateResponseDto {
  rateeId: string;
  repKind: RepKind;
  count: number;
  average: number;
  dist: Record<string, number>;
  lastRatingAt: number | null;
}

export interface PageRatingResponseDto {
  content: RatingResponseDto[];
  page: PageMetadata;
}

export interface PageEligibilityResponseDto {
  content: EligibilityResponseDto[];
  page: PageMetadata;
}

export interface CreateRatingRequestDto {
  contextType: ContextType;
  contextId: string;
  score: number;
  title?: string;
  body?: string;
  photoPaths?: string[];
}

export interface EditRatingRequestDto {
  score: number;
  title?: string;
  body?: string;
  photoPaths?: string[];
}

export interface AddSupplementRequestDto {
  body: string;
}

export interface AddRatingResponseRequestDto {
  body: string;
}
