import { apiClient } from '../../services/apiClient';
import type {
  UserPreferencesDto,
  UpdateUserPreferencesRequestDto,
  DeliveryAddressDto,
  AddDeliveryAddressRequestDto,
  UpdateAvatarRequestDto,
  StatusResponseDto,
} from '../../types/api';

export const userService = {
  getUserPreferences: () => 
    apiClient.get<UserPreferencesDto>('/user/preferences'),
  
  updateUserPreferences: (data: UpdateUserPreferencesRequestDto) => 
    apiClient.patch<UserPreferencesDto>('/user/preferences', data),

  getDeliveryAddresses: () =>
    apiClient.get<DeliveryAddressDto[]>('/user/delivery-addresses/'),

  addDeliveryAddress: (data: AddDeliveryAddressRequestDto) =>
    apiClient.post<StatusResponseDto>('/user/delivery-addresses', data),

  updateAvatar: (data: UpdateAvatarRequestDto) =>
    apiClient.put<StatusResponseDto>('/user/profile/avatar', data),
};
