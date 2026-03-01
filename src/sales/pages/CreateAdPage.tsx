import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { salesService } from '../services/salesService';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Button } from '../../components/uikit/Button/Button';
import { Form, Input } from '../../components/uikit/Form/Form';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import NavbarPortal from '../../components/Navbar/NavbarPortal';
import type { AllowedCurrenciesDto } from '../../types/api';

interface CreateAdForm {
  title: string;
}

const CreateAdPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isValid, touchedFields } } = useForm<CreateAdForm>({
    mode: 'onChange'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titleFocused, setTitleFocused] = useState(false);
  const [allowedCurrencies, setAllowedCurrencies] = useState<AllowedCurrenciesDto>({ settlementCurrencies: [], referenceCurrencies: [] });

  useNavbarMode('focused', '/sales/ads');

  useEffect(() => {
    salesService.getAllowedCurrencies()
      .then(setAllowedCurrencies)
      .catch(err => setError(err.message || t('auth.errors.generic')))
      .finally(() => setInitialLoading(false));
  }, [t]);

  const titleRegister = register('title', { required: true, minLength: 5 });

  const onSubmit = async (data: CreateAdForm) => {
    setLoading(true);
    setError(null);
    try {
      const newAd = await salesService.createAd(data);
      navigate(`/sales/ads/edit/${newAd.id}`);
    } catch (err: unknown) {
      setError((err as Error).message || t('ads.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="uk-flex uk-flex-center uk-margin-large-top"><Spinner ratio={2} /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="uk-flex uk-flex-center"
    >
      <NavbarPortal>
        <span className="uk-text-bold">{t('ads.createNew')}</span>
      </NavbarPortal>

      <div className="uk-width-large">
        <Card>
          <CardBody>
            <Heading as="h2" className="uk-text-center uk-margin-medium-bottom">
              {t('ads.createNew')}
            </Heading>

            {error && <Alert variant="danger">{error}</Alert>}

            {allowedCurrencies.settlementCurrencies.length === 0 && (
              <Alert variant="warning" className="uk-margin-medium-bottom">
                <Heading as="h4" className="uk-margin-small-bottom">{t('ads.notEligibleTitle')}</Heading>
                <p className="uk-margin-small-bottom">{t('ads.notEligibleMessage')}</p>
                <Button 
                  variant="primary" 
                  size="small" 
                  onClick={() => navigate('/profile')}
                >
                  {t('ads.goToProfile')}
                </Button>
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="uk-margin">
                <label className="uk-form-label">{t('ads.title')}</label>
                <div className="uk-form-controls">
                  <Input
                    {...titleRegister}
                    placeholder={t('ads.title')}
                    status={errors.title && !titleFocused && touchedFields.title ? 'danger' : undefined}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={(e) => {
                      titleRegister.onBlur(e);
                      setTitleFocused(false);
                    }}
                    autoFocus
                  />
                  {errors.title && !titleFocused && touchedFields.title && (
                    <div className="uk-text-danger uk-text-small uk-margin-small-top">
                       {t('auth.errors.minLength', { count: 5 })}
                    </div>
                  )}
                  {titleFocused && (
                    <div className="uk-text-primary uk-text-small uk-margin-small-top">
                      {t('ads.titleGuidance')}
                    </div>
                  )}
                </div>
              </div>

              <div className="uk-margin-large-top">
                <Button
                  type="submit"
                  variant="primary"
                  className="uk-width-1-1"
                  disabled={loading || !isValid || allowedCurrencies.settlementCurrencies.length === 0}
                >
                  {loading ? t('common.loading') : t('common.save')}
                </Button>
                <Button
                  type="button"
                  className="uk-width-1-1 uk-margin-small-top"
                  onClick={() => navigate('/sales/ads')}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
};

export default CreateAdPage;
