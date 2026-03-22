import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Button } from '../../../components/uikit/Button/Button';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { adminCategoryService } from '../../services/adminCategoryService';
import type { AdminCategoryDetailDto, AdminCategoryTreeDto } from '../../types/admin';
import styles from './CategoryDetailPanel.module.scss';

interface CategoryDetailPanelProps {
  categoryId: number | null;
  refreshKey?: number;
  onEdit: (category: AdminCategoryTreeDto) => void;
  onDelete: (category: AdminCategoryTreeDto) => void;
  onToggleHidden: (category: AdminCategoryTreeDto) => void;
  onMove: (category: AdminCategoryTreeDto) => void;
}

const CategoryDetailPanel: React.FC<CategoryDetailPanelProps> = ({
  categoryId,
  refreshKey,
  onEdit,
  onDelete,
  onToggleHidden,
  onMove,
}) => {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<AdminCategoryDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminCategoryService.getDetail(id);
      setDetail(res.data);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch detail when categoryId or refreshKey changes
  useEffect(() => {
    if (categoryId) {
      fetchDetail(categoryId);
    } else {
      setDetail(null);
    }
  }, [categoryId, refreshKey, fetchDetail]);

  if (!categoryId) {
    return (
      <div className={styles.emptyState}>
        <Icon icon="folder" ratio={3} />
        <p className="uk-text-meta uk-margin-small-top">{t('admin.categories.detail.noSelection')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.emptyState}>
        <Spinner ratio={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="uk-padding-small">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!detail) return null;

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts / 1000);
    return date.toLocaleString();
  };

  const languages = Object.keys(detail.name);

  return (
    <motion.div
      key={detail.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className={styles.panel}
    >
      <div className={styles.header}>
        <h3 className="uk-h4 uk-margin-remove">
          {detail.name[Object.keys(detail.name)[0]]?.name || `Category #${detail.id}`}
        </h3>
        <div className={styles.headerBadges}>
          <span className={`uk-label ${detail.sourceType === 'GPT' ? '' : 'uk-label-warning'}`}>
            {detail.sourceType === 'GPT' ? t('admin.categories.sourceGpt') : t('admin.categories.sourceGml')}
          </span>
          {detail.hidden && (
            <span className="uk-label uk-label-danger">{t('admin.categories.hidden')}</span>
          )}
          {detail.deprecated && (
            <span className="uk-label">{t('admin.categories.deprecated')}</span>
          )}
          {detail.adminOverride && (
            <span className="uk-label uk-label-success">{t('admin.categories.adminOverride')}</span>
          )}
        </div>
      </div>

      {/* Breadcrumb path */}
      {detail.path && detail.path.length > 0 && (
        <div className="uk-margin-small">
          <label className="uk-form-label uk-text-meta">{t('admin.categories.detail.path')}</label>
          <ul className="uk-breadcrumb uk-margin-remove">
            {detail.path.map((p, i) => (
              <li key={p.id} className={i === detail.path.length - 1 ? 'uk-active' : ''}>
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Translations table */}
      <div className="uk-margin">
        <label className="uk-form-label">{t('admin.categories.detail.translations')}</label>
        <div className="uk-overflow-auto">
          <table className="uk-table uk-table-small uk-table-divider uk-table-striped">
            <thead>
              <tr>
                <th>{t('admin.categories.detail.language')}</th>
                <th>{t('admin.categories.name')}</th>
                <th>{t('admin.categories.slug')}</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr key={lang}>
                  <td><code>{lang}</code></td>
                  <td>{detail.name[lang].name}</td>
                  <td className="uk-text-meta">{detail.name[lang].slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="uk-margin">
        <label className="uk-form-label">{t('admin.categories.detail.metadata')}</label>
        <dl className={styles.metadataGrid}>
          <dt>{t('admin.categories.sourceType')}</dt>
          <dd>{detail.sourceType}</dd>

          {detail.sourceId && (
            <>
              <dt>{t('admin.categories.detail.sourceId')}</dt>
              <dd><code>{detail.sourceId}</code></dd>
            </>
          )}

          <dt>{t('admin.categories.childCount')}</dt>
          <dd>{detail.childCount}</dd>

          <dt>{t('admin.categories.popularity')}</dt>
          <dd>{detail.popularity}</dd>

          <dt>{t('admin.categories.displayOrder')}</dt>
          <dd>{detail.displayOrder}</dd>

          <dt>{t('admin.categories.hidden')}</dt>
          <dd>{detail.hidden ? '✓' : '—'}</dd>

          <dt>{t('admin.categories.deprecated')}</dt>
          <dd>{detail.deprecated ? '✓' : '—'}</dd>

          <dt>{t('admin.categories.adminOverride')}</dt>
          <dd>{detail.adminOverride ? '✓' : '—'}</dd>

          <dt>{t('admin.categories.detail.createdAt')}</dt>
          <dd>{formatTimestamp(detail.createdAt)}</dd>

          <dt>{t('admin.categories.detail.updatedAt')}</dt>
          <dd>{formatTimestamp(detail.updatedAt)}</dd>
        </dl>
      </div>

      {/* Actions */}
      <div className="uk-margin">
        <label className="uk-form-label">{t('admin.categories.detail.actions')}</label>
        <div className={styles.actionButtons}>
          <Button
            variant="default"
            size="small"
            onClick={() => onEdit(detail)}
          >
            <Icon icon="pencil" ratio={0.8} className="uk-margin-small-right" />
            {t('admin.categories.edit')}
          </Button>
          <Button
            variant="default"
            size="small"
            onClick={() => onToggleHidden(detail)}
          >
            <Icon icon={detail.hidden ? 'unlock' : 'lock'} ratio={0.8} className="uk-margin-small-right" />
            {detail.hidden ? t('admin.categories.show') : t('admin.categories.hide')}
          </Button>
          <Button
            variant="default"
            size="small"
            onClick={() => onMove(detail)}
          >
            <Icon icon="move" ratio={0.8} className="uk-margin-small-right" />
            {t('admin.categories.move')}
          </Button>
          {detail.sourceType === 'GML' && (
            <Button
              variant="danger"
              size="small"
              onClick={() => onDelete(detail)}
              disabled={detail.hasChildren || detail.popularity > 0}
            >
              <Icon icon="trash" ratio={0.8} className="uk-margin-small-right" />
              {t('admin.categories.delete')}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryDetailPanel;
