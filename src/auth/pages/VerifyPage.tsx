import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/uikit/Button/Button';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Form, Input, FormControls, FormMessage, AnimatePresence, motion } from '../../components/Form/Form';
import type { VerifyUserRequestDto } from '../../types/api';

const VerifyPage: React.FC = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<VerifyUserRequestDto>({
    mode: 'onChange'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onVerifySubmit = async (data: VerifyUserRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyUser(data);
      if (response && response.success && response.accessToken) {
        await login(response.accessToken);
        navigate('/');
      } else {
        setError(response.message || t('auth.errors.generic'));
      }
    } catch (err: unknown) {
      setError((err as Error).message || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="uk-flex uk-flex-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <div className="uk-card uk-card-default uk-card-body uk-width-large">
        <Heading as="h3" className="uk-text-center">{t('auth.verifyTitle')}</Heading>
        <p className="uk-text-center">{t('auth.verifyText')}</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit(onVerifySubmit)}>
          <motion.div layout className="uk-margin">
            <FormControls>
              <Input
                {...register('code', { required: t('auth.errors.required', { field: t('auth.verifyPlaceholder') }) })}
                status={errors.code ? 'danger' : undefined}
                type="text"
                placeholder={t('auth.verifyPlaceholder')}
              />
              <AnimatePresence>
                {errors.code && <FormMessage>{errors.code.message}</FormMessage>}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <Button type="submit" variant="primary" className="uk-width-1-1" disabled={!isValid || loading}>
              {loading ? t('auth.verifying') : t('auth.verifyButton')}
            </Button>
          </motion.div>
        </Form>
      </div>
    </motion.div>
  );
};

export default VerifyPage;
