import { describe, it, expect } from 'vitest';
import { mapSuggestedActionToUrl } from './suggestedActionUtils';
import type { SuggestedActionDto, NotificationCategory } from '../types/notification';

describe('mapSuggestedActionToUrl', () => {
  it('should map PURCHASE_LIST to /purchases', () => {
    const action: SuggestedActionDto = { type: 'PURCHASE_LIST' };
    expect(mapSuggestedActionToUrl(action, 'orders')).toBe('/purchases');
  });

  it('should map PURCHASE_DETAILS to /purchases', () => {
    const action: SuggestedActionDto = { type: 'PURCHASE_DETAILS' };
    expect(mapSuggestedActionToUrl(action, 'orders')).toBe('/purchases');
  });

  it('should map SALE_LIST to /sales/orders', () => {
    const action: SuggestedActionDto = { type: 'SALE_LIST' };
    expect(mapSuggestedActionToUrl(action, 'orders')).toBe('/sales/orders');
  });

  it('should map SALE_DETAILS to /sales/orders', () => {
    const action: SuggestedActionDto = { type: 'SALE_DETAILS' };
    expect(mapSuggestedActionToUrl(action, 'orders')).toBe('/sales/orders');
  });

  it('should map AD_DETAILS with target to /ads/:id', () => {
    const action: SuggestedActionDto = { type: 'AD_DETAILS', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'ads')).toBe('/ads/123');
  });

  it('should map AD_DETAILS without target to /ads', () => {
    const action: SuggestedActionDto = { type: 'AD_DETAILS' };
    expect(mapSuggestedActionToUrl(action, 'ads')).toBe('/ads');
  });

  it('should map SELLER_AD_DETAILS to /sales/ads', () => {
    const action: SuggestedActionDto = { type: 'SELLER_AD_DETAILS' };
    expect(mapSuggestedActionToUrl(action, 'ads')).toBe('/sales/ads');
  });

  it('should map AD_EDIT to /sales/ads/edit/:id', () => {
    const action: SuggestedActionDto = { type: 'AD_EDIT', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'ads')).toBe('/sales/ads/edit/123');
  });

  it('should map BUYER_QA_DETAILS to /ads/:id#questions', () => {
    const action: SuggestedActionDto = { type: 'BUYER_QA_DETAILS', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'qa')).toBe('/ads/123#questions');
  });

  it('should map SELLER_QA_DETAILS to /ads/:id#questions', () => {
    const action: SuggestedActionDto = { type: 'SELLER_QA_DETAILS', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'qa')).toBe('/ads/123#questions');
  });

  it('should map ADMIN_REPORT_DETAILS to /admin/reports/:id', () => {
    const action: SuggestedActionDto = { type: 'ADMIN_REPORT_DETAILS', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'admin')).toBe('/admin/reports/123');
  });

  it('should map ADMIN_TICKET_DETAILS to /admin/tickets/:id', () => {
    const action: SuggestedActionDto = { type: 'ADMIN_TICKET_DETAILS', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'admin')).toBe('/admin/tickets/123');
  });

  it('should map TICKET_DETAILS to /profile/tickets/:id', () => {
    const action: SuggestedActionDto = { type: 'TICKET_DETAILS', target: '123' };
    expect(mapSuggestedActionToUrl(action, 'profile')).toBe('/profile/tickets/123');
  });

  it('should map SUPPORT_CENTER to /faq', () => {
    expect(mapSuggestedActionToUrl({ type: 'SUPPORT_CENTER' }, 'support')).toBe('/faq');
  });

  it('should map GETTING_STARTED to /about', () => {
    const action: SuggestedActionDto = { type: 'GETTING_STARTED' };
    expect(mapSuggestedActionToUrl(action, 'account')).toBe('/about');
  });

  it('should return null for unknown type', () => {
    const action = { type: 'UNKNOWN' } as any;
    expect(mapSuggestedActionToUrl(action, 'system' as any)).toBeNull();
  });
});
