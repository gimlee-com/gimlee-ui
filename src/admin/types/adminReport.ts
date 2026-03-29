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
