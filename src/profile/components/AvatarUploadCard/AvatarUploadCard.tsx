import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../services/userService';
import { apiClient } from '../../../services/apiClient';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Heading } from '../../../components/uikit/Heading/Heading';
import { Button } from '../../../components/uikit/Button/Button';
import { Image } from '../../../components/Image/Image';
import { GeometricAvatar } from '../../../components/GeometricAvatar/GeometricAvatar';
import type { MediaUploadResponseDto } from '../../../types/api';

const API_URL = import.meta.env.VITE_API_URL || '';

const AvatarUploadCard: React.FC = () => {
  const { t } = useTranslation();
  const { userProfile, username, refreshSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const avatarUrl = userProfile?.avatarUrl || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<MediaUploadResponseDto>(
        '/media/upload/single',
        formData,
      );

      await userService.updateAvatar({ avatarUrl: response.path });
      await refreshSession();

      UIkit.notification({
        message: t('profile.avatar.uploadSuccess'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : t('profile.avatar.uploadError');
      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000,
      });
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="uk-margin-bottom">
      <CardBody>
        <Heading as="h4">{t('profile.avatar.title')}</Heading>

        <div className="uk-flex uk-flex-column uk-flex-middle" style={{ gap: '16px' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden' }}>
            {avatarUrl ? (
              <Image
                src={`${API_URL}/api/media?p=${avatarUrl}`}
                alt={username || ''}
                containerStyle={{ width: 100, height: 100 }}
              />
            ) : (
              <GeometricAvatar username={username || '?'} size={100} />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Button
            type="button"
            variant="default"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <span uk-spinner="ratio: 0.5" />
            ) : (
              t('profile.avatar.change')
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AvatarUploadCard;
