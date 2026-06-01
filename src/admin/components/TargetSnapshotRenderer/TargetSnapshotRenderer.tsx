import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportTargetType } from '../../types/adminReport';
import {
  asAdSnapshot,
  asUserSnapshot,
  asQaSnapshot,
  asMessageSnapshot,
} from '../../types/adminReport';
import styles from './TargetSnapshotRenderer.module.scss';

interface TargetSnapshotRendererProps {
  targetType: ReportTargetType;
  targetSnapshot: Record<string, unknown>;
}

interface FieldItem {
  label: string;
  value: string;
  fullWidth?: boolean;
}

const TargetSnapshotRenderer: React.FC<TargetSnapshotRendererProps> = ({
  targetType,
  targetSnapshot,
}) => {
  const { t } = useTranslation();

  const fieldLabel = (key: string) =>
    t(`admin.reports.detail.snapshotField.${key}`, key);

  const buildFields = (): FieldItem[] | null => {
    switch (targetType) {
      case 'AD': {
        const snap = asAdSnapshot(targetSnapshot);
        if (!snap) return null;
        return [
          { label: fieldLabel('title'), value: snap.title },
          { label: fieldLabel('status'), value: snap.status },
          { label: fieldLabel('price'), value: snap.price },
          { label: fieldLabel('currency'), value: snap.currency },
          { label: fieldLabel('description'), value: snap.description, fullWidth: true },
        ];
      }

      case 'USER': {
        const snap = asUserSnapshot(targetSnapshot);
        if (!snap) return null;
        return [
          { label: fieldLabel('username'), value: snap.username },
          { label: fieldLabel('displayName'), value: snap.displayName || '—' },
          { label: fieldLabel('status'), value: snap.status },
        ];
      }

      case 'QUESTION':
      case 'ANSWER': {
        const snap = asQaSnapshot(targetSnapshot);
        if (!snap) return null;
        return [
          { label: fieldLabel('adId'), value: snap.adId },
          { label: fieldLabel('authorId'), value: snap.authorId },
          { label: fieldLabel('status'), value: snap.status },
          { label: fieldLabel('text'), value: snap.text, fullWidth: true },
        ];
      }

      case 'MESSAGE': {
        const snap = asMessageSnapshot(targetSnapshot);
        if (!snap) return null;
        return [
          { label: fieldLabel('senderId'), value: snap.senderId },
          { label: fieldLabel('conversationId'), value: snap.conversationId },
          { label: fieldLabel('text'), value: snap.text, fullWidth: true },
        ];
      }

      default:
        return null;
    }
  };

  const fields = buildFields();

  if (!fields) {
    return (
      <pre className="uk-overflow-auto" style={{ maxHeight: '400px' }}>
        {JSON.stringify(targetSnapshot, null, 2)}
      </pre>
    );
  }

  return (
    <div className={styles.grid}>
      {fields.map((field) => (
        <div
          key={field.label}
          className={`${styles.item}${field.fullWidth ? ` ${styles.fullWidth}` : ''}`}
        >
          <span className={styles.label}>{field.label}</span>
          <span className={styles.value}>{field.value || '—'}</span>
        </div>
      ))}
    </div>
  );
};

export default TargetSnapshotRenderer;
