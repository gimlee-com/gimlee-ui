import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Image } from '../../../components/Image/Image';
import { Avatar } from '../../../components/Avatar/Avatar';
import type { ReportTargetType } from '../../types/adminReport';
import {
  asAdSnapshot,
  asUserSnapshot,
  asQaSnapshot,
  asMessageSnapshot,
} from '../../types/adminReport';
import styles from './ReportedContentCard.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ReportedContentCardProps {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  targetSnapshot?: Record<string, unknown> | null;
}

const ReportedContentCard: React.FC<ReportedContentCardProps> = ({
  targetType,
  targetId,
  targetTitle,
  targetSnapshot,
}) => {
  const { t } = useTranslation();

  switch (targetType) {
    case 'AD': {
      const snap = asAdSnapshot(targetSnapshot);
      if (!snap) return <div className={styles.fallbackTitle}>{targetTitle}</div>;

      const firstPath = snap.mediaPaths?.[0];
      const thumbUrl = firstPath
        ? `${API_URL}/api/media?p=/thumbs-sm${firstPath}`
        : null;

      return (
        <div>
          <div className={styles.container}>
            {thumbUrl && (
              <Image
                src={thumbUrl}
                alt={snap.title || targetTitle}
                containerClassName={styles.adThumbnail}
              />
            )}
            <div className={styles.adInfo}>
              <div className={styles.adTitle}>{snap.title || targetTitle}</div>
              {snap.price && snap.currency && (
                <div className={styles.adMeta}>{snap.price} {snap.currency}</div>
              )}
              {snap.status && (
                <div className={styles.adMeta}>{snap.status}</div>
              )}
            </div>
          </div>
          <div className={styles.linkRow}>
            <Link to={`/ad/${targetId}`} className="uk-link-muted uk-text-small">
              <Icon icon="link" ratio={0.7} /> {t('admin.reports.detail.viewAd')}
            </Link>
          </div>
        </div>
      );
    }

    case 'USER': {
      const snap = asUserSnapshot(targetSnapshot);
      if (!snap) return <div className={styles.fallbackTitle}>{targetTitle}</div>;

      return (
        <div>
          <div className={styles.userContent}>
            <Avatar
              username={snap.username || targetTitle}
              avatarUrl={snap.avatarUrl}
              size={44}
            />
            <div className={styles.userInfo}>
              <span className={styles.userName}>@{snap.username || targetTitle}</span>
              {snap.displayName && (
                <span className={styles.userDisplayName}>{snap.displayName}</span>
              )}
            </div>
          </div>
          <div className={styles.linkRow}>
            <Link to={`/admin/users/${targetId}`} className="uk-link-muted uk-text-small">
              <Icon icon="user" ratio={0.7} /> {t('admin.reports.detail.viewUser')}
            </Link>
          </div>
        </div>
      );
    }

    case 'QUESTION':
    case 'ANSWER': {
      const snap = asQaSnapshot(targetSnapshot);
      if (!snap) return <div className={styles.fallbackTitle}>{targetTitle}</div>;

      return (
        <div>
          <div className={styles.quotedText}>{snap.text}</div>
          {snap.adId && (
            <div className={styles.qaContext}>
              <Icon icon="link" ratio={0.7} />
              <Link to={`/ad/${snap.adId}`} className="uk-link-muted">
                {t('admin.reports.detail.onAd', { adId: snap.adId.slice(0, 8) })}
              </Link>
            </div>
          )}
        </div>
      );
    }

    case 'MESSAGE': {
      const snap = asMessageSnapshot(targetSnapshot);
      if (!snap) return <div className={styles.fallbackTitle}>{targetTitle}</div>;

      return (
        <div>
          <div className={styles.quotedText}>{snap.text}</div>
          {snap.conversationId && (
            <div className={styles.qaContext}>
              <Icon icon="comment" ratio={0.7} />
              <span className="uk-text-small uk-text-muted">
                {t('admin.reports.detail.viewConversation')}
              </span>
            </div>
          )}
        </div>
      );
    }

    default:
      return <div className={styles.fallbackTitle}>{targetTitle}</div>;
  }
};

export default ReportedContentCard;
