import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useUIKit } from '../../../hooks/useUIkit';
import { adminUserService } from '../../services/adminUserService';
import { Image } from '../../../components/Image/Image';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { Input } from '../../../components/uikit/Form/Form';
import type { AdminUserListItemDto } from '../../types/adminUser';

interface AdminUserAssignModalProps {
  isOpen: boolean;
  onConfirm: (userId: string) => void;
  onClose: () => void;
}

const DEBOUNCE_MS = 500;
const STAFF_ROLES = 'ADMIN,SUPPORT';
const PAGE_SIZE = 20;

const AdminUserAssignModal: React.FC<AdminUserAssignModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();
  const { ref: modalRef, element: modalEl, instance } = useUIKit<
    { show: () => void; hide: () => void },
    HTMLDivElement
  >('modal', { container: false, stack: true });

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<AdminUserListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await adminUserService.listUsers({
        page: 0,
        size: PAGE_SIZE,
        search: query || undefined,
        role: STAFF_ROLES,
      });
      setResults(response.content);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, []);

  // Load initial staff list when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setInitialLoaded(false);
      void fetchUsers('');
    }
  }, [isOpen, fetchUsers]);

  // Debounced search
  useEffect(() => {
    if (!isOpen || !initialLoaded) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void fetchUsers(search);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, isOpen, initialLoaded, fetchUsers]);

  // Show/hide modal
  useEffect(() => {
    if (!instance) return;
    if (isOpen) {
      instance.show();
    } else {
      instance.hide();
    }
  }, [isOpen, instance]);

  // Listen to UIkit 'hidden' event
  const handleHide = useCallback(() => {
    setSearch('');
    setResults([]);
    setInitialLoaded(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const el = modalEl;
    if (!el) return;
    el.addEventListener('hidden', handleHide);
    return () => el.removeEventListener('hidden', handleHide);
  }, [handleHide, modalEl]);

  const handleSelect = (userId: string) => {
    onConfirm(userId);
  };

  return createPortal(
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">{t('admin.assignModal.title')}</h2>
        </div>
        <div className="uk-modal-body">
          <p className="uk-text-meta uk-margin-small-bottom">
            {t('admin.assignModal.description')}
          </p>
          <div className="uk-margin">
            <div className="uk-inline uk-width-1-1">
              <span className="uk-form-icon">
                <Icon icon="search" ratio={0.8} />
              </span>
              <Input
                className="uk-width-1-1"
                type="text"
                placeholder={t('admin.assignModal.searchPlaceholder')}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div style={{ minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
            {loading && !initialLoaded ? (
              <div className="uk-flex uk-flex-center uk-flex-middle" style={{ height: 200 }}>
                <Spinner />
              </div>
            ) : results.length === 0 ? (
              <div className="uk-flex uk-flex-center uk-flex-middle uk-text-meta" style={{ height: 200 }}>
                {initialLoaded
                  ? t('admin.assignModal.noResults')
                  : t('common.loading')}
              </div>
            ) : (
              <ul className="uk-list uk-list-divider uk-margin-remove">
                {results.map((user) => (
                  <li key={user.userId}>
                    <button
                      type="button"
                      className="uk-button uk-button-text uk-width-1-1 uk-text-left"
                      style={{ padding: '8px 0', height: 'auto', textTransform: 'none' }}
                      onClick={() => handleSelect(user.userId)}
                    >
                      <div className="uk-flex uk-flex-middle">
                        <div className="uk-margin-small-right" style={{ flexShrink: 0 }}>
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.username}
                              width={36}
                              height={36}
                              containerClassName="uk-border-circle"
                              containerStyle={{ width: 36, height: 36, overflow: 'hidden' }}
                            />
                          ) : (
                            <GeometricAvatar username={user.username} size={36} />
                          )}
                        </div>
                        <div className="uk-flex-1" style={{ minWidth: 0 }}>
                          <div className="uk-text-bold uk-text-truncate">
                            {user.displayName || user.username}
                          </div>
                          <div className="uk-text-meta uk-text-truncate">
                            @{user.username}
                            {user.roles?.length > 0 && (
                              <span className="uk-margin-small-left">
                                · {user.roles.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Icon icon="chevron-right" ratio={0.8} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {loading && initialLoaded && (
              <div className="uk-flex uk-flex-center uk-margin-small-top">
                <Spinner ratio={0.6} />
              </div>
            )}
          </div>
        </div>
        <div className="uk-modal-footer uk-text-right">
          <button
            className="uk-button uk-button-default uk-modal-close"
            type="button"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('root') || document.body
  );
};

export default AdminUserAssignModal;
