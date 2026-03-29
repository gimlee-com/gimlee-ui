import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { Select } from '../../../components/uikit/Form/Form';
import { ticketService } from '../../../services/ticketService';
import type { TicketCategory, CreateTicketDto } from '../../../admin/types/adminTicket';

interface CreateTicketFormProps {
  onSuccess: () => void;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  'ACCOUNT_ISSUE',
  'PAYMENT_PROBLEM',
  'ORDER_DISPUTE',
  'TECHNICAL_BUG',
  'FEATURE_REQUEST',
  'SAFETY_CONCERN',
  'OTHER',
];

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();

  type CreateTicketFormValues = Omit<CreateTicketDto, 'category'> & { category: TicketCategory | '' };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateTicketFormValues>({
    mode: 'onBlur',
    defaultValues: { subject: '', category: '', body: '' },
  });

  const onSubmit = async (data: CreateTicketFormValues) => {
    try {
      const dto: CreateTicketDto = {
        subject: data.subject,
        category: data.category as TicketCategory,
        body: data.body,
      };
      await ticketService.createTicket(dto);
      UIkit.notification({
        message: t('tickets.success'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
      reset();
      onSuccess();
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err)
        ? (err as { message: string }).message
        : t('tickets.error');
      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="uk-card-title">{t('tickets.createTicket')}</h3>

      <div className="uk-margin">
        <label className="uk-form-label">{t('tickets.subject')}</label>
        <div className="uk-form-controls">
          <input
            className={`uk-input${errors.subject ? ' uk-form-danger' : ''}`}
            type="text"
            placeholder={t('tickets.subjectPlaceholder')}
            {...register('subject', {
              required: t('tickets.subjectRequired'),
            })}
          />
          {errors.subject && (
            <p className="uk-text-danger uk-text-small uk-margin-small-top">
              {errors.subject.message}
            </p>
          )}
        </div>
      </div>

      <div className="uk-margin">
        <label className="uk-form-label">{t('tickets.category')}</label>
        <div className="uk-form-controls">
          <Select
            status={errors.category ? 'danger' : undefined}
            {...register('category', {
              required: t('tickets.categoryRequired'),
              validate: (v) => v !== '' || t('tickets.categoryRequired'),
            })}
          >
            <option value="">{t('tickets.categoryPlaceholder')}</option>
            {TICKET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`admin.helpdesk.category.${cat}`)}
              </option>
            ))}
          </Select>
          {errors.category && (
            <p className="uk-text-danger uk-text-small uk-margin-small-top">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      <div className="uk-margin">
        <label className="uk-form-label">{t('tickets.body')}</label>
        <div className="uk-form-controls">
          <textarea
            className={`uk-textarea${errors.body ? ' uk-form-danger' : ''}`}
            rows={5}
            placeholder={t('tickets.bodyPlaceholder')}
            {...register('body', {
              required: t('tickets.bodyRequired'),
              minLength: {
                value: 10,
                message: t('tickets.bodyMinLength', { count: 10 }),
              },
            })}
          />
          {errors.body && (
            <p className="uk-text-danger uk-text-small uk-margin-small-top">
              {errors.body.message}
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
          {isSubmitting ? t('common.loading') : t('tickets.submitTicket')}
        </button>
      </div>
    </form>
  );
};

export default CreateTicketForm;
