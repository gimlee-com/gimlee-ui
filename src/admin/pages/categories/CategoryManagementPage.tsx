import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import UIkit from 'uikit';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { Button } from '../../../components/uikit/Button/Button';
import { Input } from '../../../components/uikit/Form/Form';
import { Icon } from '../../../components/uikit/Icon/Icon';
import AdminSubNav from '../../components/AdminSubNav';
import CategoryTreeManager from '../../components/CategoryTreeManager/CategoryTreeManager';
import CategoryDetailPanel from '../../components/CategoryDetailPanel/CategoryDetailPanel';
import CategoryFormModal from '../../components/CategoryFormModal/CategoryFormModal';
import CategoryMoveModal from '../../components/CategoryMoveModal/CategoryMoveModal';
import { useCategoryHideFlow } from '../../hooks/useCategoryHideFlow';
import { adminCategoryService } from '../../services/adminCategoryService';
import type { AdminCategoryTreeDto } from '../../types/admin';
import styles from './CategoryManagementPage.module.scss';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';

const CategoryManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  useNavbarMode('focused', '/admin');

  const lang = i18n.language;

  // Tree state
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form modal state
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editCategory, setEditCategory] = useState<AdminCategoryTreeDto | null>(null);
  const [parentCategory, setParentCategory] = useState<AdminCategoryTreeDto | null>(null);
  const formModalRef = useRef<HTMLDivElement>(null);

  // Move modal state
  const [moveCategory, setMoveCategory] = useState<AdminCategoryTreeDto | null>(null);
  const moveModalRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminCategoryTreeDto[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const { toggleHidden } = useCategoryHideFlow(refresh);

  // Search with debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await adminCategoryService.search(searchQuery, lang);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, lang]);

  // Handlers
  const handleCreateRoot = useCallback(() => {
    setFormMode('create');
    setEditCategory(null);
    setParentCategory(null);
    UIkit.modal(formModalRef.current!)?.show();
  }, []);

  const handleAddChild = useCallback((category: AdminCategoryTreeDto) => {
    setFormMode('create');
    setEditCategory(null);
    setParentCategory(category);
    UIkit.modal(formModalRef.current!)?.show();
  }, []);

  const handleEdit = useCallback((category: AdminCategoryTreeDto) => {
    setFormMode('edit');
    setEditCategory(category);
    setParentCategory(null);
    UIkit.modal(formModalRef.current!)?.show();
  }, []);

  const handleDelete = useCallback(async (category: AdminCategoryTreeDto) => {
    const name = category.name[lang]?.name || category.name['en-US']?.name || `#${category.id}`;

    if (category.sourceType === 'GPT') {
      UIkit.notification({
        message: t('admin.categories.cannotDeleteGpt'),
        status: 'warning',
        pos: 'top-right',
        timeout: 5000,
      });
      return;
    }

    if (category.hasChildren) {
      UIkit.notification({
        message: t('admin.categories.cannotDeleteHasChildren'),
        status: 'warning',
        pos: 'top-right',
        timeout: 5000,
      });
      return;
    }

    if (category.popularity > 0) {
      UIkit.notification({
        message: t('admin.categories.cannotDeleteHasAds'),
        status: 'warning',
        pos: 'top-right',
        timeout: 5000,
      });
      return;
    }

    try {
      await UIkit.modal.confirm(
        t('admin.categories.confirmDelete', { name }),
        { stack: true, i18n: { ok: t('common.ok'), cancel: t('common.cancel') } }
      );

      await adminCategoryService.delete(category.id);
      UIkit.notification({
        message: t('admin.categories.deleted'),
        status: 'success',
        pos: 'top-right',
        timeout: 3000,
      });
      if (selectedNodeId === category.id) {
        setSelectedNodeId(null);
      }
      refresh();
    } catch (err: unknown) {
      // UIkit.modal.confirm throws on cancel
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string };
        UIkit.notification({
          message: errorObj.message,
          status: 'danger',
          pos: 'top-right',
          timeout: 5000,
        });
      }
    }
  }, [lang, t, selectedNodeId, refresh]);

  const handleMove = useCallback((category: AdminCategoryTreeDto) => {
    setMoveCategory(category);
    setTimeout(() => {
      UIkit.modal(moveModalRef.current!)?.show();
    }, 0);
  }, []);

  const handleFormSuccess = useCallback(() => {
    const message = formMode === 'create' ? t('admin.categories.created') : t('admin.categories.updated');
    UIkit.notification({
      message,
      status: 'success',
      pos: 'top-right',
      timeout: 3000,
    });
    refresh();
  }, [formMode, t, refresh]);

  const handleMoveSuccess = useCallback(() => {
    UIkit.notification({
      message: t('admin.categories.moved'),
      status: 'success',
      pos: 'top-right',
      timeout: 3000,
    });
    refresh();
  }, [t, refresh]);

  const getName = (cat: AdminCategoryTreeDto) =>
    cat.name[lang]?.name || cat.name['en-US']?.name || `#${cat.id}`;

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">{t('admin.categories.title')}</span>
      </NavbarPortal>
      <AdminSubNav />

      <motion.div
        variants={createPageContainerVariants()}
        initial="hidden"
        animate="visible"
      >
        {/* Toolbar */}
        <motion.div variants={pageItemVariants} className={styles.toolbar}>
          <div className={styles.searchInput}>
            <div className="uk-inline uk-width-1-1">
              <span className="uk-form-icon">
                <Icon icon="search" ratio={0.8} />
              </span>
              <Input
                placeholder={t('admin.categories.searchPlaceholder')}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button variant="primary" size="small" onClick={handleCreateRoot}>
            <Icon icon="plus" ratio={0.8} className="uk-margin-small-right" />
            {t('admin.categories.createRoot')}
          </Button>
          <Button variant="default" size="small" onClick={refresh} title={t('admin.categories.refresh')}>
            <Icon icon="refresh" ratio={0.8} />
          </Button>
        </motion.div>

        {/* Search results */}
        {searchQuery.trim() && (
          <motion.div variants={pageItemVariants} className={styles.searchResults}>
            {searching ? (
              <div className="uk-flex uk-flex-center uk-padding-small">
                <div uk-spinner="ratio: 0.6" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="uk-padding-small uk-text-center uk-text-meta">
                {t('admin.categories.noCategories')}
              </div>
            ) : (
              searchResults.map((cat) => (
                <div
                  key={cat.id}
                  className={styles.searchResultItem}
                  onClick={() => {
                    setSelectedNodeId(cat.id);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedNodeId(cat.id);
                      setSearchQuery('');
                      setSearchResults([]);
                    }
                  }}
                >
                  <div>
                    <div className={styles.searchResultName}>
                      {getName(cat)}
                      {cat.hidden && (
                        <span className="uk-label uk-label-danger uk-margin-small-left" style={{ fontSize: '0.7rem' }}>
                          {t('admin.categories.hidden')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Icon icon="chevron-right" ratio={0.7} />
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Main layout — hidden while searching */}
        {!searchQuery.trim() && (
          <motion.div variants={pageItemVariants} className={styles.pageLayout}>
            <div className={styles.treePanel}>
              <CategoryTreeManager
                selectedNodeId={selectedNodeId}
                onSelect={setSelectedNodeId}
                onEdit={handleEdit}
                onAddChild={handleAddChild}
                onDelete={handleDelete}
                onToggleHidden={toggleHidden}
                onMove={handleMove}
                refreshTrigger={refreshTrigger}
              />
            </div>
          <div className={`${styles.detailPanel} uk-visible@m`}>
            <CategoryDetailPanel
              categoryId={selectedNodeId}
              refreshKey={refreshTrigger}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleHidden={toggleHidden}
              onMove={handleMove}
            />
          </div>
        </motion.div>
        )}
      </motion.div>
      <CategoryFormModal
        ref={formModalRef}
        mode={formMode}
        category={editCategory}
        parentCategory={parentCategory}
        onSuccess={handleFormSuccess}
      />
      <CategoryMoveModal
        ref={moveModalRef}
        category={moveCategory}
        onSuccess={handleMoveSuccess}
      />
    </>
  );
};

export default CategoryManagementPage;
