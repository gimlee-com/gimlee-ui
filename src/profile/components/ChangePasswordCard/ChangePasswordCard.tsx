import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { motion } from 'motion/react';
import { authService } from '../../../auth/services/authService';
import { Card, CardBody } from '../../../components/uikit/Card/Card';
import { Heading } from '../../../components/uikit/Heading/Heading';
import {
  Input,
  FormLabel,
  FormControls,
  FormMessage,
  AnimatePresence,
} from '../../../components/Form/Form';
import { Button } from '../../../components/uikit/Button/Button';

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

const cardItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 500, damping: 35 }
  }
};

const ChangePasswordCard: React.FC = () => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    mode: 'onBlur',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      UIkit.notification({
        message: t('auth.changePassword.success'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000,
      });
      reset();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : t('auth.changePassword.error');
      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000,
      });
    }
  };

  return (
    <Card className="uk-margin-bottom">
      <CardBody>
        <motion.div variants={cardItemVariants}>
          <Heading as="h4">{t('auth.changePassword.title')}</Heading>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div variants={cardItemVariants} className="uk-margin">
            <FormLabel>{t('auth.changePassword.oldPassword')}</FormLabel>
            <FormControls>
              <Input
                type="password"
                status={errors.oldPassword ? 'danger' : undefined}
                {...register('oldPassword', {
                  required: t('auth.errors.required', {
                    field: t('auth.changePassword.oldPassword'),
                  }),
                })}
              />
            </FormControls>
            <AnimatePresence>
              {errors.oldPassword && (
                <FormMessage type="error">
                  {errors.oldPassword.message}
                </FormMessage>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={cardItemVariants} className="uk-margin">
            <FormLabel>{t('auth.changePassword.newPassword')}</FormLabel>
            <FormControls>
              <Input
                type="password"
                status={errors.newPassword ? 'danger' : undefined}
                {...register('newPassword', {
                  required: t('auth.errors.required', {
                    field: t('auth.changePassword.newPassword'),
                  }),
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: t('auth.errors.passwordRequirements'),
                  },
                })}
              />
            </FormControls>
            <AnimatePresence>
              {errors.newPassword && (
                <FormMessage type="error">
                  {errors.newPassword.message}
                </FormMessage>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={cardItemVariants} className="uk-margin">
            <FormLabel>{t('auth.changePassword.confirmPassword')}</FormLabel>
            <FormControls>
              <Input
                type="password"
                status={errors.confirmPassword ? 'danger' : undefined}
                {...register('confirmPassword', {
                  required: t('auth.errors.required', {
                    field: t('auth.changePassword.confirmPassword'),
                  }),
                  validate: (value) =>
                    value === newPassword || t('auth.errors.passwordsDoNotMatch'),
                })}
              />
            </FormControls>
            <AnimatePresence>
              {errors.confirmPassword && (
                <FormMessage type="error">
                  {errors.confirmPassword.message}
                </FormMessage>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={cardItemVariants}>
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || isSubmitting}
            >
              {t('auth.changePassword.submit')}
            </Button>
          </motion.div>
        </form>
      </CardBody>
    </Card>
  );
};

export default ChangePasswordCard;
