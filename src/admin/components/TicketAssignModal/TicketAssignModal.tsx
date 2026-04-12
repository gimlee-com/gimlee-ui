import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useUIKit } from '../../../hooks/useUIkit';

interface AssignFormValues {
  assigneeUserId: string;
}

interface StaffMember {
  userId: string;
  username: string;
  displayName: string;
}

interface TicketAssignModalProps {
  isOpen: boolean;
  onConfirm: (assigneeUserId: string) => void;
  onClose: () => void;
  staff: StaffMember[];
}

const TicketAssignModal: React.FC<TicketAssignModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  staff,
}) => {
  const { t } = useTranslation();
  const { ref: modalRef, instance } = useUIKit<
    { show: () => void; hide: () => void },
    HTMLDivElement
  >('modal', { container: false, stack: true });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<AssignFormValues>({
    mode: 'onChange',
    defaultValues: { assigneeUserId: '' },
  });

  const handleHide = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!instance) return;
    if (isOpen) {
      instance.show();
    } else {
      instance.hide();
    }
  }, [isOpen, instance]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    el.addEventListener('hidden', handleHide);
    return () => el.removeEventListener('hidden', handleHide);
  }, [handleHide]);

  const onSubmit = (data: AssignFormValues) => {
    onConfirm(data.assigneeUserId);
    reset();
  };

  return createPortal(
    <div ref={modalRef} className="uk-modal-container">
      <div className="uk-modal-dialog">
        <button className="uk-modal-close-default" type="button" uk-close="" />
        <div className="uk-modal-header">
          <h2 className="uk-modal-title">{t('admin.helpdesk.assign.title')}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="uk-modal-body">
            <p className="uk-text-meta">{t('admin.helpdesk.assign.description')}</p>
            <div className="uk-margin">
              <label className="uk-form-label">{t('admin.helpdesk.assign.selectStaff')}</label>
              <div className="uk-form-controls">
                <select
                  className="uk-select"
                  {...register('assigneeUserId', { required: true })}
                >
                  <option value="">{t('admin.helpdesk.assign.placeholder')}</option>
                  {staff.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.displayName} (@{member.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="uk-modal-footer uk-text-right">
            <button
              className="uk-button uk-button-default uk-modal-close uk-margin-small-right"
              type="button"
            >
              {t('common.cancel')}
            </button>
            <button className="uk-button uk-button-primary" type="submit" disabled={!isValid}>
              {t('admin.helpdesk.assign.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('root') || document.body
  );
};

export default TicketAssignModal;
