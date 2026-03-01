import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VerifyPage from './VerifyPage';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authService } from '../services/authService';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

vi.mock('../services/authService', () => ({
  authService: {
    verifyUser: vi.fn(),
  },
}));

const renderVerifyPage = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/verify']}>
          <Routes>
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nextProvider>
  );
};

describe('VerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to home page after successful verification', async () => {
    vi.mocked(authService.verifyUser).mockResolvedValue({
      success: true,
      accessToken: 'new-valid-token',
    });

    renderVerifyPage();

    fireEvent.change(await screen.findByPlaceholderText(/Verification code/i), { target: { value: '123456' } });
    
    const submitButton = screen.getByRole('button', { name: /Verify/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.verifyUser).toHaveBeenCalledWith({ code: '123456' });
    });

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('should display error message on verification failure', async () => {
    vi.mocked(authService.verifyUser).mockRejectedValue({
      message: 'Invalid code',
    });

    renderVerifyPage();

    fireEvent.change(await screen.findByPlaceholderText(/Verification code/i), { target: { value: 'wrong' } });
    
    const submitButton = screen.getByRole('button', { name: /Verify/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid code')).toBeInTheDocument();
    });
  });
});
