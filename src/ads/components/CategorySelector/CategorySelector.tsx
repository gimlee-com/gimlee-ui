import { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { spring } from '../../../animations';
import { Modal, ModalDialog, ModalHeader, ModalBody, ModalTitle, ModalCloseDefault } from '../../../components/uikit/Modal/Modal';
import { Input } from '../../../components/uikit/Form/Form';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { categoryService } from '../../services/categoryService';
import { useUIKit } from '../../../hooks/useUIkit';
import { useMergeRefs } from '../../../hooks/useMergeRefs';
import type { CategoryTreeDto, CategorySuggestionDto, CategoryPathElementDto } from '../../../types/api';
import styles from './CategorySelector.module.scss';

interface CategorySelectorProps {
  id?: string;
  onSelect: (id: number, path: CategoryPathElementDto[]) => void;
  allowParentSelection?: boolean;
}

export const CategorySelector = forwardRef<HTMLDivElement, CategorySelectorProps>(({ id = 'category-selector', onSelect, allowParentSelection = false }, ref) => {
  const { t } = useTranslation();
  const [columns, setColumns] = useState<CategoryTreeDto[][]>([]);
  const [selectedPath, setSelectedPath] = useState<CategoryTreeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CategorySuggestionDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960); // UIKit medium breakpoint is 960px

  const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
    stack: true,
    container: false
  });
  const mergedRef = useMergeRefs(modalRef, ref);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchRoots = useCallback(async () => {
    setLoading(true);
    try {
      const roots = await categoryService.getRootCategories();
      setColumns([roots]);
    } catch (err) {
      console.error('Failed to fetch root categories', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSelectedPath([]);
    setSearchQuery('');
    setSuggestions([]);
    setColumns(prev => (prev.length > 0 ? [prev[0]] : []));
  }, []);

  useEffect(() => {
    if (columns.length === 0 && !loading) {
      fetchRoots();
    }
  }, [columns.length, loading, fetchRoots]);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement && modalInstance) {
      UIkit.util.on(modalElement, 'beforeshow', reset);
      return () => {
        UIkit.util.off(modalElement, 'beforeshow', reset);
      };
    }
  }, [modalInstance, reset, modalRef]);

  const handleCategoryClick = async (category: CategoryTreeDto, columnIndex: number) => {
    const newPath = [...selectedPath.slice(0, columnIndex), category];
    setSelectedPath(newPath);

    if (category.hasChildren) {
      setLoading(true);
      try {
        const children = await categoryService.getCategoryChildren(category.id);
        setColumns([...columns.slice(0, columnIndex + 1), children]);
      } catch (err) {
        console.error('Failed to fetch children', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Leaf node
      setColumns(columns.slice(0, columnIndex + 1));
      confirmSelection(category.id, newPath.map(c => ({ id: c.id, name: c.name })));
    }
  };

  const handleBackClick = () => {
    if (selectedPath.length > 0) {
      const newPath = selectedPath.slice(0, -1);
      setSelectedPath(newPath);
      setColumns(columns.slice(0, -1));
    }
  };

  const confirmSelection = (id: number, path: CategoryPathElementDto[]) => {
    onSelect(id, path);
    if (modalInstance) {
      modalInstance.hide();
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.length > 2) {
      setSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await categoryService.getSuggestions(val);
          setSuggestions(res);
        } catch (err) {
          console.error('Search failed', err);
        } finally {
          setSearching(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: CategorySuggestionDto) => {
    confirmSelection(suggestion.id, suggestion.path);
    setSearchQuery('');
    setSuggestions([]);
  };


  return (
    <Modal id={id} ref={mergedRef} stack className={styles.categoryModal}>
      <ModalDialog className={`${styles.categoryDialog} uk-width-auto@xl`}>
        <ModalCloseDefault />
        <ModalHeader>
          <ModalTitle>{t('ads.selectCategory')}</ModalTitle>
          <div className="uk-margin-small-top uk-inline uk-width-1-1">
            <span className="uk-form-icon" uk-icon="icon: search"></span>
            <Input
              type="text"
              placeholder={t('ads.categorySearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="uk-width-1-1"
            />
            {searching && (
              <div className="uk-form-icon uk-form-icon-flip">
                <Spinner ratio={0.5} />
              </div>
            )}
            
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.searchSuggestions}
                >
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(s)}
                    >
                      <div className={styles.displayPath}>{s.displayPath}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ModalHeader>
        <ModalBody className={styles.categoryBody}>
          {loading && columns.length === 0 ? (
            <div className="uk-text-center uk-padding-large">
              <Spinner ratio={1.5} />
            </div>
          ) : isMobile ? (
            <div className={styles.mobileDrillDown}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={selectedPath.length}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={spring}
                  className={styles.mobileList}
                >
                  {selectedPath.length > 0 && (
                    <div className="uk-padding-small uk-background-muted uk-flex uk-flex-middle" onClick={handleBackClick} style={{ cursor: 'pointer' }}>
                      <span uk-icon="chevron-left" className="uk-margin-small-right"></span>
                      <span className="uk-text-bold">{selectedPath[selectedPath.length - 1].name}</span>
                    </div>
                  )}
                  <ul className="uk-nav uk-nav-default">
                    {allowParentSelection && selectedPath.length > 0 && (
                      <li 
                        className={`${styles.mobileItem} ${styles.allInItem}`} 
                        onClick={() => confirmSelection(
                          selectedPath[selectedPath.length - 1].id, 
                          selectedPath.map(c => ({ id: c.id, name: c.name }))
                        )}
                      >
                        <span className="uk-text-primary">
                          {t('ads.allIn', { category: selectedPath[selectedPath.length - 1].name })}
                        </span>
                      </li>
                    )}
                    {(columns[selectedPath.length] || []).map((cat) => (
                      <li key={cat.id} className={styles.mobileItem} onClick={() => handleCategoryClick(cat, selectedPath.length)}>
                        <span>{cat.name}</span>
                        {cat.hasChildren && <span uk-icon="chevron-right"></span>}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className={styles.millerColumns}>
              {columns.map((column, idx) => (
                <motion.div
                  key={idx}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  transition={spring}
                  className={styles.column}
                >
                  {allowParentSelection && idx > 0 && (
                    <div 
                      className={`${styles.columnItem} ${styles.allInItem}`}
                      onClick={() => confirmSelection(
                        selectedPath[idx - 1].id, 
                        selectedPath.slice(0, idx).map(c => ({ id: c.id, name: c.name }))
                      )}
                    >
                      <span className="uk-text-primary">
                        {t('ads.allIn', { category: selectedPath[idx - 1].name })}
                      </span>
                    </div>
                  )}
                  {column.map((cat) => (
                    <div
                      key={cat.id}
                      className={`${styles.columnItem} ${selectedPath[idx]?.id === cat.id ? styles.active : ''}`}
                      onClick={() => handleCategoryClick(cat, idx)}
                    >
                      <span>{cat.name}</span>
                      {cat.hasChildren && <span uk-icon="chevron-right"></span>}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          )}
        </ModalBody>
      </ModalDialog>
    </Modal>
  );
})
