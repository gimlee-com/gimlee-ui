import type { SuggestedActionDto, NotificationCategory } from '../types/notification';

/**
 * Maps a SuggestedAction from the backend to a front-end route.
 */
export const mapSuggestedActionToUrl = (
  suggestedAction: SuggestedActionDto,
  notificationCategory: NotificationCategory
): string | null => {
  const { type, target } = suggestedAction;

  switch (type) {
    case 'PURCHASE_LIST':
    case 'PURCHASE_DETAILS':
      return '/purchases';

    case 'SALE_LIST':
    case 'SALE_DETAILS':
      return '/sales/orders';

    case 'AD_DETAILS':
      return target ? `/ads/${target}` : '/ads';

    case 'SELLER_AD_DETAILS':
      // Seller view of their own ads
      return '/sales/ads';

    case 'AD_EDIT':
      return target ? `/sales/ads/edit/${target}` : '/sales/ads';

    case 'BUYER_QA_DETAILS':
    case 'SELLER_QA_DETAILS':
      // QA is currently handled within the AdDetailsPage
      return target ? `/ads/${target}#questions` : '/ads';

    case 'ADMIN_REPORT_DETAILS':
      return target ? `/admin/reports/${target}` : '/admin/reports';

    case 'ADMIN_TICKET_DETAILS':
      return target ? `/admin/tickets/${target}` : '/admin/tickets';

    case 'TICKET_DETAILS':
      return target ? `/profile/tickets/${target}` : '/profile/tickets';

    case 'SUPPORT_CENTER':
      return '/faq';

    case 'GETTING_STARTED':
      return '/about';

    default:
      return null;
  }
};
