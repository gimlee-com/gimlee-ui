/**
 * Admin User Management types.
 *
 * ⚠️ Timestamps from the backend are in **epoch microseconds**.
 * Convert to JS milliseconds: `ts / 1000` before passing to `new Date()`.
 */

/** Possible user account statuses */
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BANNED' | 'SUSPENDED';

/** Sort fields accepted by GET /admin/users */
export type AdminUserSortField = 'registeredAt' | 'lastLogin' | 'username';

/** Sort direction */
export type SortDirection = 'ASC' | 'DESC';

/** Query parameters for GET /admin/users */
export interface AdminUserListFilterParams {
  search?: string;
  status?: UserStatus;
  role?: string;
  sort?: AdminUserSortField;
  direction?: SortDirection;
  page: number;
  size: number;
}

/** Default filter values */
export const DEFAULT_USER_LIST_PARAMS: AdminUserListFilterParams = {
  page: 0,
  size: 30,
};

/** Single user in the admin list response */
export interface AdminUserListItemDto {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  status: UserStatus;
  roles: string[];
  registeredAt: number;
  lastLogin: number | null;
  avatarUrl: string | null;
  activeAdsCount?: number;
}

/** Paginated response for user list */
export interface PageAdminUserListItemDto {
  content: AdminUserListItemDto[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/** User statistics shown on detail page */
export interface AdminUserStatsDto {
  activeAdsCount: number;
  totalAdsCount: number;
  purchasesAsBuyer: number;
  completedPurchasesAsBuyer: number;
  purchasesAsSeller: number;
  completedPurchasesAsSeller: number;
}

/** Ban audit record */
export interface AdminBanDto {
  id: string;
  reason: string;
  bannedByUsername: string;
  bannedAt: number;
  bannedUntil: number | null;
  unbannedByUsername: string | null;
  unbannedAt: number | null;
  active: boolean;
}

/** Full user detail response (GET /admin/users/{userId}) */
export interface AdminUserDetailDto {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  roles: string[];
  registeredAt: number;
  lastLogin: number | null;
  avatarUrl: string | null;
  language: string | null;
  preferredCurrency: string | null;
  lastSeenAt: number | null;
  presenceStatus: string | null;
  stats: AdminUserStatsDto;
  activeBan: AdminBanDto | null;
}

/** Request body for POST /admin/users/{userId}/ban */
export interface BanUserRequestDto {
  reason: string;
  bannedUntil?: number | null;
}

/** Validation constraints for ban reason (aligned with backend) */
export const BAN_REASON_MIN_LENGTH = 5;
export const BAN_REASON_MAX_LENGTH = 2000;
