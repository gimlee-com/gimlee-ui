import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authService } from '../services/authService';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const renderLoginPage = (initialEntries = ['/login']) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<div>Verify Page</div>} />
            <Route path="/target" element={<div>Target Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nextProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to home page after login if no redirect param is present', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      success: true,
      accessToken: 'fake.e30.signature',
    });

    renderLoginPage();

    fireEvent.change(await screen.findByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'Password123' } });
    
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'Password123',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('should navigate to redirect path after login if redirect param is present', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      success: true,
      accessToken: 'fake.e30.signature',
    });

    renderLoginPage(['/login?redirect=%2Ftarget']);

    fireEvent.change(await screen.findByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'Password123' } });
    
    const submitButton = screen.getByRole('button', { name: /Login/i });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Target Page')).toBeInTheDocument();
    });
  });

  it('should display success alert when registered=true', async () => {
    renderLoginPage(['/login?registered=true&email=test@example.com']);
    expect(await screen.findByText(/Your account has been registered/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('should display login required alert when reason=unauthorized', async () => {
    renderLoginPage(['/login?reason=unauthorized']);
    expect(await screen.findByText(/Almost there/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register here/i })).toHaveAttribute('href', '/register');
  });

  it('should navigate to verify page if user has UNVERIFIED role', async () => {
    const unverifiedToken = 'fake.eyJyb2xlcyI6WyJVTlZFUklGSUVEIl19.fake';
    vi.mocked(authService.login).mockResolvedValue({
      success: true,
      accessToken: unverifiedToken,
    });

    renderLoginPage();

    fireEvent.change(await screen.findByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'Password123' } });
    
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Verify Page')).toBeInTheDocument();
    });
  });
});
