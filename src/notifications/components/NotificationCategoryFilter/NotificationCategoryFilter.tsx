import React from 'react';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_CATEGORIES } from '../../types/notification';
import type { NotificationCategory } from '../../types/notification';

interface NotificationCategoryFilterProps {
  activeCategory: NotificationCategory | null;
  onChange: (category: NotificationCategory | null) => void;
}

export const NotificationCategoryFilter: React.FC<NotificationCategoryFilterProps> = ({
  activeCategory,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <ul className="uk-subnav uk-subnav-pill uk-margin-remove-bottom" style={{ flexWrap: 'nowrap', overflowX: 'auto', gap: 4 }}>
      <li className={activeCategory === null ? 'uk-active' : ''}>
        <a href="#" onClick={(e) => { e.preventDefault(); onChange(null); }}
          style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
        >
          {t('notifications.categories.all')}
        </a>
      </li>
      {NOTIFICATION_CATEGORIES.map((cat) => (
        <li key={cat} className={activeCategory === cat ? 'uk-active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); onChange(cat); }}
            style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
          >
            {t(`notifications.categories.${cat}`)}
          </a>
        </li>
      ))}
    </ul>
  );
};
