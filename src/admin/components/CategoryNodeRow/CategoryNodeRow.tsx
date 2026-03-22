import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../components/uikit/Icon/Icon';
import type { AdminCategoryTreeDto } from '../types/admin';
import styles from './CategoryNodeRow.module.scss';

interface CategoryNodeRowProps {
  category: AdminCategoryTreeDto;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
  onEdit: (category: AdminCategoryTreeDto) => void;
  onAddChild: (category: AdminCategoryTreeDto) => void;
  onDelete: (category: AdminCategoryTreeDto) => void;
  onToggleHidden: (category: AdminCategoryTreeDto) => void;
  onMove: (category: AdminCategoryTreeDto) => void;
  onReorder: (id: number, direction: 'UP' | 'DOWN') => void;
}

const CategoryNodeRow: React.FC<CategoryNodeRowProps> = ({
  category,
  depth,
  isExpanded,
  isSelected,
  isFirst,
  isLast,
  isLoading,
  onToggle,
  onSelect,
  onEdit,
  onAddChild,
  onDelete,
  onToggleHidden,
  onMove,
  onReorder,
}) => {
  const { t, i18n } = useTranslation();

  const lang = i18n.language;
  const nameEntry = category.name[lang] || category.name['en-US'];
  const displayName = nameEntry?.name || `Category #${category.id}`;
  const displaySlug = nameEntry?.slug || '';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (category.hasChildren) {
      onToggle(category.id);
    }
  };

  const handleSelect = () => {
    onSelect(category.id);
  };

  return (
    <div
      className={`${styles.nodeRow} ${isSelected ? styles.selected : ''} ${category.hidden ? styles.hidden : ''}`}
      style={{ paddingLeft: `${depth * 24 + 8}px` }}
      onClick={handleSelect}
      role="treeitem"
      aria-expanded={category.hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSelect();
        if (e.key === ' ' && category.hasChildren) {
          e.preventDefault();
          onToggle(category.id);
        }
      }}
    >
      <div className={styles.mainContent}>
        <button
          className={`${styles.expandToggle} uk-icon-button uk-icon-button-xsmall`}
          onClick={handleToggle}
          disabled={!category.hasChildren}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          type="button"
        >
          {category.hasChildren && (
            isLoading ? (
              <div uk-spinner="ratio: 0.4" />
            ) : (
              <Icon icon={isExpanded ? 'chevron-down' : 'chevron-right'} ratio={0.7} />
            )
          )}
        </button>

        <div className={styles.nameSection}>
          <span className={`${styles.name} ${category.hasChildren ? 'uk-text-bold' : ''}`}>
            {displayName}
          </span>
          <span className={`${styles.slug} uk-text-meta`}>
            /{displaySlug}
          </span>
        </div>

        <div className={styles.badges}>
          {category.childCount > 0 && (
            <span className="uk-badge">{category.childCount}</span>
          )}
          {category.popularity > 0 && (
            <span className={`uk-label uk-label-success ${styles.label}`}>
              {category.popularity} {t('admin.categories.popularity').toLowerCase()}
            </span>
          )}
          <span className={`uk-label ${category.sourceType === 'GPT' ? '' : 'uk-label-warning'} ${styles.label}`}>
            {category.sourceType === 'GPT' ? t('admin.categories.sourceGpt') : t('admin.categories.sourceGml')}
          </span>
          {category.hidden && (
            <span className={`uk-label uk-label-danger ${styles.label}`}>
              {t('admin.categories.hidden')}
            </span>
          )}
        </div>

        <div className={`${styles.actions} uk-visible@m`}>
          <button
            className="uk-icon-button uk-icon-button-xsmall"
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            title={t('admin.categories.edit')}
            type="button"
          >
            <Icon icon="pencil" ratio={0.7} />
          </button>
          <button
            className="uk-icon-button uk-icon-button-xsmall"
            onClick={(e) => { e.stopPropagation(); onAddChild(category); }}
            title={t('admin.categories.addChild')}
            type="button"
          >
            <Icon icon="plus" ratio={0.7} />
          </button>
          <button
            className="uk-icon-button uk-icon-button-xsmall"
            onClick={(e) => { e.stopPropagation(); onToggleHidden(category); }}
            title={category.hidden ? t('admin.categories.show') : t('admin.categories.hide')}
            type="button"
          >
            <Icon icon={category.hidden ? 'unlock' : 'lock'} ratio={0.7} />
          </button>
          <button
            className="uk-icon-button uk-icon-button-xsmall"
            onClick={(e) => { e.stopPropagation(); onMove(category); }}
            title={t('admin.categories.move')}
            type="button"
          >
            <Icon icon="move" ratio={0.7} />
          </button>
          <button
            className="uk-icon-button uk-icon-button-xsmall"
            onClick={(e) => { e.stopPropagation(); onReorder(category.id, 'UP'); }}
            title={t('admin.categories.moveUp')}
            disabled={isFirst}
            type="button"
          >
            <Icon icon="chevron-up" ratio={0.7} />
          </button>
          <button
            className="uk-icon-button uk-icon-button-xsmall"
            onClick={(e) => { e.stopPropagation(); onReorder(category.id, 'DOWN'); }}
            title={t('admin.categories.moveDown')}
            disabled={isLast}
            type="button"
          >
            <Icon icon="chevron-down" ratio={0.7} />
          </button>
          {category.sourceType === 'GML' && (
            <button
              className="uk-icon-button uk-icon-button-xsmall"
              onClick={(e) => { e.stopPropagation(); onDelete(category); }}
              title={t('admin.categories.delete')}
              disabled={category.hasChildren || category.popularity > 0}
              type="button"
            >
              <Icon icon="trash" ratio={0.7} />
            </button>
          )}
        </div>

        {/* Mobile: overflow dropdown */}
        <div className="uk-hidden@m">
          <button className="uk-icon-button uk-icon-button-xsmall" type="button">
            <Icon icon="more-vertical" ratio={0.7} />
          </button>
          <div uk-dropdown="mode: click; pos: bottom-right">
            <ul className="uk-nav uk-dropdown-nav">
              <li><a onClick={(e) => { e.preventDefault(); onEdit(category); }}>{t('admin.categories.edit')}</a></li>
              <li><a onClick={(e) => { e.preventDefault(); onAddChild(category); }}>{t('admin.categories.addChild')}</a></li>
              <li><a onClick={(e) => { e.preventDefault(); onToggleHidden(category); }}>{category.hidden ? t('admin.categories.show') : t('admin.categories.hide')}</a></li>
              <li><a onClick={(e) => { e.preventDefault(); onMove(category); }}>{t('admin.categories.move')}</a></li>
              <li className="uk-nav-divider"></li>
              <li><a onClick={(e) => { e.preventDefault(); onReorder(category.id, 'UP'); }} className={isFirst ? 'uk-disabled' : ''}>{t('admin.categories.moveUp')}</a></li>
              <li><a onClick={(e) => { e.preventDefault(); onReorder(category.id, 'DOWN'); }} className={isLast ? 'uk-disabled' : ''}>{t('admin.categories.moveDown')}</a></li>
              {category.sourceType === 'GML' && (
                <>
                  <li className="uk-nav-divider"></li>
                  <li><a onClick={(e) => { e.preventDefault(); onDelete(category); }} className={category.hasChildren || category.popularity > 0 ? 'uk-disabled' : ''}>{t('admin.categories.delete')}</a></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNodeRow;
