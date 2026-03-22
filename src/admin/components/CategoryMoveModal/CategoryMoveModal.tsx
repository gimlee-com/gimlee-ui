import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { Modal, ModalDialog, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalCloseDefault } from '../../../components/uikit/Modal/Modal';
import { Button } from '../../../components/uikit/Button/Button';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { useUIKit } from '../../../hooks/useUIkit';
import { useMergeRefs } from '../../../hooks/useMergeRefs';
import { adminCategoryService } from '../../services/adminCategoryService';
import type { AdminCategoryTreeDto } from '../../types/admin';
import styles from './CategoryMoveModal.module.scss';

interface CategoryMoveModalProps {
  id?: string;
  category: AdminCategoryTreeDto | null;
  onSuccess: () => void;
}

const CategoryMoveModal = React.forwardRef<HTMLDivElement, CategoryMoveModalProps>(
  ({ id = 'category-move-modal', category, onSuccess }, ref) => {
    const { t, i18n } = useTranslation();
    const [columns, setColumns] = useState<AdminCategoryTreeDto[][]>([]);
    const [selectedPath, setSelectedPath] = useState<AdminCategoryTreeDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
      stack: true,
      container: false,
    });
    const mergedRef = useMergeRefs(modalRef, ref);

    const lang = i18n.language;

    const getName = (cat: AdminCategoryTreeDto) =>
      cat.name[lang]?.name || cat.name['en-US']?.name || `#${cat.id}`;

    const isDisabledNode = useCallback((nodeId: number): boolean => {
      if (!category) return false;
      if (nodeId === category.id) return true;
      // We can't fully check descendants client-side without loading all children,
      // so we rely on the backend's CATEGORY_CIRCULAR_PARENT validation
      return false;
    }, [category]);

    const fetchRoots = useCallback(async () => {
      setLoading(true);
      try {
        const roots = await adminCategoryService.getRoots(1);
        setColumns([roots]);
      } catch (err) {
        console.error('Failed to fetch roots', err);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      const el = modalRef.current;
      if (!el || !modalInstance) return;

      const handleShow = () => {
        setSelectedPath([]);
        setError(null);
        fetchRoots();
      };

      UIkit.util.on(el, 'beforeshow', handleShow);
      return () => { UIkit.util.off(el, 'beforeshow', handleShow); };
    }, [modalInstance, modalRef, fetchRoots]);

    const handleCategoryClick = async (cat: AdminCategoryTreeDto, columnIndex: number) => {
      if (isDisabledNode(cat.id)) return;

      const newPath = [...selectedPath.slice(0, columnIndex), cat];
      setSelectedPath(newPath);

      if (cat.hasChildren) {
        setLoading(true);
        try {
          const children = await adminCategoryService.getChildren(cat.id);
          setColumns([...columns.slice(0, columnIndex + 1), children]);
        } catch (err) {
          console.error('Failed to fetch children', err);
        } finally {
          setLoading(false);
        }
      } else {
        setColumns(columns.slice(0, columnIndex + 1));
      }
    };

    const handleConfirm = async (newParentId: number | null) => {
      if (!category) return;
      setSubmitting(true);
      setError(null);

      try {
        await adminCategoryService.move(category.id, { newParentId });
        modalInstance?.hide();
        onSuccess();
      } catch (err: unknown) {
        const errorObj = err as { message?: string; status?: string };
        if (errorObj.status === 'CATEGORY_CIRCULAR_PARENT') {
          setError(t('admin.categories.circularParent'));
        } else {
          setError(errorObj.message || t('auth.errors.generic'));
        }
      } finally {
        setSubmitting(false);
      }
    };

    const selectedTarget = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;

    return (
      <Modal id={id} ref={mergedRef}>
        <ModalDialog className="uk-width-xlarge@l">
          <ModalCloseDefault />
          <ModalHeader>
            <ModalTitle>{t('admin.categories.form.moveTitle')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {category && (
              <p className="uk-text-meta uk-margin-small-bottom">
                {t('admin.categories.move')}: <strong>{getName(category)}</strong>
              </p>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Move to root option */}
            <div className="uk-margin-small">
              <Button
                variant="default"
                size="small"
                onClick={() => handleConfirm(null)}
                disabled={submitting || (category?.parentId === null)}
              >
                <Icon icon="home" ratio={0.8} className="uk-margin-small-right" />
                {t('admin.categories.moveToRoot')}
              </Button>
            </div>

            {/* Miller Column navigation */}
            <div className={styles.columnsContainer}>
              {columns.map((column, colIndex) => (
                <div key={colIndex} className={styles.column}>
                  {column.map((cat) => {
                    const isSelected = selectedPath[colIndex]?.id === cat.id;
                    const isDisabled = isDisabledNode(cat.id);

                    return (
                      <div
                        key={cat.id}
                        className={`${styles.columnItem} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''} ${cat.hidden ? styles.hidden : ''}`}
                        onClick={() => handleCategoryClick(cat, colIndex)}
                        role="button"
                        tabIndex={isDisabled ? -1 : 0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCategoryClick(cat, colIndex); }}
                      >
                        <span className={styles.itemName}>{getName(cat)}</span>
                        {cat.hasChildren && <Icon icon="chevron-right" ratio={0.6} />}
                      </div>
                    );
                  })}
                </div>
              ))}
              {loading && (
                <div className={styles.column}>
                  <div className={styles.columnLoading}>
                    <Spinner ratio={0.8} />
                  </div>
                </div>
              )}
            </div>
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
              onClick={() => selectedTarget && handleConfirm(selectedTarget.id)}
              disabled={!selectedTarget || submitting || isDisabledNode(selectedTarget.id)}
            >
              {submitting ? t('common.loading') : t('admin.categories.move')}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    );
  }
);

CategoryMoveModal.displayName = 'CategoryMoveModal';

export default CategoryMoveModal;
