/**
 * Admin Report Management types.
 *
 * ⚠️ Timestamps from the backend are in **epoch microseconds**.
 * Convert to JS milliseconds: `ts / 1000` before passing to `new Date()`.
 */

import type { PageMetadata } from '../../types/api';

/** The type of content being reported */
export type ReportTargetType = 'AD' | 'USER' | 'MESSAGE' | 'QUESTION' | 'ANSWER';

/** Why the user is reporting */
export type ReportReason =
  | 'SPAM'
  | 'FRAUD'
  | 'INAPPROPRIATE_CONTENT'
  | 'COUNTERFEIT'
  | 'HARASSMENT'
  | 'COPYRIGHT'
  | 'WRONG_CATEGORY'
  | 'OTHER';

/** Lifecycle status of the report */
export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

/**
 * The action taken to resolve/dismiss a report.
 *
 * Resolve resolutions → resulting status `RESOLVED`:
 *   CONTENT_REMOVED, USER_WARNED, USER_BANNED, OTHER
 *
 * Dismiss resolutions → resulting status `DISMISSED`:
 *   NO_VIOLATION, DUPLICATE
 */
export type ReportResolution =
  | 'CONTENT_REMOVED'
  | 'USER_WARNED'
  | 'USER_BANNED'
  | 'NO_VIOLATION'
  | 'DUPLICATE'
  | 'OTHER';

/** Sort fields accepted by GET /admin/reports */
export type ReportSortField = 'createdAt' | 'updatedAt' | 'siblingCount';

/** Sort direction */
export type SortDirection = 'ASC' | 'DESC';

// ── Target snapshot shapes per report type ──────────────────────────

export interface AdTargetSnapshot {
  title: string;
  description: string;
  price: string;
  currency: string;
  status: string;
  mediaPaths: string[];
  userId: string;
}

export interface UserTargetSnapshot {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
}

export interface QaTargetSnapshot {
  adId: string;
  authorId: string;
  text: string;
  status: string;
}

export interface MessageTargetSnapshot {
  senderId: string;
  text: string;
  conversationId: string;
}

export type TargetSnapshot =
  | AdTargetSnapshot
  | UserTargetSnapshot
  | QaTargetSnapshot
  | MessageTargetSnapshot;

/** Safely extract an Ad snapshot. Returns `null` when shape doesn't match. */
export const asAdSnapshot = (s?: Record<string, unknown> | null): AdTargetSnapshot | null =>
  s && typeof s.title === 'string' && Array.isArray(s.mediaPaths)
    ? (s as unknown as AdTargetSnapshot)
    : null;

/** Safely extract a User snapshot. */
export const asUserSnapshot = (s?: Record<string, unknown> | null): UserTargetSnapshot | null =>
  s && typeof s.username === 'string'
    ? (s as unknown as UserTargetSnapshot)
    : null;

/** Safely extract a Question / Answer snapshot. */
export const asQaSnapshot = (s?: Record<string, unknown> | null): QaTargetSnapshot | null =>
  s && typeof s.text === 'string' && typeof s.adId === 'string'
    ? (s as unknown as QaTargetSnapshot)
    : null;

/** Safely extract a Message snapshot. */
export const asMessageSnapshot = (s?: Record<string, unknown> | null): MessageTargetSnapshot | null =>
  s && typeof s.text === 'string' && typeof s.conversationId === 'string'
    ? (s as unknown as MessageTargetSnapshot)
    : null;

// ── DTOs ────────────────────────────────────────────────────────────

/** Single report in the admin list response */
export interface ReportListItemDto {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  reason: ReportReason;
  status: ReportStatus;
  reporterUsername: string;
  reporterUserId: string;
  assigneeUsername: string | null;
  assigneeUserId: string | null;
  createdAt: number;
  updatedAt: number;
  siblingCount: number;
  description: string;
  /** Optional — returned when backend includes snapshot in list endpoint. */
  targetSnapshot?: Record<string, unknown> | null;
}

/** Full report detail (GET /admin/reports/{reportId}) */
export interface ReportDetailDto extends ReportListItemDto {
  targetSnapshot: Record<string, unknown>;
  resolution: ReportResolution | null;
  resolvedByUsername: string | null;
  resolvedAt: number | null;
  internalNotes: string | null;
  timeline: ReportTimelineEntryDto[];
}

/** Single entry in a report's activity timeline */
export interface ReportTimelineEntryDto {
  id: string;
  action: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'RESOLVED';
  performedByUsername: string;
  detail: string | null;
  createdAt: number;
}

/** Request body for POST /admin/reports/{reportId}/resolve (handles both resolve & dismiss) */
export interface ResolveReportDto {
  resolution: ReportResolution;
  internalNotes?: string;
}

/** Request body for PATCH /admin/reports/{reportId}/assign */
export interface AssignReportDto {
  assigneeUserId: string;
}

/** Request body for POST /admin/reports/{reportId}/notes */
export interface AddReportNoteDto {
  note: string;
}

/** Single entry from GET /reports/reasons */
export interface ReportReasonDto {
  reason: ReportReason;
  supportedTargets: ReportTargetType[];
}

/** Request body for POST /reports (user-facing report submission) */
export interface SubmitReportDto {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
}

/** Query parameters for GET /admin/reports */
export interface ReportListFilterParams {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  reason?: ReportReason;
  assigneeUserId?: string;
  search?: string;
  sort?: ReportSortField;
  direction?: SortDirection;
  page?: number;
  size?: number;
}

/** Query parameters for GET /admin/reports/by-target */
export interface ReportSiblingFilterParams {
  targetType: ReportTargetType;
  targetId: string;
  excludeReportId?: string;
  page?: number;
  size?: number;
}

/** Paginated response for report list */
export interface PageReportListItemDto {
  content: ReportListItemDto[];
  page: PageMetadata;
}

/** Dashboard stats (GET /admin/reports/stats) */
export interface ReportStatsDto {
  open: number;
  inReview: number;
  resolvedToday: number;
  totalUnresolved: number;
}

/** Default filter values */
export const DEFAULT_REPORT_LIST_PARAMS: ReportListFilterParams = {
  page: 0,
  size: 30,
};
