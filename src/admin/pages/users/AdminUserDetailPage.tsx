import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { adminUserService } from '../../services/adminUserService';
import type { AdminUserDetailDto, AdminBanDto } from '../../types/adminUser';
import NavbarPortal from '../../../components/Navbar/NavbarPortal';
import { useNavbarMode } from '../../../hooks/useNavbarMode';
import { Image } from '../../../components/Image/Image';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import UserStatusBadge from '../../components/UserStatusBadge/UserStatusBadge';
import BanUserModal from '../../components/BanUserModal/BanUserModal';
import { Alert } from '../../../components/uikit/Alert/Alert';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { useCountdown } from '../../../hooks/useCountdown';
import { createPageContainerVariants, pageItemVariants } from '../../../animations';

/** Converts epoch microseconds to a localized date string */
const formatMicros = (micros: number | null | undefined): string => {
  if (micros == null) return '—';
  return new Date(micros / 1000).toLocaleString();
};

const BanCountdownInline: React.FC<{ bannedUntil: number }> = ({ bannedUntil }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(bannedUntil);
  if (isExpired) return <span className="uk-text-success">Expired</span>;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m ${seconds}s`);
  return <span className="uk-text-warning">{parts.join(' ')}</span>;
};

const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="uk-text-meta">{label}</div>
    <div className="uk-text-bold uk-text-large">{value}</div>
  </div>
);

const BanHistoryEntry: React.FC<{ ban: AdminBanDto }> = ({ ban }) => {
  const { t } = useTranslation();
  return (
    <div className="uk-card uk-card-secondary uk-card-body uk-card-small uk-margin-small-bottom uk-border-rounded">
      <div className="uk-grid uk-grid-small uk-child-width-1-2@s" uk-grid="">
        <div>
          <span className="uk-text-meta">{t('admin.users.ban.reason')}:</span>
          <p className="uk-margin-remove">{ban.reason}</p>
        </div>
        <div>
          <div className="uk-text-meta">{t('admin.users.ban.bannedBy')}: {ban.bannedByUsername}</div>
          <div className="uk-text-meta">{t('admin.users.ban.bannedAt')}: {formatMicros(ban.bannedAt)}</div>
          {ban.bannedUntil && (
            <div className="uk-text-meta">{t('admin.users.ban.bannedUntil')}: {formatMicros(ban.bannedUntil)}</div>
          )}
          {ban.unbannedByUsername && (
            <>
              <div className="uk-text-meta">{t('admin.users.ban.unbannedBy')}: {ban.unbannedByUsername}</div>
              <div className="uk-text-meta">{t('admin.users.ban.unbannedAt')}: {formatMicros(ban.unbannedAt)}</div>
            </>
          )}
        </div>
      </div>
      <div className="uk-margin-small-top">
        {ban.active ? (
          <span className="uk-label uk-label-danger">{t('admin.users.ban.active')}</span>
        ) : ban.unbannedByUsername ? (
          <span className="uk-label">{t('admin.users.ban.lifted')}</span>
        ) : (
          <span className="uk-label uk-label-warning">{t('admin.users.ban.expired')}</span>
        )}
      </div>
    </div>
  );
};

const AdminUserDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  useNavbarMode('focused', '/admin/users');

  const [user, setUser] = useState<AdminUserDetailDto | null>(null);
  const [banHistory, setBanHistory] = useState<AdminBanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, history] = await Promise.all([
        adminUserService.getUserDetail(userId),
        adminUserService.getBanHistory(userId),
      ]);
      setUser(detail);
      setBanHistory(history);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleBan = async (reason: string, bannedUntil: number | null) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await adminUserService.banUser(userId, { reason, bannedUntil });
      UIkit.notification({ message: t('admin.users.ban.banSuccess'), status: 'success', pos: 'top-center' });
      setIsBanModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!userId || !user) return;
    try {
      await UIkit.modal.confirm(
        t('admin.users.ban.confirmUnban', { username: user.username }),
        { stack: true, container: '#root', i18n: { ok: t('common.ok'), cancel: t('common.cancel') } },
      );
    } catch {
      return; // User cancelled
    }
    setActionLoading(true);
    try {
      await adminUserService.unbanUser(userId);
      UIkit.notification({ message: t('admin.users.ban.unbanSuccess'), status: 'success', pos: 'top-center' });
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || t('auth.errors.generic');
      UIkit.notification({ message, status: 'danger', pos: 'top-center' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="uk-flex uk-flex-center uk-margin-large-top">
        <Spinner ratio={2} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert variant="danger">{error || t('auth.errors.generic')}</Alert>
    );
  }

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">@{user.username}</span>
      </NavbarPortal>

      <motion.div variants={createPageContainerVariants()} initial="hidden" animate="visible">
        {/* Identity Header */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <div className="uk-flex uk-flex-middle">
            <div className="uk-margin-right" style={{ flexShrink: 0 }}>
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={80}
                  height={80}
                  containerClassName="uk-border-circle"
                  containerStyle={{ width: 80, height: 80, overflow: 'hidden' }}
                />
              ) : (
                <GeometricAvatar username={user.username} size={80} />
              )}
            </div>
            <div>
              <h2 className="uk-margin-remove">{user.displayName || user.username}</h2>
              <div className="uk-text-meta">@{user.username}</div>
              <div className="uk-margin-small-top uk-flex uk-flex-middle" style={{ gap: '8px' }}>
                <UserStatusBadge status={user.status} />
                {(user.roles ?? []).map(role => (
                  <span key={role} className="uk-label">{role}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="uk-margin-top uk-flex" style={{ gap: '8px' }}>
            {user.status !== 'BANNED' ? (
              <button
                className="uk-button uk-button-danger uk-button-small uk-border-rounded"
                onClick={() => setIsBanModalOpen(true)}
                disabled={actionLoading || (user.roles ?? []).includes('ADMIN')}
              >
                <Icon icon="ban" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.users.ban.banUser')}
              </button>
            ) : (
              <button
                className="uk-button uk-button-primary uk-button-small uk-border-rounded"
                onClick={handleUnban}
                disabled={actionLoading}
              >
                <Icon icon="check" className="uk-margin-small-right" ratio={0.8} />
                {t('admin.users.ban.unbanUser')}
              </button>
            )}
          </div>
        </motion.div>

        {/* Active Ban */}
        <AnimatePresence>
          {user.activeBan && (
            <motion.div
              variants={pageItemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="uk-margin-bottom"
            >
              <div className="uk-card uk-card-default uk-card-body uk-border-rounded" style={{ borderLeft: '4px solid var(--global-danger-background)' }}>
                <h3 className="uk-card-title uk-text-danger">{t('admin.users.detail.activeBan')}</h3>
                <div className="uk-grid uk-grid-small uk-child-width-1-2@s" uk-grid="">
                  <div>
                    <div className="uk-text-meta">{t('admin.users.ban.reason')}</div>
                    <p className="uk-margin-small-top">{user.activeBan.reason}</p>
                  </div>
                  <div>
                    <div className="uk-text-meta">{t('admin.users.ban.bannedBy')}: {user.activeBan.bannedByUsername}</div>
                    <div className="uk-text-meta">{t('admin.users.ban.bannedAt')}: {formatMicros(user.activeBan.bannedAt)}</div>
                    {user.activeBan.bannedUntil ? (
                      <div className="uk-text-meta uk-margin-small-top">
                        {t('admin.users.ban.bannedUntil')}: {formatMicros(user.activeBan.bannedUntil)}
                        <div className="uk-margin-small-top">
                          <BanCountdownInline bannedUntil={user.activeBan.bannedUntil} />
                        </div>
                      </div>
                    ) : (
                      <div className="uk-margin-small-top">
                        <span className="uk-label uk-label-danger">{t('admin.users.ban.permanent')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 className="uk-card-title">{t('admin.users.detail.profile')}</h3>
          <div className="uk-grid uk-grid-small uk-child-width-1-2@s" uk-grid="">
            <div>
              <div className="uk-text-meta">{t('admin.users.email')}</div>
              <div>{user.email}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.phone')}</div>
              <div>{user.phone || '—'}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.language')}</div>
              <div>{user.language || '—'}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.currency')}</div>
              <div>{user.preferredCurrency || '—'}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.presence')}</div>
              <div>{user.presenceStatus || '—'}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.lastSeen')}</div>
              <div>{formatMicros(user.lastSeenAt)}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.memberSince')}</div>
              <div>{formatMicros(user.registeredAt)}</div>
            </div>
            <div>
              <div className="uk-text-meta">{t('admin.users.lastLogin')}</div>
              <div>{user.lastLogin ? formatMicros(user.lastLogin) : t('admin.users.never')}</div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Card */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 className="uk-card-title">{t('admin.users.detail.statistics')}</h3>
          <div className="uk-grid uk-grid-small uk-child-width-1-3@s" uk-grid="">
            <StatItem label={t('admin.users.stats.activeAds')} value={user.stats.activeAdsCount} />
            <StatItem label={t('admin.users.stats.totalAds')} value={user.stats.totalAdsCount} />
            <StatItem label={t('admin.users.stats.purchasesAsBuyer')} value={user.stats.purchasesAsBuyer} />
            <StatItem label={t('admin.users.stats.completedAsBuyer')} value={user.stats.completedPurchasesAsBuyer} />
            <StatItem label={t('admin.users.stats.purchasesAsSeller')} value={user.stats.purchasesAsSeller} />
            <StatItem label={t('admin.users.stats.completedAsSeller')} value={user.stats.completedPurchasesAsSeller} />
          </div>
        </motion.div>

        {/* Ban History */}
        <motion.div variants={pageItemVariants} className="uk-card uk-card-default uk-card-body">
          <h3 className="uk-card-title">{t('admin.users.detail.banHistory')}</h3>
          {banHistory.length === 0 ? (
            <p className="uk-text-meta">{t('admin.users.detail.noBanHistory')}</p>
          ) : (
            banHistory.map(ban => <BanHistoryEntry key={ban.id} ban={ban} />)
          )}
        </motion.div>
      </motion.div>

      <BanUserModal
        username={user.username}
        isOpen={isBanModalOpen}
        onConfirm={handleBan}
        onClose={() => setIsBanModalOpen(false)}
      />
    </>
  );
};

export default AdminUserDetailPage;
