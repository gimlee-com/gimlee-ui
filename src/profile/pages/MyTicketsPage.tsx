import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import TicketStatusBadge from '../../admin/components/TicketStatusBadge/TicketStatusBadge';
import TicketCategoryBadge from '../../admin/components/TicketCategoryBadge/TicketCategoryBadge';
import { SmartPagination } from '../../components/SmartPagination';
import CreateTicketForm from '../components/CreateTicketForm/CreateTicketForm';
import type { TicketListItemDto } from '../../admin/types/adminTicket';
import type { PageMetadata } from '../../types/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
} as const;

const MyTicketsPage: React.FC = () => {
  useNavbarMode('focused', '/profile');
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState<TicketListItemDto[]>([]);
  const [pageInfo, setPageInfo] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  const fetchTickets = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ticketService.getMyTickets({ page, size: 20 });
      setTickets(res.content);
      setPageInfo(res.page);
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('tickets.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchTickets(currentPage);
  }, [currentPage, isAuthenticated, fetchTickets]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleTicketCreated = () => {
    setShowCreateForm(false);
    void fetchTickets(0);
    setSearchParams({ page: '0' });
  };

  if (!isAuthenticated) {
    return (
      <div className="uk-text-center uk-margin-large-top">
        <p>{t('auth.loginRequired')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="uk-flex uk-flex-between uk-flex-middle uk-margin-bottom">
        <h1 className="uk-heading-small uk-margin-remove">{t('tickets.myTickets')}</h1>
        <button
          type="button"
          className="uk-button uk-button-primary uk-button-small"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? t('common.cancel') : t('tickets.createTicket')}
        </button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="uk-margin-bottom"
          >
            <div className="uk-card uk-card-default uk-card-body">
              <CreateTicketForm onSuccess={handleTicketCreated} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="uk-text-center uk-margin-large-top">
          <div uk-spinner="" />
        </div>
      )}

      {error && (
        <div className="uk-alert-danger" uk-alert="">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="uk-text-center uk-text-muted uk-margin-large-top">
          <span uk-icon="icon: mail; ratio: 2" className="uk-margin-small-bottom" />
          <p>{t('tickets.noTickets')}</p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <motion.div
          className="uk-flex uk-flex-column"
          style={{ gap: '12px' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tickets.map((ticket) => {
            const createdDate = new Date(ticket.createdAt / 1000).toLocaleDateString();

            return (
              <motion.div key={ticket.id} variants={itemVariants} layout>
                <Link
                  to={`/tickets/${ticket.id}`}
                  state={{ from: location.pathname + location.search }}
                  className="uk-link-reset"
                >
                  <div className="uk-card uk-card-default uk-card-hover uk-card-body uk-card-small">
                    <div className="uk-flex uk-flex-middle uk-flex-wrap" style={{ gap: '6px' }}>
                      <span className="uk-text-bold uk-text-truncate">{ticket.subject}</span>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <div className="uk-flex uk-flex-wrap uk-margin-small-top" style={{ gap: '6px' }}>
                      <TicketCategoryBadge category={ticket.category} />
                      <span className="uk-text-meta">
                        {t('tickets.messageCount', { count: ticket.messageCount })}
                      </span>
                    </div>
                    <div className="uk-text-meta uk-margin-small-top">
                      {createdDate}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {pageInfo && (
        <SmartPagination
          currentPage={pageInfo.number}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
          className="uk-margin-medium-top"
        />
      )}
    </div>
  );
};

export default MyTicketsPage;
