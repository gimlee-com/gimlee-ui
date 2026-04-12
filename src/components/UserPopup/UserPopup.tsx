import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import UIkit from 'uikit';
import { AvatarWithPresence } from '../AvatarWithPresence';
import { PresenceBadge } from '../../profile/components/PresenceBadge';
import { presenceService } from '../../profile/services/presenceService';
import { Modal, ModalDialog, ModalBody, ModalCloseDefault } from '../uikit/Modal/Modal';
import { Dropdown, type DropdownProps } from '../uikit/Dropdown/Dropdown';
import type { PresenceStatus } from '../../types/api';
import { useUIKit } from '../../hooks/useUIkit';

interface UserPopupProps {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  status?: PresenceStatus;
  customStatus?: string;
  children: React.ReactNode;
  pos?: DropdownProps['pos'];
  dropdownContainer?: HTMLElement | null;
}

export const UserPopup: React.FC<UserPopupProps> = ({ 
  userId,
  username, 
  avatarUrl, 
  status,
  customStatus,
  children,
  pos = 'bottom-left',
  dropdownContainer
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleEl, setToggleEl] = useState<HTMLDivElement | null>(null);
  const [currentStatus, setCurrentStatus] = useState<PresenceStatus | undefined>(status);
  const [currentCustomStatus, setCurrentCustomStatus] = useState<string | undefined>(customStatus);
  
  const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
    container: false
  });

  const fetchPresence = useCallback(async () => {
    if (!userId) return;
    try {
      const presence = await presenceService.getUserPresence(userId);
      setCurrentStatus(presence.status);
      setCurrentCustomStatus(presence.customStatus);
    } catch (err) {
      console.error('Failed to fetch user presence', err);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing prop to local state for modal display
    setCurrentStatus(status);
    setCurrentCustomStatus(customStatus);
  }, [status, customStatus]);

  useEffect(() => {
    const element = modalRef.current;
    if (!element) return;

    const handleShow = () => {
      fetchPresence();
    };

    const handleHidden = () => {
      setIsModalOpen(false);
    };

    UIkit.util.on(element, 'show', handleShow);
    UIkit.util.on(element, 'hidden', handleHidden);
    
    return () => {
      UIkit.util.off(element, 'show', handleShow);
      UIkit.util.off(element, 'hidden', handleHidden);
    };
  }, [modalRef, fetchPresence]);

  const dropdownCleanupRef = React.useRef<(() => void) | null>(null);
  const onDropdownRef = useCallback((el: HTMLDivElement | null) => {
    if (dropdownCleanupRef.current) {
      dropdownCleanupRef.current();
      dropdownCleanupRef.current = null;
    }
    if (el) {
      UIkit.util.on(el, 'show', fetchPresence);
      dropdownCleanupRef.current = () => UIkit.util.off(el, 'show', fetchPresence);
    }
  }, [fetchPresence]);

  useEffect(() => {
    if (modalInstance) {
      if (isModalOpen) {
        modalInstance.show();
      } else {
        modalInstance.hide();
      }
    }
  }, [isModalOpen, modalInstance]);

  useEffect(() => {
    const element = modalRef.current;
    if (!element) return;

    const handleHidden = () => {
      setIsModalOpen(false);
    };

    UIkit.util.on(element, 'hidden', handleHidden);
    return () => {
      UIkit.util.off(element, 'hidden', handleHidden);
    };
  }, [modalRef]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 960;
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  }, []);

  const content = (
    <div className="uk-padding-small">
      <div className="uk-flex uk-flex-column uk-flex-middle">
        <AvatarWithPresence 
          username={username} 
          avatarUrl={avatarUrl} 
          status={currentStatus} 
          customStatus={currentCustomStatus}
          size={64} 
          badgeSize={16}
        />
        <div className="uk-margin-small-top uk-text-bold uk-text-large">{username}</div>
        <PresenceBadge 
          status={currentStatus} 
          customStatus={currentCustomStatus} 
          className="uk-margin-small-top"
        />
        <Link 
          to={`/u/${username}`} 
          state={{ from: location.pathname + location.search }}
          className="uk-button uk-button-text uk-margin-small-top"
          onClick={() => setIsModalOpen(false)}
        >
          {t('spaces.viewSpace')}
        </Link>
      </div>
    </div>
  );

  const modalContent = (
    <Modal ref={modalRef} className="uk-hidden@m" container="#root">
      <ModalDialog className="uk-margin-auto-vertical uk-width-medium">
        <ModalCloseDefault />
        <ModalBody>
          {content}
        </ModalBody>
      </ModalDialog>
    </Modal>
  );

  const dropdown = (
    <Dropdown 
      ref={onDropdownRef}
      className="uk-visible@m" 
      mode="click" 
      pos={pos}
      shift={true}
      flip={true}
      toggle={toggleEl}
      container={false}
    >
      {content}
    </Dropdown>
  );

  return (
    <>
      <div 
        ref={setToggleEl}
        className="uk-inline" 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        {children}
        {!dropdownContainer && dropdown}
      </div>

      {dropdownContainer && createPortal(dropdown, dropdownContainer)}
      {modalContent}
    </>
  );
};
