import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import UIkit from 'uikit';
import { Modal, ModalDialog, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalCloseDefault } from '../../../components/uikit/Modal/Modal';
import { Input } from '../../../components/uikit/Form/Form';
import { FormMessage } from '../../../components/Form/Form';
import { Button } from '../../../components/uikit/Button/Button';
import { useUIKit } from '../../../hooks/useUIkit';
import { useMergeRefs } from '../../../hooks/useMergeRefs';
import { adminCategoryService } from '../../services/adminCategoryService';
import type { AdminCategoryTreeDto } from '../../types/admin';

interface CategoryFormModalProps {
  id?: string;
  mode: 'create' | 'edit';
  category?: AdminCategoryTreeDto | null;
  parentCategory?: AdminCategoryTreeDto | null;
  onSuccess: () => void;
}

interface FormValues {
  nameEnUs: string;
  namePlPl: string;
  slugEnUs: string;
  slugPlPl: string;
}

const CategoryFormModal = React.forwardRef<HTMLDivElement, CategoryFormModalProps>(
  ({ id = 'category-form-modal', mode, category, parentCategory, onSuccess }, ref) => {
    const { t } = useTranslation();

    const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
      stack: true,
      container: false,
    });
    const mergedRef = useMergeRefs(modalRef, ref);

    const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors, isValid, isSubmitting },
    } = useForm<FormValues>({
      mode: 'onBlur',
      defaultValues: {
        nameEnUs: '',
        namePlPl: '',
        slugEnUs: '',
        slugPlPl: '',
      },
    });

    // Reset form values whenever mode or category changes
    useEffect(() => {
      if (mode === 'edit' && category) {
        reset({
          nameEnUs: category.name['en-US']?.name || '',
          namePlPl: category.name['pl-PL']?.name || '',
          slugEnUs: category.name['en-US']?.slug || '',
          slugPlPl: category.name['pl-PL']?.slug || '',
        });
      } else {
        reset({ nameEnUs: '', namePlPl: '', slugEnUs: '', slugPlPl: '' });
      }
    }, [mode, category, reset]);

    const onSubmit = async (data: FormValues) => {
      try {
        if (mode === 'create') {
          const name: Record<string, string> = { 'en-US': data.nameEnUs };
          if (data.namePlPl.trim()) name['pl-PL'] = data.namePlPl;

          await adminCategoryService.create({
            name,
            parentId: parentCategory?.id ?? null,
          });
        } else if (mode === 'edit' && category) {
          const name: Record<string, string> = {};
          if (data.nameEnUs.trim()) name['en-US'] = data.nameEnUs;
          if (data.namePlPl.trim()) name['pl-PL'] = data.namePlPl;

          const slug: Record<string, string> = {};
          if (data.slugEnUs.trim()) slug['en-US'] = data.slugEnUs;
          if (data.slugPlPl.trim()) slug['pl-PL'] = data.slugPlPl;

          await adminCategoryService.update(category.id, {
            ...(Object.keys(name).length > 0 && { name }),
            ...(Object.keys(slug).length > 0 && { slug }),
          });
        }

        modalInstance?.hide();
        onSuccess();
      } catch (err: unknown) {
        const errorObj = err as { message?: string; status?: string };
        if (errorObj.status === 'CATEGORY_SLUG_DUPLICATE') {
          setError('slugEnUs', { message: t('admin.categories.slugDuplicate') });
        } else {
          setError('nameEnUs', { message: errorObj.message || t('auth.errors.generic') });
        }
      }
    };

    const parentName = parentCategory
      ? (parentCategory.name['en-US']?.name || parentCategory.name[Object.keys(parentCategory.name)[0]]?.name || '')
      : t('admin.categories.rootLevel');

    return (
      <Modal id={id} ref={mergedRef}>
        <ModalDialog>
          <ModalCloseDefault />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              <ModalTitle>
                {mode === 'create' ? t('admin.categories.form.createTitle') : t('admin.categories.form.editTitle')}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              {/* Parent (read-only) */}
              {mode === 'create' && (
                <div className="uk-margin">
                  <label className="uk-form-label">{t('admin.categories.form.parentLabel')}</label>
                  <div className="uk-form-controls">
                    <Input value={parentName} disabled />
                  </div>
                </div>
              )}

              {/* Name en-US */}
              <div className="uk-margin">
                <label className="uk-form-label">
                  {t('admin.categories.form.nameLabel', { lang: 'en-US' })}
                  <span className="uk-text-danger"> *</span>
                </label>
                <div className="uk-form-controls">
                  <Input
                    {...register('nameEnUs', {
                      required: t('admin.categories.form.nameRequired'),
                      minLength: { value: 2, message: t('admin.categories.form.nameMinLength', { count: 2 }) },
                      maxLength: { value: 100, message: t('admin.categories.form.nameMaxLength', { count: 100 }) },
                    })}
                    placeholder={t('admin.categories.form.namePlaceholder')}
                    status={errors.nameEnUs ? 'danger' : undefined}
                  />
                  {errors.nameEnUs && <FormMessage type="error">{errors.nameEnUs.message}</FormMessage>}
                </div>
              </div>

              {/* Name pl-PL */}
              <div className="uk-margin">
                <label className="uk-form-label">
                  {t('admin.categories.form.nameLabel', { lang: 'pl-PL' })}
                </label>
                <div className="uk-form-controls">
                  <Input
                    {...register('namePlPl', {
                      minLength: { value: 2, message: t('admin.categories.form.nameMinLength', { count: 2 }) },
                      maxLength: { value: 100, message: t('admin.categories.form.nameMaxLength', { count: 100 }) },
                    })}
                    placeholder={t('admin.categories.form.namePlaceholder')}
                    status={errors.namePlPl ? 'danger' : undefined}
                  />
                  {errors.namePlPl && <FormMessage type="error">{errors.namePlPl.message}</FormMessage>}
                </div>
              </div>

              {/* Slugs — edit mode only */}
              {mode === 'edit' && (
                <>
                  <div className="uk-margin">
                    <label className="uk-form-label">
                      {t('admin.categories.form.slugLabel', { lang: 'en-US' })}
                    </label>
                    <div className="uk-form-controls">
                      <Input
                        {...register('slugEnUs')}
                        placeholder={t('admin.categories.form.slugPlaceholder')}
                        status={errors.slugEnUs ? 'danger' : undefined}
                      />
                      {errors.slugEnUs && <FormMessage type="error">{errors.slugEnUs.message}</FormMessage>}
                    </div>
                  </div>

                  <div className="uk-margin">
                    <label className="uk-form-label">
                      {t('admin.categories.form.slugLabel', { lang: 'pl-PL' })}
                    </label>
                    <div className="uk-form-controls">
                      <Input
                        {...register('slugPlPl')}
                        placeholder={t('admin.categories.form.slugPlaceholder')}
                        status={errors.slugPlPl ? 'danger' : undefined}
                      />
                      {errors.slugPlPl && <FormMessage type="error">{errors.slugPlPl.message}</FormMessage>}
                    </div>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter className="uk-text-right">
              <Button
                variant="default"
                className="uk-modal-close uk-margin-small-right"
                type="button"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? t('common.loading') : t('common.save')}
              </Button>
            </ModalFooter>
          </form>
        </ModalDialog>
      </Modal>
    );
  }
);

CategoryFormModal.displayName = 'CategoryFormModal';

export default CategoryFormModal;
