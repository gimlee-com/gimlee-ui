import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { pageItemVariants } from '../../../animations';
import ReportReasonBadge from '../ReportReasonBadge/ReportReasonBadge';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Image } from '../../../components/Image/Image';
import { Avatar } from '../../../components/Avatar/Avatar';
import { reportTargetTypeIcon } from '../../utils/reportTargetTypeIcon';
import { formatRelativeTime } from '../../../utils/dateUtils';
import type { ReportListItemDto, ReportStatus } from '../../types/adminReport';
import {
  asAdSnapshot,
  asUserSnapshot,
  asQaSnapshot,
  asMessageSnapshot,
} from '../../types/adminReport';
import styles from './ReportCard.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ReportCardProps {
  report: ReportListItemDto;
}

const statusCardClasses: Record<ReportStatus, string> = {
  OPEN: styles.statusOpen,
  IN_REVIEW: styles.statusInReview,
  RESOLVED: styles.statusResolved,
  DISMISSED: styles.statusDismissed,
};

const dotClasses: Record<ReportStatus, string> = {
  OPEN: styles.dotOpen,
  IN_REVIEW: styles.dotInReview,
  RESOLVED: styles.dotResolved,
  DISMISSED: styles.dotDismissed,
};

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const snapshot = report.targetSnapshot;

  const renderContent = () => {
    switch (report.targetType) {
      case 'AD': {
        const snap = asAdSnapshot(snapshot);
        if (!snap) return <div className={styles.fallbackTitle}>{report.targetTitle}</div>;

        const firstPath = snap.mediaPaths?.[0];
        const thumbUrl = firstPath
          ? `${API_URL}/api/media?p=/thumbs-sm${firstPath}`
          : null;

        return (
          <div className={styles.adContent}>
            {thumbUrl && (
              <div className={styles.adThumbnail}>
                <Image
                  src={thumbUrl}
                  alt={snap.title || report.targetTitle}
                  containerClassName={styles.adThumbnail}
                />
              </div>
            )}
            <div className={styles.adInfo}>
              <div className={styles.adTitle}>{snap.title || report.targetTitle}</div>
              {snap.price && snap.currency && (
                <div className={styles.adPrice}>{snap.price} {snap.currency}</div>
              )}
            </div>
          </div>
        );
      }

      case 'USER': {
        const snap = asUserSnapshot(snapshot);
        if (!snap) return <div className={styles.fallbackTitle}>{report.targetTitle}</div>;

        return (
          <div className={styles.userContent}>
            <Avatar
              username={snap.username || report.targetTitle}
              avatarUrl={snap.avatarUrl}
              size={36}
            />
            <span className={styles.userName}>
              @{snap.username || report.targetTitle}
            </span>
          </div>
        );
      }

      case 'QUESTION':
      case 'ANSWER': {
        const snap = asQaSnapshot(snapshot);
        if (!snap) return <div className={styles.fallbackTitle}>{report.targetTitle}</div>;

        return (
          <>
            <div className={styles.quotedText}>{snap.text}</div>
            {snap.adId && (
              <div className={styles.qaContext}>
                <Icon icon="link" ratio={0.7} /> {t('admin.reports.card.onAd', { adId: snap.adId.slice(0, 8) })}
              </div>
            )}
          </>
        );
      }

      case 'MESSAGE': {
        const snap = asMessageSnapshot(snapshot);
        if (!snap) return <div className={styles.fallbackTitle}>{report.targetTitle}</div>;

        return <div className={styles.quotedText}>{snap.text}</div>;
      }

      default:
        return <div className={styles.fallbackTitle}>{report.targetTitle}</div>;
    }
  };

  return (
    <motion.div variants={pageItemVariants} layout>
      <Link
        to={`/admin/reports/${report.id}`}
        state={{ from: location.pathname + location.search }}
        className="uk-link-reset"
      >
        <div className={`uk-card uk-card-default uk-card-hover uk-card-body uk-card-small ${styles.card} ${statusCardClasses[report.status]}`}>
          {/* Header: Type label | Status dot + Sibling count */}
          <div className={styles.header}>
            <span className={styles.typeLabel}>
              <Icon icon={reportTargetTypeIcon[report.targetType]} ratio={0.8} />
              {t(`admin.reports.targetType.${report.targetType}`)}
            </span>
            <div className={styles.headerRight}>
              <span className={styles.statusDot}>
                <span className={`${styles.dot} ${dotClasses[report.status]}`} />
                {t(`admin.reports.status.${report.status}`)}
              </span>
              {report.siblingCount > 1 && (
                <span className={styles.siblingBadge}>
                  <Icon icon="warning" ratio={0.7} />
                  {t('admin.reports.siblingCount', { count: report.siblingCount })}
                </span>
              )}
            </div>
          </div>

          {/* Content: Type-specific rendering */}
          <div className={styles.content}>
            {renderContent()}
          </div>

          {/* Description preview (skip for text-heavy types when snapshot text is present) */}
          {report.description && !(
            (report.targetType === 'QUESTION' || report.targetType === 'ANSWER' || report.targetType === 'MESSAGE')
            && snapshot
          ) && (
            <div className={styles.descriptionPreview}>{report.description}</div>
          )}

          {/* Footer: Reason badge | Reporter + time | Assignee */}
          <div className={styles.footer}>
            <ReportReasonBadge reason={report.reason} />
            <div className={styles.footerRight}>
              <span className={styles.reporterInfo}>
                @{report.reporterUsername} · {formatRelativeTime(report.createdAt)}
              </span>
              <span className={styles.assigneeInfo}>
                {report.assigneeUsername
                  ? `→ @${report.assigneeUsername}`
                  : t('admin.reports.card.unassigned')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ReportCard;
