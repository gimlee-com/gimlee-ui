import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { spring } from '../../../animations/springs';
import StarRating from '../StarRating/StarRating';
import { Markdown } from '../../../components/Markdown/Markdown';
import { Image } from '../../../components/Image/Image';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import ReportButton from '../../../components/ReportButton/ReportButton';
import { useUserLookup } from '../../hooks/useUserLookup';
import { useRatingLifecycle } from '../../hooks/useRatingLifecycle';
import { formatShortDate, formatDateTime } from '../../utils/ratingTimeUtils';
import type { RatingResponseDto } from '../../types/ratings';
import styles from './RatingCard.module.scss';

interface RatingCardProps {
  rating: RatingResponseDto;
  viewerRole?: 'owner' | 'admin' | 'public';
  onEdit?: (rating: RatingResponseDto) => void;
  onDelete?: (ratingId: string) => void;
  onHide?: (ratingId: string) => void;
  onRestore?: (ratingId: string) => void;
  onSupplement?: (rating: RatingResponseDto) => void;
  onResponse?: (rating: RatingResponseDto) => void;
}

export default function RatingCard({
  rating,
  viewerRole = 'public',
  onEdit,
  onDelete,
  onHide,
  onRestore,
  onSupplement,
  onResponse,
}: RatingCardProps) {
  const { t } = useTranslation();
  const [showSupplements, setShowSupplements] = useState(false);

  const { userMap } = useUserLookup([rating.raterId, rating.rateeId]);
  const rater = userMap.get(rating.raterId);
  const ratee = userMap.get(rating.rateeId);

  const { isEditable } = useRatingLifecycle(rating.editableUntil);

  const isHidden = rating.status === 'HID';
  const showActions = viewerRole === 'owner' || viewerRole === 'admin';

  return (
    <motion.div
      className={`${styles.card} ${isHidden ? styles.hidden : ''}`}
      layout
      transition={spring}
    >
      {isHidden && (
        <div className={styles.hiddenBanner}>
          {t('reviews.ratingCard.hidden')}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.raterInfo}>
          <GeometricAvatar username={rating.raterId} size={32} />
          <div>
            <span className={styles.raterName}>
              {rater?.username || t('common.loading')}
            </span>
            <span className={styles.date} title={formatDateTime(rating.createdAt)}>
              {formatShortDate(rating.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.headerBadges}>
          {rating.edited && (
            <span className={styles.editedBadge}>
              {t('reviews.ratingCard.edited')}
            </span>
          )}
        </div>
      </div>

      <div className={styles.scoreRow}>
        <StarRating value={rating.score} size="md" />
        <span className={styles.scoreValue}>{rating.score}.0</span>
      </div>

      {rating.title && <h4 className={styles.title}>{rating.title}</h4>}

      {rating.body && (
        <div className={styles.body}>
          <Markdown content={rating.body} />
        </div>
      )}

      {rating.photoPaths && rating.photoPaths.length > 0 && (
        <div className={styles.photoGallery}>
          {rating.photoPaths.map((path, idx) => (
            <Image
              key={idx}
              src={path}
              alt={`${t('reviews.ratingCard.photoAlt')} ${idx + 1}`}
              containerClassName={styles.photoContainer}
            />
          ))}
        </div>
      )}

      {rating.snapshot && rating.snapshot.items.length > 0 && (
        <div className={styles.snapshot}>
          <h5 className={styles.snapshotTitle}>
            {t('reviews.ratingCard.itemsInTransaction')}
          </h5>
          {rating.snapshot.items.map((item, idx) => (
            <div key={idx} className={styles.snapshotItem}>
              {item.thumbPath && (
                <Image
                  src={item.thumbPath}
                  alt={item.name}
                  containerClassName={styles.snapshotThumb}
                />
              )}
              <span className={styles.snapshotName}>{item.name}</span>
              {viewerRole === 'owner' && (
                <span className={styles.snapshotPrice}>
                  {item.quantity} × {item.unitPrice} {item.currency}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {rating.supplements && rating.supplements.length > 0 && (
        <div className={styles.supplementsSection}>
          <button
            className={styles.supplementsToggle}
            onClick={() => setShowSupplements(!showSupplements)}
            type="button"
          >
            <span>
              {t('reviews.ratingCard.supplements', {
                count: rating.supplements.length,
              })}
            </span>
            <svg
              className={`${styles.chevron} ${showSupplements ? styles.chevronOpen : ''}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </button>

          <AnimatePresence initial={false}>
            {showSupplements && (
              <motion.div
                className={styles.supplementsList}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={spring}
              >
                <div className={styles.supplementsInner}>
                  {rating.supplements.map((supp, idx) => (
                    <div key={idx} className={styles.supplement}>
                      <span className={styles.supplementDate}>
                        {formatShortDate(supp.createdAt)}
                      </span>
                      <Markdown content={supp.body} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {rating.response && (
        <div className={styles.responseSection}>
          <div className={styles.responseHeader}>
            <GeometricAvatar username={rating.rateeId} size={24} />
            <span className={styles.responseLabel}>
              {t('reviews.ratingCard.response', {
                username: ratee?.username || t('common.loading'),
              })}
            </span>
            <span className={styles.responseDate}>
              {formatShortDate(rating.response.createdAt)}
            </span>
          </div>
          <div className={styles.responseBody}>
            <Markdown content={rating.response.body} />
          </div>
        </div>
      )}

      {showActions && (
        <div className={styles.actions}>
          <ReportButton targetType="RATING" targetId={rating.id} />

          {viewerRole === 'owner' && isEditable && onEdit && (
            <button
              className="uk-button uk-button-small uk-button-default"
              onClick={() => onEdit(rating)}
              type="button"
            >
              {t('common.edit')}
            </button>
          )}

          {viewerRole === 'owner' && onSupplement && (
            <button
              className="uk-button uk-button-small uk-button-default"
              onClick={() => onSupplement(rating)}
              type="button"
            >
              {t('reviews.ratingCard.addSupplement')}
            </button>
          )}

          {viewerRole === 'public' && !rating.response && onResponse && (
            <button
              className="uk-button uk-button-small uk-button-primary"
              onClick={() => onResponse(rating)}
              type="button"
            >
              {t('reviews.ratingCard.respond')}
            </button>
          )}

          {viewerRole === 'owner' && onDelete && (
            <button
              className="uk-button uk-button-small uk-button-danger"
              onClick={() => onDelete(rating.id)}
              type="button"
            >
              {t('common.delete')}
            </button>
          )}

          {viewerRole === 'admin' && onHide && !isHidden && (
            <button
              className="uk-button uk-button-small uk-button-danger"
              onClick={() => onHide(rating.id)}
              type="button"
            >
              {t('reviews.ratingCard.hide')}
            </button>
          )}

          {viewerRole === 'admin' && onRestore && isHidden && (
            <button
              className="uk-button uk-button-small uk-button-default"
              onClick={() => onRestore(rating.id)}
              type="button"
            >
              {t('reviews.ratingCard.restore')}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
