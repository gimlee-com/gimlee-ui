import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { authService } from '../services/authService';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

vi.mock('../services/authService', () => ({
  authService: {
    checkUsername: vi.fn(),
    checkEmail: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('../../services/locationService', () => ({
  locationService: {
    detectCountry: vi.fn().mockResolvedValue(null),
    listCountries: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    get: vi.fn(),
  },
}));

const renderRegisterPage = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </AuthProvider>
    </I18nextProvider>
  );
};

describe('RegisterPage Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.checkUsername).mockResolvedValue({ available: true });
    vi.mocked(authService.checkEmail).mockResolvedValue({ available: true });
  });

  it('should not show email invalid error while typing (focused)', async () => {
    renderRegisterPage();
    
    const emailInput = await screen.findByPlaceholderText(/Email/i);
    
    // Start typing invalid email
    fireEvent.focus(emailInput);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // It should NOT show error yet because it is focused
    // Wait a bit for potential debounce or onChange triggers
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
    
    // Blur the input
    fireEvent.blur(emailInput);
    
    // Now it should show error
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should not show confirm password error when typing in password field', async () => {
    renderRegisterPage();
    
    const passwordInput = await screen.findByPlaceholderText(/^Password$/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/Confirm Password/i);
    
    // Start typing in password field
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    // It should NOT show "Confirm password is required" error yet
    // because user hasn't interacted with confirm password field
    expect(screen.queryByText(/Confirm password is required/i)).not.toBeInTheDocument();
    
    // Focus and blur confirm password to trigger validation
    fireEvent.focus(confirmPasswordInput);
    fireEvent.blur(confirmPasswordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Confirm password is required/i)).toBeInTheDocument();
    });
  });
});
