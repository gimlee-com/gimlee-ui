import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { adminCategoryService } from '../services/adminCategoryService';
import type { AdminCategoryTreeDto, CategoryHideConflictResponseDto } from '../types/admin';

/**
 * Hook implementing the two-phase hide confirmation flow.
 * 
 * Phase 1: PATCH with hidden: true → may return 409 CATEGORY_HAS_ACTIVE_ADS
 * Phase 2: Show confirmation with affected ad count → re-send with acknowledge: true
 */
export function useCategoryHideFlow(onSuccess: () => void) {
  const { t, i18n } = useTranslation();

  const lang = i18n.language;

  const getName = useCallback((category: AdminCategoryTreeDto) =>
    category.name[lang]?.name || category.name['en-US']?.name || `#${category.id}`, [lang]);

  const toggleHidden = useCallback(async (category: AdminCategoryTreeDto) => {
    const newHidden = !category.hidden;

    if (!newHidden) {
      // Un-hiding: no confirmation needed, proceeds immediately
      try {
        await adminCategoryService.update(category.id, { hidden: false });
        UIkit.notification({
          message: t('admin.categories.visibilityChanged'),
          status: 'success',
          pos: 'top-right',
          timeout: 3000,
        });
        onSuccess();
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        UIkit.notification({
          message: errorObj.message || t('auth.errors.generic'),
          status: 'danger',
          pos: 'top-right',
          timeout: 5000,
        });
      }
      return;
    }

    // Phase 1: Attempt to hide (dry run)
    try {
      await adminCategoryService.update(category.id, { hidden: true });
      // No conflict — hidden immediately
      UIkit.notification({
        message: t('admin.categories.visibilityChanged'),
        status: 'success',
        pos: 'top-right',
        timeout: 3000,
      });
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as CategoryHideConflictResponseDto & { message?: string; status?: string };

      if (errorObj.status === 'CATEGORY_HAS_ACTIVE_ADS' && errorObj.data?.affectedAds) {
        // Phase 2: Ask for confirmation
        const count = errorObj.data.affectedAds;
        try {
          await UIkit.modal.confirm(
            `<p>${t('admin.categories.hideWarning', { count })}</p>
             <p class="uk-text-bold">${getName(category)}</p>`,
            { stack: true, i18n: { ok: t('admin.categories.hideConfirm'), cancel: t('common.cancel') } }
          );
          // User confirmed
          try {
            await adminCategoryService.update(category.id, { hidden: true, acknowledge: true });
            UIkit.notification({
              message: t('admin.categories.visibilityChanged'),
              status: 'success',
              pos: 'top-right',
              timeout: 3000,
            });
            onSuccess();
          } catch (confirmErr: unknown) {
            const confirmErrObj = confirmErr as { message?: string };
            UIkit.notification({
              message: confirmErrObj.message || t('auth.errors.generic'),
              status: 'danger',
              pos: 'top-right',
              timeout: 5000,
            });
          }
        } catch (dialogErr) {
          // User cancelled the confirmation — or dialog failed to open
          if (dialogErr instanceof Error) {
            console.error('[useCategoryHideFlow] Dialog error:', dialogErr);
          }
        }
      } else {
        // Other error
        UIkit.notification({
          message: errorObj.message || t('auth.errors.generic'),
          status: 'danger',
          pos: 'top-right',
          timeout: 5000,
        });
      }
    }
  }, [t, getName, onSuccess]);

  return { toggleHidden };
}
