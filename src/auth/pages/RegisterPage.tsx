import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { authService } from '../services/authService';
import type { RegisterRequestDto } from '../../types/api';
import { Button } from '../../components/uikit/Button/Button';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Form, FormLabel, FormControls, Input, FormMessage, AnimatePresence, motion } from '../../components/Form/Form';

interface RegisterFormValues extends RegisterRequestDto {
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors, isValid, touchedFields }, watch, trigger } = useForm<RegisterFormValues>({
    mode: 'onChange'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const password = watch('password');
  
  const timeoutRefs = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const resolveRefs = React.useRef<Record<string, (value: string | boolean | undefined) => void>>({});

  const debouncedValidate = (fieldName: string, fn: (value: string, values: RegisterFormValues) => Promise<string | boolean | undefined>) => {
    return (value: string, values: RegisterFormValues): Promise<string | boolean | undefined> => {
      if (timeoutRefs.current[fieldName]) {
        clearTimeout(timeoutRefs.current[fieldName]);
      }
      if (resolveRefs.current[fieldName]) {
        resolveRefs.current[fieldName](true);
      }
      return new Promise((resolve) => {
        resolveRefs.current[fieldName] = resolve;
        timeoutRefs.current[fieldName] = setTimeout(async () => {
          const result = await fn(value, values);
          resolve(result);
          delete resolveRefs.current[fieldName];
        }, 250);
      });
    };
  };

  const validateUsername = React.useMemo(() => debouncedValidate('username', async (value) => {
    if (!value) return true;
    try {
      const res = await authService.checkUsername(value);
      return res.available || t('auth.errors.usernameTaken');
    } catch {
      return t('auth.errors.generic') as string;
    }
  }), [t]);

  const validateEmailFormat = (value: string | undefined) => {
    if (!value) return true;
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value) || t('auth.errors.invalidEmail');
  };

  const validateEmailAvailability = React.useMemo(() => debouncedValidate('email', async (value) => {
    if (!value || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value)) return true;
    try {
      const res = await authService.checkEmail(value);
      return res.available || t('auth.errors.emailTaken');
    } catch {
      return t('auth.errors.generic') as string;
    }
  }), [t]);

  const validatePassword = (value: string | undefined) => {
    if (!value) return true;
    const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
    return passwordRule.test(value) || t('auth.errors.passwordRequirements');
  };

  const validateConfirmPassword = (value: string | undefined, values: RegisterFormValues) => {
    if (!value) return true;
    return value === values.password || t('auth.errors.passwordsDoNotMatch');
  };

  const usernameRegister = register('username', { 
    required: t('auth.errors.required', { field: t('auth.username') }),
    validate: validateUsername
  });

  const emailRegister = register('email', { 
    required: t('auth.errors.required', { field: t('auth.email') }),
    validate: {
      format: validateEmailFormat,
      availability: validateEmailAvailability
    }
  });

  const passwordRegister = register('password', { 
    required: t('auth.errors.required', { field: t('auth.password') }), 
    validate: validatePassword
  });

  const confirmPasswordRegister = register('confirmPassword', { 
    required: t('auth.errors.required', { field: t('auth.confirmPassword') }),
    validate: validateConfirmPassword
  });

  React.useEffect(() => {
    if (password) {
      trigger('confirmPassword');
    }
  }, [password, trigger]);

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...registerData } = data;
    setLoading(true);
    setError(null);
    try {
      await authService.register(registerData);
      navigate(`/login?registered=true&email=${encodeURIComponent(data.email)}`);
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
        <Heading as="h3" className="uk-text-center">{t('auth.registerTitle')}</Heading>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form layout="stacked" onSubmit={handleSubmit(onRegisterSubmit)}>
          <motion.div layout className="uk-margin">
            <FormLabel>{t('auth.username')}</FormLabel>
            <FormControls>
              <Input
                {...usernameRegister}
                onFocus={() => setUsernameFocused(true)}
                onBlur={(e) => {
                  usernameRegister.onBlur(e);
                  setUsernameFocused(false);
                }}
                status={errors.username && !usernameFocused && touchedFields.username ? 'danger' : undefined}
                type="text"
                placeholder={t('auth.username')}
              />
              <AnimatePresence>
                {errors.username && !usernameFocused && touchedFields.username && (
                  <FormMessage>{errors.username.message}</FormMessage>
                )}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <FormLabel>{t('auth.email')}</FormLabel>
            <FormControls>
              <Input
                {...emailRegister}
                onFocus={() => setEmailFocused(true)}
                onBlur={(e) => {
                  emailRegister.onBlur(e);
                  setEmailFocused(false);
                }}
                status={errors.email && !emailFocused && touchedFields.email ? 'danger' : undefined}
                type="email"
                placeholder={t('auth.email')}
              />
              <AnimatePresence>
                {errors.email && !emailFocused && touchedFields.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <FormLabel>{t('auth.password')}</FormLabel>
            <FormControls>
              <Input
                {...passwordRegister}
                onFocus={() => setPasswordFocused(true)}
                onBlur={(e) => {
                  passwordRegister.onBlur(e);
                  setPasswordFocused(false);
                }}
                status={errors.password && !passwordFocused && touchedFields.password ? 'danger' : undefined}
                type="password"
                placeholder={t('auth.password')}
              />
              <AnimatePresence>
                {(passwordFocused || (errors.password && touchedFields.password)) && (
                  <FormMessage type={passwordFocused ? 'info' : 'error'}>
                    {passwordFocused ? t('auth.errors.passwordRequirements') : errors.password?.message}
                  </FormMessage>
                )}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <FormLabel>{t('auth.confirmPassword')}</FormLabel>
            <FormControls>
              <Input
                {...confirmPasswordRegister}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={(e) => {
                  confirmPasswordRegister.onBlur(e);
                  setConfirmPasswordFocused(false);
                }}
                status={errors.confirmPassword && !confirmPasswordFocused && touchedFields.confirmPassword ? 'danger' : undefined}
                type="password"
                placeholder={t('auth.confirmPassword')}
              />
              <AnimatePresence>
                {errors.confirmPassword && (touchedFields.confirmPassword || confirmPasswordFocused) && (
                  confirmPasswordFocused ? (
                    errors.confirmPassword.type === 'validate' && (
                      <FormMessage type="info">{errors.confirmPassword.message}</FormMessage>
                    )
                  ) : (
                    <FormMessage type="error">{errors.confirmPassword.message}</FormMessage>
                  )
                )}
              </AnimatePresence>
            </FormControls>
          </motion.div>
          <motion.div layout className="uk-margin">
            <Button type="submit" variant="primary" className="uk-width-1-1" disabled={!isValid || loading}>
              {loading ? t('auth.registering') : t('auth.registerTitle')}
            </Button>
            <p className="uk-text-meta uk-text-center uk-margin-small-top">
              <Trans i18nKey="auth.termsAcknowledgment">
                By registering, you agree to our <Link to="/terms">Terms of Service</Link>.
              </Trans>
            </p>
          </motion.div>
        </Form>
        <div className="uk-text-center uk-margin-top">
          {t('auth.hasAccount')} <Link to="/login">{t('navbar.login')}</Link>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
