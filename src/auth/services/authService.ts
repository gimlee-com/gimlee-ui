import { apiClient } from '../../services/apiClient';
import type { 
  LoginRequestDto, 
  RegisterRequestDto, 
  IdentityVerificationResponse, 
  AvailabilityStatusResponseDto, 
  VerifyUserRequestDto,
  ChangePasswordRequestDto,
  StatusResponseDto,
} from '../../types/api';

export const authService = {
  login: (data: LoginRequestDto) => 
    apiClient.post<IdentityVerificationResponse>('/auth/login', {
      ...data,
      deviceId: apiClient.getDeviceId(),
    }),

  register: (data: RegisterRequestDto) => 
    apiClient.post<void>('/auth/register', data),

  verifyUser: (data: VerifyUserRequestDto) =>
    apiClient.post<IdentityVerificationResponse>('/auth/verifyUser', {
      ...data,
      deviceId: apiClient.getDeviceId(),
    }),

  checkUsername: (username: string) =>
    apiClient.post<AvailabilityStatusResponseDto>('/auth/register/usernameAvailable', { username }),

  checkEmail: (email: string) =>
    apiClient.post<AvailabilityStatusResponseDto>('/auth/register/emailAvailable', { email }),

  logout: () => {
    const refreshToken = apiClient.getRefreshToken();
    return apiClient.post<StatusResponseDto>('/auth/logout', refreshToken ? { refreshToken } : undefined);
  },

  revokeAllSessions: () =>
    apiClient.post<StatusResponseDto>('/auth/sessions/revoke-all'),

  changePassword: (data: ChangePasswordRequestDto) =>
    apiClient.post<StatusResponseDto>('/auth/changePassword', data),
};
