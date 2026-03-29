import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import NavbarPortal from '../../components/Navbar/NavbarPortal';
import { Icon } from '../../components/uikit/Icon/Icon';
import AdminSubNav from '../components/AdminSubNav';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  useNavbarMode('focused', '/');

  const cards = [
    {
      title: t('admin.categories.title'),
      description: t('admin.categories.search'),
      icon: 'folder',
      link: '/admin/categories',
    },
    {
      title: t('admin.users.title'),
      description: t('admin.users.description'),
      icon: 'users',
      link: '/admin/users',
    },
    {
      title: t('admin.reports.title'),
      description: t('admin.reports.description'),
      icon: 'warning',
      link: '/admin/reports',
    },
    {
      title: t('admin.helpdesk.title'),
      description: t('admin.helpdesk.description'),
      icon: 'receiver',
      link: '/admin/tickets',
    },
  ];

  return (
    <>
      <NavbarPortal>
        <span className="uk-text-bold">{t('admin.title')}</span>
      </NavbarPortal>
      <AdminSubNav />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants} className="uk-h3">
          {t('admin.dashboard')}
        </motion.h2>

        <motion.div
          variants={itemVariants}
          className="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
          uk-grid=""
        >
          {cards.map((card) => (
            <div key={card.link}>
              <Link to={card.link} className="uk-link-reset">
                <div className="uk-card uk-card-default uk-card-hover uk-card-body">
                  <div className="uk-flex uk-flex-middle uk-margin-small-bottom">
                    <Icon icon={card.icon} ratio={1.5} className="uk-margin-small-right" />
                    <h3 className="uk-card-title uk-margin-remove">{card.title}</h3>
                  </div>
                  <p className="uk-text-meta">{card.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
};

export default AdminDashboardPage;
