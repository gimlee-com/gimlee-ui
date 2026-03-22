import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { adminCategoryService } from '../../services/adminCategoryService';
import type { AdminCategoryTreeDto } from '../../types/admin';
import CategoryNodeRow from '../CategoryNodeRow/CategoryNodeRow';
import styles from './CategoryTreeManager.module.scss';

interface CategoryTreeManagerProps {
  selectedNodeId: number | null;
  onSelect: (id: number) => void;
  onEdit: (category: AdminCategoryTreeDto) => void;
  onAddChild: (category: AdminCategoryTreeDto) => void;
  onDelete: (category: AdminCategoryTreeDto) => void;
  onToggleHidden: (category: AdminCategoryTreeDto) => void;
  onMove: (category: AdminCategoryTreeDto) => void;
  refreshTrigger: number;
}

const CategoryTreeManager: React.FC<CategoryTreeManagerProps> = ({
  selectedNodeId,
  onSelect,
  onEdit,
  onAddChild,
  onDelete,
  onToggleHidden,
  onMove,
  refreshTrigger,
}) => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState<AdminCategoryTreeDto[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [loadingNodes, setLoadingNodes] = useState<Set<number>>(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const childrenCache = useRef<Map<number, AdminCategoryTreeDto[]>>(new Map());

  const fetchRoots = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const roots = await adminCategoryService.getRoots();
      setTreeData(roots);
      childrenCache.current.clear();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || t('auth.errors.generic'));
    } finally {
      setInitialLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRoots();
  }, [fetchRoots, refreshTrigger]);

  const handleToggle = useCallback(async (id: number) => {
    if (expandedNodes.has(id)) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    // Check cache first
    const cached = childrenCache.current.get(id);
    if (cached) {
      setExpandedNodes(prev => new Set(prev).add(id));
      return;
    }

    setLoadingNodes(prev => new Set(prev).add(id));
    try {
      const children = await adminCategoryService.getChildren(id);
      childrenCache.current.set(id, children);
      setExpandedNodes(prev => new Set(prev).add(id));
    } catch (err) {
      console.error('Failed to fetch children', err);
    } finally {
      setLoadingNodes(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [expandedNodes]);

  const findNode = useCallback((nodes: AdminCategoryTreeDto[], id: number): AdminCategoryTreeDto | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const cached = childrenCache.current.get(node.id);
      if (cached) {
        const found = findNode(cached, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const updateChildren = (nodes: AdminCategoryTreeDto[], parentId: number, newChildren: AdminCategoryTreeDto[]): AdminCategoryTreeDto[] => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return { ...node, children: newChildren };
      }
      return node;
    });
  };

  const handleReorder = useCallback(async (id: number, direction: 'UP' | 'DOWN') => {
    try {
      await adminCategoryService.reorder(id, { direction });
      const node = findNode(treeData, id);
      if (node?.parentId) {
        const children = await adminCategoryService.getChildren(node.parentId);
        childrenCache.current.set(node.parentId, children);
        setTreeData(prev => updateChildren(prev, node.parentId!, children));
      } else {
        const roots = await adminCategoryService.getRoots();
        setTreeData(roots);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: string };
      if (errorObj.status !== 'CATEGORY_ALREADY_AT_BOUNDARY') {
        console.error('Failed to reorder', err);
      }
    }
  }, [treeData, findNode]);

  const renderNodes = (nodes: AdminCategoryTreeDto[], depth: number) => {
    return nodes.map((node, index) => {
      const children = childrenCache.current.get(node.id);
      const isExpanded = expandedNodes.has(node.id);

      return (
        <div key={node.id} role="group">
          <CategoryNodeRow
            category={node}
            depth={depth}
            isExpanded={isExpanded}
            isSelected={selectedNodeId === node.id}
            isFirst={index === 0}
            isLast={index === nodes.length - 1}
            isLoading={loadingNodes.has(node.id)}
            onToggle={handleToggle}
            onSelect={onSelect}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onDelete={onDelete}
            onToggleHidden={onToggleHidden}
            onMove={onMove}
            onReorder={handleReorder}
          />
          <AnimatePresence>
            {isExpanded && children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                style={{ overflow: 'hidden' }}
              >
                {renderNodes(children, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  if (initialLoading) {
    return (
      <div className={styles.loading}>
        <Spinner ratio={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p className="uk-text-danger">{error}</p>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="uk-text-meta">{t('admin.categories.noCategories')}</p>
      </div>
    );
  }

  return (
    <div className={styles.tree} role="tree">
      {renderNodes(treeData, 0)}
    </div>
  );
};

export default CategoryTreeManager;
