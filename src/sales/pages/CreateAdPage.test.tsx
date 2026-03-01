import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAdPage from './CreateAdPage';
import { salesService } from '../services/salesService';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from '../../store';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

vi.mock('../services/salesService', () => ({
  salesService: {
    createAd: vi.fn(),
    getAllowedCurrencies: vi.fn(),
  },
}));

const renderCreateAdPage = () => {
  return render(
    <Provider store={createStore()}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <MemoryRouter>
            <CreateAdPage />
          </MemoryRouter>
        </AuthProvider>
      </I18nextProvider>
    </Provider>
  );
};

describe('CreateAdPage Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(salesService.getAllowedCurrencies).mockResolvedValue({
      settlementCurrencies: [
        { code: 'ARRR', name: 'Pirate Chain' }
      ],
      referenceCurrencies: [
        { code: 'USD', name: 'US Dollar' }
      ]
    });
  });

  it('should activate Save button only when title length is at least 5 characters', async () => {
    renderCreateAdPage();
    
    const titleInput = await screen.findByPlaceholderText(/Title/i);
    const saveButton = screen.getByRole('button', { name: /Save/i });
    
    // Initially disabled
    expect(saveButton).toBeDisabled();
    
    // Type 3 characters (current minLength is 3, but should be 5)
    fireEvent.change(titleInput, { target: { value: 'abc' } });
    
    // In current implementation (mode: onBlur), isValid won't update until blur
    // After my changes (mode: onChange), it should still be disabled because length < 5
    expect(saveButton).toBeDisabled();
    
    // Type 4 characters
    fireEvent.change(titleInput, { target: { value: 'abcd' } });
    expect(saveButton).toBeDisabled();
    
    // Type 5 characters
    fireEvent.change(titleInput, { target: { value: 'abcde' } });
    
    // Should be enabled now
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('should not show error while typing (focused)', async () => {
    renderCreateAdPage();
    
    const titleInput = await screen.findByPlaceholderText(/Title/i);
    
    // Focus and type something too short
    fireEvent.focus(titleInput);
    fireEvent.change(titleInput, { target: { value: 'abc' } });
    
    // Should not show error while focused
    expect(screen.queryByText(/Must be at least/i)).not.toBeInTheDocument();
    
    // Blur
    fireEvent.blur(titleInput);
    
    // Now it should show error (and it should say 5 characters)
    await waitFor(() => {
      expect(screen.getByText(/Must be at least 5 characters/i)).toBeInTheDocument();
    });
  });
});
