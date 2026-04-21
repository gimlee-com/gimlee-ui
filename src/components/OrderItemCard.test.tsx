import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import { OrderItemCard } from './OrderItemCard';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import type { PurchaseHistoryDto, SalesOrderDto } from '../types/api';

const mockPurchase: PurchaseHistoryDto = {
  id: 'order-123',
  status: 'AWAITING_PAYMENT',
  paymentStatus: 'Awaiting',
  createdAt: '2024-01-01T12:00:00Z',
  totalAmount: 10,
  currency: 'ARRR',
  items: [{ adId: 'ad-1', title: 'Test Product', quantity: 1, unitPrice: 10 }],
  seller: { id: 'seller-1', username: 'test-seller' }
};

const mockSale: SalesOrderDto = {
  id: 'order-456',
  status: 'COMPLETE',
  paymentStatus: 'Paid',
  createdAt: '2024-01-02T12:00:00Z',
  totalAmount: 20,
  currency: 'ARRR',
  items: [{ adId: 'ad-2', title: 'Test Sale Product', quantity: 2, unitPrice: 10 }],
  buyer: { id: 'buyer-1', username: 'test-buyer' }
};

describe('OrderItemCard', () => {
  it('should render purchase details', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <OrderItemCard order={mockPurchase} type="purchase" />
          </I18nextProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('test-seller')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render sale details', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <OrderItemCard order={mockSale} type="sale" />
          </I18nextProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('test-buyer')).toBeInTheDocument();
    expect(screen.getByText('Test Sale Product')).toBeInTheDocument();
  });
});
