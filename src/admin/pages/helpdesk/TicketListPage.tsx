import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { adminTicketService } from '../../services/adminTicketService';
import type {
  PageTicketListItemDto,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketSortField,
  SortDirection,
} from '../../types/adminTicket';
import TicketCard from '../../components/TicketCard/TicketCard';
import TicketFilterBadges from '../../components/TicketFilters/TicketFilters';
import AdminSubNav from '../../components/AdminSubNav';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { SmartPagination } from '../../../components/SmartPagination';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';

const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'AWAITING_USER', 'RESOLVED', 'CLOSED'];
const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TICKET_CATEGORIES: TicketCategory[] = [
  'ACCOUNT_ISSUE', 'PAYMENT_PROBLEM', 'ORDER_DISPUTE', 'TECHNICAL_BUG',
  'FEATURE_REQUEST', 'SAFETY_CONCERN', 'OTHER',
];
const SORT_FIELDS: TicketSortField[] = ['createdAt', 'updatedAt', 'lastMessageAt', 'priority'];

const TicketListPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PageTicketListItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useNavbarMode('focused', '/admin');

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = {
      page: parseInt(searchParams.get('page') || '0', 10),
      size: parseInt(searchParams.get('size') || '30', 10),
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as TicketStatus) || undefined,
      priority: (searchParams.get('priority') as TicketPriority) || undefined,
      category: (searchParams.get('category') as TicketCategory) || undefined,
      sort: (searchParams.get('sort') as TicketSortField) || undefined,
      direction: (searchParams.get('direction') as SortDirection) || undefined,
    };

    adminTicketService.listTickets(params)
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

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ priority: e.target.value || undefined });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ category: e.target.value || undefined });
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
        <span className="uk-text-bold">{t('admin.helpdesk.title')}</span>
      </NavbarPortal>
      <AdminSubNav />

      <motion.div variants={createPageContainerVariants()} initial="hidden" animate="visible">
        <motion.div variants={pageItemVariants} className="uk-margin-bottom">
          <div className="uk-grid uk-grid-small uk-flex-middle" uk-grid="">
            <div className="uk-width-1-1 uk-width-1-3@m">
              <div className="uk-inline uk-width-1-1">
                <span className="uk-form-icon">
                  <Icon icon="search" />
                </span>
                <input
                  className="uk-input uk-border-rounded"
                  type="text"
                  placeholder={t('admin.helpdesk.filters.search', 'Search tickets...')}
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
                {TICKET_STATUSES.map(s => (
                  <option key={s} value={s}>{t(`admin.helpdesk.status.${s}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('priority') || ''}
                onChange={handlePriorityChange}
              >
                <option value="">{t('admin.helpdesk.filters.allPriorities', 'All Priorities')}</option>
                {TICKET_PRIORITIES.map(p => (
                  <option key={p} value={p}>{t(`admin.helpdesk.priority.${p}`)}</option>
                ))}
              </select>
            </div>
            <div className="uk-width-1-3 uk-width-auto@m">
              <select
                className="uk-select uk-border-rounded"
                value={searchParams.get('category') || ''}
                onChange={handleCategoryChange}
              >
                <option value="">{t('admin.helpdesk.filters.allCategories', 'All Categories')}</option>
                {TICKET_CATEGORIES.map(c => (
                  <option key={c} value={c}>{t(`admin.helpdesk.category.${c}`)}</option>
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
                  <option key={f} value={f}>{t(`admin.helpdesk.filters.sortFields.${f}`, f)}</option>
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
          <TicketFilterBadges
            search={searchParams.get('search') || ''}
            status={(searchParams.get('status') as TicketStatus) || ''}
            priority={(searchParams.get('priority') as TicketPriority) || ''}
            category={(searchParams.get('category') as TicketCategory) || ''}
            onRemoveSearch={() => { setSearchInput(''); applyFilters({ search: undefined }); }}
            onRemoveStatus={() => applyFilters({ status: undefined })}
            onRemovePriority={() => applyFilters({ priority: undefined })}
            onRemoveCategory={() => applyFilters({ category: undefined })}
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
                  {data?.content.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
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
                  <p className="uk-text-meta">{t('admin.helpdesk.noTickets')}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default TicketListPage;
