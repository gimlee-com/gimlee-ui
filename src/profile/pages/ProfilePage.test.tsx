import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './ProfilePage';
import { AuthProvider } from '../../context/AuthContext';
import { PresenceProvider } from '../../context/PresenceContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { userService } from '../services/userService';
import { paymentService } from '../../payments/services/paymentService';
import { apiClient } from '../../services/apiClient';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/presenceService', () => ({
  presenceService: {
    ping: vi.fn(),
    getMyPresence: vi.fn().mockResolvedValue({ status: 'ONLINE', userId: '1' }),
    updateMyPresence: vi.fn(),
    getUserPresence: vi.fn(),
  },
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <div {...props}>{children as React.ReactNode}</div>,
    input: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <input {...props}>{children as React.ReactNode}</input>,
    form: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <form {...props}>{children as React.ReactNode}</form>,
    label: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <label {...props}>{children as React.ReactNode}</label>,
    fieldset: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <fieldset {...props}>{children as React.ReactNode}</fieldset>,
    legend: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <legend {...props}>{children as React.ReactNode}</legend>,
    textarea: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <textarea {...props}>{children as React.ReactNode}</textarea>,
    select: ({ children, layout: _layout, initial: _initial, animate: _animate, exit: _exit, transition: _transition, variants: _variants, ...props }: Record<string, unknown>) => <select {...props}>{children as React.ReactNode}</select>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../services/userService', () => ({
  userService: {
    getUserPreferences: vi.fn(),
    updateUserPreferences: vi.fn(),
  },
}));

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../../payments/services/paymentService', () => ({
  paymentService: {
    getCurrencies: vi.fn().mockResolvedValue([]),
    getPirateChainTransactions: vi.fn().mockResolvedValue([]),
    addPirateChainViewKey: vi.fn(),
    getYCashTransactions: vi.fn().mockResolvedValue([]),
    addYCashViewKey: vi.fn(),
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'USD' });
  });

  const renderProfilePage = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <AuthProvider>
            <PresenceProvider>
              <MemoryRouter>
                <ProfilePage />
              </MemoryRouter>
            </PresenceProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nextProvider>
    );
  };

  it('should call updateUserPreferences when language is changed and user is authenticated', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'fake-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'USD' });

    renderProfilePage();

    const polishButton = await screen.findByRole('button', { name: /Polski/i });
    fireEvent.click(polishButton);

    expect(i18n.language).toBe('pl-PL');
    expect(localStorage.setItem).toHaveBeenCalled();
    await waitFor(() => {
      expect(userService.updateUserPreferences).toHaveBeenCalledWith({ language: 'pl-PL' });
    });
  });

  it('should NOT call updateUserPreferences when language is changed and user is NOT authenticated', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: '',
      userProfile: null
    });

    renderProfilePage();

    const englishButton = await screen.findByRole('button', { name: /English/i });
    fireEvent.click(englishButton);

    expect(i18n.language).toBe('en-US');
    expect(userService.updateUserPreferences).not.toHaveBeenCalled();
  });

  it('should hide transaction lists by default and toggle them on button click', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'fake-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    
    const mockTxs = [{ txid: 'test-transaction-id', amount: 10, confirmations: 1, zAddress: 'addr1' }];
    vi.mocked(paymentService.getPirateChainTransactions).mockResolvedValue(mockTxs);

    renderProfilePage();

    // Should not show transaction id initially
    expect(screen.queryByText(/test-transac/i)).not.toBeInTheDocument();

    // Click show transactions button for ARRR
    const showButtons = await screen.findAllByRole('button', { name: /Show Recent Transactions/i });
    fireEvent.click(showButtons[0]);

    // Now it should show the transaction
    const txElement = await screen.findByText(/test-transac/i);
    expect(txElement).toBeInTheDocument();

    // Click hide
    const hideButton = await screen.findByRole('button', { name: /Hide Recent Transactions/i });
    fireEvent.click(hideButton);

    await waitFor(() => {
      expect(screen.queryByText(/test-transac/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display error message below input when viewing key update fails', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'fake-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    
    vi.mocked(paymentService.addPirateChainViewKey).mockRejectedValue(new Error('Invalid key format'));

    renderProfilePage();

    const inputs = await screen.findAllByPlaceholderText(/Enter your zxview/i);
    const input = inputs[0];
    fireEvent.change(input, { target: { value: 'bad-key' } });
    
    const saveButtons = screen.getAllByRole('button', { name: /Save Key/i });
    const saveButton = saveButtons[0];
    fireEvent.click(saveButton);
    
    // Blur the input to show the error (Guideline C)
    fireEvent.blur(input);

    const errorMessage = await screen.findByText(/Invalid key format/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.tagName).toBe('SMALL');
    
    // Test that it disappears on focus
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.queryByText(/Invalid key format/i)).not.toBeInTheDocument();
    });
  });

  it('should show error message immediately when submitting with ENTER even if input is focused', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'fake-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    
    vi.mocked(paymentService.addPirateChainViewKey).mockRejectedValue(new Error('Invalid key format'));

    renderProfilePage();

    const inputs = await screen.findAllByPlaceholderText(/Enter your zxview/i);
    const input = inputs[0];
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'bad-key' } });
    
    // Press ENTER (triggers submit on the form)
    fireEvent.submit(input.closest('form')!);
    
    // It should show error immediately even if it still has focus
    // This is expected to FAIL before the fix
    await waitFor(() => {
      expect(screen.getByText(/Invalid key format/i)).toBeInTheDocument();
    });
  });

  it('should have a 100-character limit on the custom status input', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'fake-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    
    renderProfilePage();

    const input = await screen.findByPlaceholderText(/What's on your mind?/i);
    expect(input).toHaveAttribute('maxLength', '100');
  });
});
