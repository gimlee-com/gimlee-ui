import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FloatingButtonPortal } from '../../../components/FloatingButton/FloatingButtonPortal';
import { Chat } from '../Chat/Chat';
import { Modal, ModalDialog, ModalBody, ModalHeader, ModalTitle, ModalCloseDefault } from '../../../components/uikit/Modal/Modal';
import { useUIKit } from '../../../hooks/useUIkit';
import { Icon } from '../../../components/uikit/Icon/Icon';
import styles from '../../../components/FloatingButton/FloatingButton.module.scss';
import classNames from 'classnames';

interface ChatFloatingButtonProps {
  chatId: string;
  visible: boolean;
}

export const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({ chatId, visible }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { ref, instance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', { stack: true, container: false });

  const toggleModal = () => {
    if (!instance) return;
    if (isOpen) {
      instance.hide();
    } else {
      instance.show();
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleShow = () => setIsOpen(true);
    const handleHide = () => setIsOpen(false);

    el.addEventListener('show', handleShow);
    el.addEventListener('hidden', handleHide);

    return () => {
      el.removeEventListener('show', handleShow);
      el.removeEventListener('hidden', handleHide);
    };
  }, [ref]);

  return (
    <>
      <FloatingButtonPortal>
        {visible && (
          <button 
            className={classNames("uk-button uk-button-primary", styles.floatingButton)}
            onClick={toggleModal}
            title={t('chat.title')}
            type="button"
          >
            <Icon icon="comments" ratio={1.5} />
          </button>
        )}
      </FloatingButtonPortal>

      <Modal ref={ref} stack={true} container={false}>
        <ModalDialog className="uk-width-large">
          <ModalHeader>
            <ModalTitle>{t('chat.title')}</ModalTitle>
            <ModalCloseDefault />
          </ModalHeader>
          <ModalBody style={{ padding: 0, height: '70vh' }}>
            {isOpen && <Chat chatId={chatId} />}
          </ModalBody>
        </ModalDialog>
      </Modal>
    </>
  );
};
