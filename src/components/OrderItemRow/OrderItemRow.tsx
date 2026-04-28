import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image } from '../Image/Image';
import { formatPrice } from '../../utils/currencyUtils';
import type { OrderItemDetailDto } from '../../types/api';
import styles from './OrderItemRow.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

interface OrderItemRowProps {
  item: OrderItemDetailDto;
  currency: string;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({ item, currency }) => {
  const location = useLocation();
  const thumbnailUrl = item.thumbnailPath
    ? `${API_URL}/api/media?p=/thumbs-xs${item.thumbnailPath}`
    : undefined;

  return (
    <div className={styles.row}>
      <div className={styles.thumbnail}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={item.title}
            className={styles.image}
            containerClassName={styles.image}
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
      <div className={styles.info}>
        <Link
          to={`/ads/${item.adId}`}
          state={{ from: location.pathname + location.search }}
          className={styles.title}
        >
          {item.title}
        </Link>
        <span className="uk-text-meta">
          {item.quantity} × {formatPrice(item.unitPrice, currency)}
        </span>
      </div>
      <div className={styles.subtotal}>
        {formatPrice(item.quantity * item.unitPrice, currency)}
      </div>
    </div>
  );
};
