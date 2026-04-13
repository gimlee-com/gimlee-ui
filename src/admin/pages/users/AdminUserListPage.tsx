import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { adminUserService } from '../../services/adminUserService';
import type { PageAdminUserListItemDto, UserStatus, AdminUserSortField, SortDirection } from '../../types/adminUser';
import AdminUserCard from './AdminUserCard';
import ActiveFilterBadges from './ActiveFilterBadges';
import AdminSubNav from '../../components/AdminSubNav';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { SmartPagination } from '../../../components/SmartPagination';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';

const USER_STATUSES: UserStatus[] = ['ACTIVE', 'PENDING_VERIFICATION', 'BANNED', 'SUSPENDED'];
const SORT_FIELDS: AdminUserSortField[] = ['registeredAt', 'lastLogin', 'username'];

const AdminUserListPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageAdminUserListItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useNavbarMode('focused', '/admin');

  // Local filter state synced from URL
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Fetch data whenever URL params change
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = {
      page: parseInt(searchParams.get('page') || '0', 10),
      size: parseInt(searchParams.get('size') || '30', 10),
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as UserStatus) || undefined,
      sort: (searchParams.get('sort') as AdminUserSortField) || undefined,
      direction: (searchParams.get('direction') as SortDirection) || undefined,
    };

    adminUserService.listUsers(params)
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('auth.errors.generic'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchParams, t]);

  const applyFilters = useCallback((overrides: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    // Reset page on filter change
    newParams.set('page', '0');
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters({ search: value || undefined });
    }, 500);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ status: e.target.value || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ sort: e.target.value || undefined });
  };

  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ direction: e.target.value || undefined });
  };

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">{t('admin.users.title')}</span>
      </NavbarPortal>
      <AdminSubNav />

      <motion.div variants={createPageContainerVariants()} initial="hidden" animate="visible">
        <motion.div variants={pageItemVariants} className="uk-margin-bottom">
          {/* Search & Filters */}
          <div className="uk-grid uk-grid-small uk-flex-middle" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-3@m">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon">
                  <Icon icon="search" />
                </span>
                <input
                  className="uk-input uk-border-rounded"
                  type="text"
                  placeholder={t('admin.users.search')}
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('status') || ''}
                onChange={handleStatusChange}
              >
                <option value="">{t('admin.users.filters.allStatuses')}</option>
                {USER_STATUSES.map(s => (
                  <option key={s} value={s}>{t(`admin.users.status.${s}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('sort') || ''}
                onChange={handleSortChange}
              >
                <option value="">{t('admin.users.filters.sort')}</option>
                {SORT_FIELDS.map(f => (
                  <option key={f} value={f}>{t(`admin.users.filters.sortFields.${f}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('direction') || ''}
                onChange={handleDirectionChange}
              >
                <option value="">{t('admin.users.filters.direction')}</option>
                <option value="ASC">{t('admin.users.filters.ascending')}</option>
                <option value="DESC">{t('admin.users.filters.descending')}</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={pageItemVariants}>
          <ActiveFilterBadges
            search={searchParams.get('search') || ''}
            status={(searchParams.get('status') as UserStatus) || ''}
            onRemoveSearch={() => { setSearchInput(''); applyFilters({ search: undefined }); }}
            onRemoveStatus={() => applyFilters({ status: undefined })}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="uk-flex uk-flex-center uk-margin-large-top"
            >
              <Spinner ratio={2} />
            </motion.div>
          ) : error ? (
            <motion.div key="error" variants={pageItemVariants}>
              <Alert variant="danger">{error}</Alert>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={createPageContainerVariants(0.04)}
            >
              <div className="uk-grid uk-grid-small uk-child-width-1-1 uk-child-width-1-2@m" uk-grid="">
                <AnimatePresence mode="popLayout">
                  {data?.content.map(user => (
                    <AdminUserCard key={user.userId} user={user} />
                  ))}
                </AnimatePresence>
              </div>

              {data && data.page.totalPages > 1 && (
                <motion.div variants={pageItemVariants} className="uk-margin-large-top">
                  <SmartPagination
                    currentPage={data.page.number}
                    totalPages={data.page.totalPages}
                    onPageChange={handlePageChange}
                    className="uk-flex-center"
                  />
                </motion.div>
              )}

              {data?.content.length === 0 && (
                <motion.div variants={pageItemVariants} className="uk-text-center uk-margin-large-top">
                  <p className="uk-text-meta">{t('admin.users.noUsers')}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default AdminUserListPage;
