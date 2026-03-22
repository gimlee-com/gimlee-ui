import type { CategoryPathElementDto } from '../../types/api';

/** Per-language name and slug pair returned by the admin API */
export interface AdminCategoryNameEntry {
  name: string;
  slug: string;
}

/** Map of IETF lang tag → name/slug pair */
export type AdminCategoryNameMap = Record<string, AdminCategoryNameEntry>;

/** Tree node returned by list/children/search endpoints */
export interface AdminCategoryTreeDto {
  id: number;
  name: AdminCategoryNameMap;
  hasChildren: boolean;
  childCount: number;
  parentId: number | null;
  displayOrder: number;
  hidden: boolean;
  sourceType: 'GPT' | 'GML';
  popularity: number;
  createdAt: number;
  updatedAt: number;
  children?: AdminCategoryTreeDto[];
}

/** Detailed single-category response (GET /admin/categories/{id}) */
export interface AdminCategoryDetailDto extends AdminCategoryTreeDto {
  sourceId: string | null;
  adminOverride: boolean;
  deprecated: boolean;
  path: CategoryPathElementDto[];
}

/** Create category request body */
export interface CreateAdminCategoryDto {
  name: Record<string, string>;
  parentId?: number | null;
}

/** Update category request body — all fields optional */
export interface UpdateAdminCategoryDto {
  name?: Record<string, string>;
  slug?: Record<string, string>;
  hidden?: boolean;
  acknowledge?: boolean;
}

/** Reorder request body */
export interface ReorderAdminCategoryDto {
  direction: 'UP' | 'DOWN';
}

/** Move request body */
export interface MoveAdminCategoryDto {
  newParentId: number | null;
}

/** Extended StatusResponseDto for hide-with-active-ads scenario */
export interface CategoryHideConflictResponseDto {
  success: false;
  status: 'CATEGORY_HAS_ACTIVE_ADS';
  message: string;
  data: { affectedAds: number };
}
