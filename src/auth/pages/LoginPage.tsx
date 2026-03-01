import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../services/authService';
import { hasRole } from '../utils/jwt';
import type { LoginRequestDto } from '../../types/api';
import { Button } from '../../components/uikit/Button/Button';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Form, FormLabel, FormControls, Input, FormMessage, AnimatePresence, motion } from '../../components/Form/Form';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginRequestDto>({
    mode: 'onChange'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email');
  const loginRequired = searchParams.get('reason') === 'unauthorized';
  const location = useLocation();

  const redirect = searchParams.get('redirect') || location.state?.from || '/';

  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

  const validatePassword = (value: string | undefined) => {
    if (!value) return true;
    return passwordRule.test(value);
  };

  const onSubmit = async (data: LoginRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      if (response.success && response.accessToken) {
        await authLogin(response.accessToken);
        
        if (hasRole(response.accessToken, 'UNVERIFIED')) {
          navigate('/verify');
        } else {
          navigate(redirect, { 
            state: { from: location.state?.backContext },
            replace: true
          });
        }
      } else {
        setError(response.message || t('auth.errors.loginFailed'));
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
        <Heading as="h3" className="uk-text-center">{t('auth.loginTitle')}</Heading>
        {registered && (
          <Alert variant="primary">
            {t('auth.registrationSuccess', { email: registeredEmail })}
          </Alert>
        )}
        {loginRequired && (
          <Alert variant="primary">
            <Trans i18nKey="auth.loginRequired">
              Almost there! Please log in to access the requested page. New to Gimlee? <Link to="/register">Register here</Link>.
            </Trans>
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form layout="stacked" onSubmit={handleSubmit(onSubmit)}>
          <motion.div layout className="uk-margin">
            <FormLabel>{t('auth.username')}</FormLabel>
            <FormControls>
              <Input
                {...register('username', { required: t('auth.errors.required', { field: t('auth.username') }) })}
                status={errors.username ? 'danger' : undefined}
                type="text"
                placeholder={t('auth.username')}
              />
              <AnimatePresence>
                {errors.username && <FormMessage>{errors.username.message}</FormMessage>}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <FormLabel>{t('auth.password')}</FormLabel>
            <FormControls>
              <Input
                {...register('password', { 
                  required: t('auth.errors.required', { field: t('auth.password') }),
                  validate: validatePassword
                })}
                status={errors.password && errors.password.type === 'required' ? 'danger' : undefined}
                type="password"
                placeholder={t('auth.password')}
              />
              <AnimatePresence>
                {errors.password && errors.password.type === 'required' && (
                  <FormMessage>{errors.password.message}</FormMessage>
                )}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <Button type="submit" variant="primary" className="uk-width-1-1" disabled={!isValid || loading}>
              {loading ? t('auth.loggingIn') : t('auth.loginTitle')}
            </Button>
          </motion.div>
        </Form>
        <div className="uk-text-center uk-margin-top">
          {t('auth.noAccount')} <Link to="/register">{t('navbar.register')}</Link>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
