import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ReplyToTicketDto } from '../../types/adminTicket';

interface TicketReplyFormProps {
  onSubmit: (dto: ReplyToTicketDto) => void;
  isSubmitting: boolean;
}

const TicketReplyForm: React.FC<TicketReplyFormProps> = ({ onSubmit, isSubmitting }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ReplyToTicketDto>({
    mode: 'onBlur',
    defaultValues: { body: '' },
  });

  const handleFormSubmit = (data: ReplyToTicketDto) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="uk-margin">
        <label className="uk-form-label">{t('admin.helpdesk.reply.label')}</label>
        <div className="uk-form-controls">
          <textarea
            className={`uk-textarea${errors.body ? ' uk-form-danger' : ''}`}
            rows={4}
            placeholder={t('admin.helpdesk.reply.placeholder')}
            {...register('body', {
              required: true,
              minLength: 1,
            })}
          />
          {errors.body && (
            <p className="uk-text-danger uk-text-small uk-margin-small-top">
              {t('admin.helpdesk.reply.required')}
            </p>
          )}
        </div>
      </div>
      <div className="uk-text-right">
        <button
          className="uk-button uk-button-primary"
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? t('common.loading') : t('admin.helpdesk.reply.submit')}
        </button>
      </div>
    </form>
  );
};

export default TicketReplyForm;
