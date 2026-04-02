import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { salesService } from '../services/salesService';
import { cityService } from '../../ads/services/cityService';
import { apiClient } from '../../services/apiClient';
import type { AdDto, UpdateAdRequestDto, CitySuggestion, CityDetailsDto, MediaUploadResponseDto, AllowedCurrenciesDto, CategoryPathElementDto, PricingMode, StatusResponseDto } from '../../types/api';
import { Heading } from '../../components/uikit/Heading/Heading';
import { Spinner } from '../../components/uikit/Spinner/Spinner';
import { Button } from '../../components/uikit/Button/Button';
import { Alert } from '../../components/uikit/Alert/Alert';
import { Label } from '../../components/uikit/Label/Label';
import { Form, Input, Select, NumberInput, FormMessage } from '../../components/Form/Form';
import { Grid } from '../../components/uikit/Grid/Grid';
import { Card, CardBody } from '../../components/uikit/Card/Card';
import { Upload } from '../../components/uikit/Upload/Upload';
import { Lightbox, LightboxItem } from '../../components/uikit/Lightbox/Lightbox';
import { CategorySelector } from '../../ads/components/CategorySelector/CategorySelector';
import { CategoryBreadcrumbs } from '../../ads/components/CategoryBreadcrumbs/CategoryBreadcrumbs';
import { useNavbarMode } from '../../hooks/useNavbarMode';
import NavbarPortal from '../../components/Navbar/NavbarPortal';
import { MediaEditor } from '../components/MediaEditor/MediaEditor';
import { Image } from '../../components/Image/Image';
import { MarkdownEditor } from '../../components/Markdown/MarkdownEditor';
import AdVisitStatsCard from '../../profile/components/AdVisitStatsCard/AdVisitStatsCard';
import styles from './EditAdPage.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 }
  }
} as const;

const EditAdPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, control, watch, setValue, setError: setFieldError, formState: { errors } } = useForm<UpdateAdRequestDto>({
    mode: 'onBlur'
  });
  const [ad, setAd] = useState<AdDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [mainPhotoPath, setMainPhotoPath] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityDetailsDto | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<CategoryPathElementDto[]>([]);
  const [allowedCurrencies, setAllowedCurrencies] = useState<AllowedCurrenciesDto>({ settlementCurrencies: [], referenceCurrencies: [] });
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [priceFocused, setPriceFocused] = useState(false);
  const [stockFocused, setStockFocused] = useState(false);
  const [editingImagePath, setEditingImagePath] = useState<string | null>(null);

  const watchPricingMode = watch('pricingMode');
  const watchSettlementCurrencies = watch('settlementCurrencies');

  useNavbarMode('focused', '/sales/ads');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currencies = await salesService.getAllowedCurrencies();
        setAllowedCurrencies(currencies);

        if (id) {
          const data = await salesService.getAdById(id);
          setAd(data);
          setMediaPaths(data.mediaPaths || []);
          setMainPhotoPath(data.mainPhotoPath || null);
          if (data.location?.city) {
            setSelectedCity(data.location.city);
            const city = data.location.city;
            const districtSuffix = city.district ? ` (${city.district})` : '';
            setCitySearch(`${city.name}${districtSuffix}, ${city.country}`);
          }
          if (data.categoryId) {
            setSelectedCategoryId(data.categoryId);
          }
          reset({
            title: data.title,
            description: data.description,
            pricingMode: data.pricingMode || 'FIXED_CRYPTO',
            price: data.price?.amount,
            priceCurrency: data.price?.currency,
            settlementCurrencies: data.settlementCurrencies || [],
            volatilityProtection: data.volatilityProtection || false,
            mainPhotoPath: data.mainPhotoPath,
            mediaPaths: data.mediaPaths,
            stock: data.stock
          });
        }
      } catch (err: unknown) {
        setPageError((err as Error).message || t('auth.errors.generic'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, t]);

  const handleCitySearch = async (val: string) => {
    setCitySearch(val);
    if (val.length > 2) {
      try {
        const suggestions = await cityService.getSuggestions(val);
        setCitySuggestions(suggestions);
      } catch (err) {
        console.error('Failed to fetch city suggestions', err);
      }
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (city: CityDetailsDto) => {
    setSelectedCity(city);
    const districtSuffix = city.district ? ` (${city.district})` : '';
    setCitySearch(`${city.name}${districtSuffix}, ${city.country}`);
    setCitySuggestions([]);
  };

  const handleCategorySelect = (id: number, path: CategoryPathElementDto[]) => {
    setSelectedCategoryId(id);
    setSelectedCategoryPath(path);
  };

  const onDescriptionFocus = useCallback(() => setDescriptionFocused(true), []);
  const onDescriptionBlur = useCallback((fieldOnBlur: () => void) => {
    fieldOnBlur();
    setDescriptionFocused(false);
  }, []);

  const onSubmit = async (data: UpdateAdRequestDto) => {
    if (!id) return;
    setSaving(true);
    setPageError(null);
    try {
      const updateData: UpdateAdRequestDto = {
          ...data,
          mediaPaths,
          mainPhotoPath: mainPhotoPath || undefined,
          location: selectedCity ? { cityId: selectedCity.id } : undefined,
          categoryId: selectedCategoryId || undefined
      };
      await salesService.updateAd(id, updateData);
      UIkit.notification({
        message: t('ads.saveSuccess'),
        status: 'success',
        pos: 'top-center',
        timeout: 3000
      });
      navigate('/sales/ads');
    } catch (err: unknown) {
      const errorBody = err as StatusResponseDto;
      const fieldErrors = errorBody?.fieldErrors;
      const message = errorBody?.message || (err as Error).message || t('auth.errors.generic');

      if (fieldErrors && fieldErrors.length > 0) {
        const formFields: Array<keyof UpdateAdRequestDto> = [
          'title', 'description', 'pricingMode', 'price', 'priceCurrency',
          'settlementCurrencies', 'volatilityProtection', 'location',
          'mediaPaths', 'mainPhotoPath', 'stock', 'categoryId'
        ];
        for (const fe of fieldErrors) {
          if (formFields.includes(fe.field as keyof UpdateAdRequestDto)) {
            setFieldError(fe.field as keyof UpdateAdRequestDto, { type: 'server', message: fe.message });
          }
        }
      }

      UIkit.notification({
        message,
        status: 'danger',
        pos: 'top-center',
        timeout: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
    }
    try {
        const response = await apiClient.post<MediaUploadResponseDto | MediaUploadResponseDto[]>('/media/upload', formData);
        
        let newPaths: string[] = [];
        if (Array.isArray(response)) {
          newPaths = response.map(r => r.path);
        } else if (response && response.path) {
          newPaths = [response.path];
        }

        setMediaPaths(prev => {
          const updated = [...prev, ...newPaths];
          if (!mainPhotoPath && updated.length > 0) {
            setMainPhotoPath(updated[0]);
          }
          return updated;
        });
    } catch (err: unknown) {
        setPageError((err as Error).message || t('auth.errors.generic'));
    }
  };

  const handleSaveEditedImage = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('files[]', new File([blob], 'edited-image.jpg', { type: 'image/jpeg' }));
    
    setSaving(true);
    try {
      const response = await apiClient.post<MediaUploadResponseDto | MediaUploadResponseDto[]>('/media/upload', formData);
      let newPath = '';
      if (Array.isArray(response)) {
        newPath = response[0].path;
      } else {
        newPath = response.path;
      }

      setMediaPaths(prev => {
        const index = prev.indexOf(editingImagePath!);
        const updated = [...prev];
        if (index !== -1) {
          updated[index] = newPath;
        }
        return updated;
      });

      if (mainPhotoPath === editingImagePath) {
        setMainPhotoPath(newPath);
      }
      
      setEditingImagePath(null);
    } catch (err: unknown) {
      setPageError((err as Error).message || t('auth.errors.generic'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="uk-flex uk-flex-center uk-margin-large-top"><Spinner ratio={2} /></div>;
  if (!ad) return <Alert variant="danger">{pageError || t('ads.notFound')}</Alert>;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <NavbarPortal>
        <div className="uk-flex uk-flex-middle" style={{ minWidth: 0 }}>
          <span className="uk-text-bold uk-text-truncate">{ad?.title || t('ads.editTitle')}</span>
          <Label variant="warning" className="uk-margin-small-left uk-flex-none">
            {t('common.editing')}
          </Label>
        </div>
      </NavbarPortal>

      <Heading as="h2" className="uk-margin-medium-bottom">{t('ads.editTitle')}: {ad.title}</Heading>
      
      {pageError && <Alert variant="danger" onClose={() => setPageError(null)}>{pageError}</Alert>}

      <AdVisitStatsCard adId={ad.id} />
  
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

      <Form onSubmit={handleSubmit(onSubmit)} layout="stacked">
        <motion.div variants={itemVariants} className="uk-margin-medium-bottom">
          <Card>
            <CardBody>
              <Heading as="h4" divider>{t('ads.generalInfo')}</Heading>
              <div className="uk-margin">
                <label className="uk-form-label">{t('ads.title')}</label>
                <Input 
                  layout={false}
                  {...register('title', { required: true })} 
                  status={errors.title && !titleFocused ? 'danger' : undefined}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={(e) => {
                    register('title').onBlur(e);
                    setTitleFocused(false);
                  }}
                />
                {titleFocused && (
                  <div className="uk-text-primary uk-text-small uk-margin-small-top">
                    {t('ads.titleGuidance')}
                  </div>
                )}
                <AnimatePresence>
                  {errors.title?.message && !titleFocused && (
                    <FormMessage>{errors.title.message}</FormMessage>
                  )}
                </AnimatePresence>
              </div>

              <div className="uk-margin">
                <label className="uk-form-label">{t('ads.description')}</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <MarkdownEditor 
                      {...field} 
                      status={errors.description && !descriptionFocused ? 'danger' : undefined}
                      onFocus={onDescriptionFocus}
                      onBlur={() => onDescriptionBlur(field.onBlur)}
                    />
                  )}
                />
                {descriptionFocused && (
                  <div className="uk-text-primary uk-text-small uk-margin-small-top">
                    {t('ads.descriptionGuidance')}
                  </div>
                )}
                <AnimatePresence>
                  {errors.description?.message && !descriptionFocused && (
                    <FormMessage>{errors.description.message}</FormMessage>
                  )}
                </AnimatePresence>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="uk-margin-medium-bottom">
          <Card>
            <CardBody>
              <Heading as="h4" divider>{t('ads.classificationLocation')}</Heading>
              <div className="uk-margin">
                <label className="uk-form-label">{t('ads.city')}</label>
                <div className="uk-inline uk-width-1-1">
                  <Input
                    layout={false}
                    type="text"
                    placeholder={t('ads.cityPlaceholder')}
                    value={citySearch}
                    onChange={(e) => handleCitySearch(e.target.value)}
                  />
                  <AnimatePresence>
                    {citySuggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="uk-dropdown uk-show uk-width-1-1" 
                        style={{ position: 'absolute', zIndex: 1000 }}
                      >
                        <ul className="uk-nav uk-dropdown-nav">
                          {citySuggestions.map(suggestion => (
                            <li key={suggestion.city.id}>
                              <a href="#" onClick={(e) => { e.preventDefault(); selectCity(suggestion.city); }}>
                                {suggestion.city.name}{suggestion.city.district ? ` (${suggestion.city.district})` : ''}, {suggestion.city.country}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="uk-margin">
                <label className="uk-form-label">{t('ads.category')}</label>
                <div className="uk-flex uk-flex-column uk-flex-row@m uk-flex-middle@m">
                  <div className="uk-flex-1 uk-margin-small-bottom uk-margin-remove-bottom@m" style={{ minWidth: 0 }}>
                    {selectedCategoryPath.length > 0 ? (
                      <CategoryBreadcrumbs path={selectedCategoryPath} className="uk-margin-remove" />
                    ) : (
                      <span className="uk-text-muted">{t('ads.selectCategory')}</span>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="default" 
                    size="small" 
                    className="uk-width-1-1 uk-width-auto@m uk-margin-small-left@m"
                    uk-toggle="target: #category-selector"
                  >
                    {selectedCategoryPath.length > 0 ? t('ads.changeCategory') : t('ads.selectCategory')}
                  </Button>
                </div>
                <CategorySelector onSelect={handleCategorySelect} />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="uk-margin-medium-bottom">
          <Card>
            <CardBody>
              <Heading as="h4" divider>{t('ads.pricingStock')}</Heading>

              {/* Settlement Currencies */}
              <div className="uk-margin">
                <label className="uk-form-label">{t('pricing.settlementCurrencies')}</label>
                <p className="uk-text-meta uk-margin-small-bottom">{t('pricing.settlementCurrenciesHint')}</p>
                <Controller
                  control={control}
                  name="settlementCurrencies"
                  rules={{ validate: (v) => (v && v.length > 0) || 'At least one settlement currency required' }}
                  render={({ field }) => (
                    <div className="uk-flex uk-flex-wrap" style={{ gap: '12px' }}>
                      {allowedCurrencies.settlementCurrencies.map(c => (
                        <label key={c.code} className="uk-flex uk-flex-middle" style={{ gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            className="uk-checkbox"
                            checked={field.value?.includes(c.code) || false}
                            onChange={(e) => {
                              const current = field.value || [];
                              const updated = e.target.checked
                                ? [...current, c.code]
                                : current.filter(code => code !== c.code);
                              field.onChange(updated);
                            }}
                          />
                          <span>{c.code} ({c.name})</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
                <AnimatePresence>
                  {errors.settlementCurrencies?.message && (
                    <FormMessage>{errors.settlementCurrencies.message}</FormMessage>
                  )}
                </AnimatePresence>
              </div>
              <div className="uk-margin">
                <label className="uk-form-label">{t('pricing.mode')}</label>
                <Controller
                  control={control}
                  name="pricingMode"
                  render={({ field }) => (
                    <div className="uk-margin-small-top">
                      <label className="uk-flex uk-flex-top uk-margin-small-bottom" style={{ gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          className="uk-radio"
                          checked={field.value === 'FIXED_CRYPTO'}
                          onChange={() => {
                            field.onChange('FIXED_CRYPTO' as PricingMode);
                            setValue('volatilityProtection', false);
                            // Reset price currency to first settlement currency if not compatible
                            const settlements = watchSettlementCurrencies || [];
                            const currentPriceCurrency = watch('priceCurrency');
                            if (currentPriceCurrency && !settlements.includes(currentPriceCurrency)) {
                              setValue('priceCurrency', settlements[0] || '');
                            }
                          }}
                        />
                        <div>
                          <span className="uk-text-bold">{t('pricing.fixedCrypto')}</span>
                          <p className="uk-text-meta uk-margin-remove">{t('pricing.fixedCryptoDesc')}</p>
                        </div>
                      </label>
                      <label className="uk-flex uk-flex-top" style={{ gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          className="uk-radio"
                          checked={field.value === 'PEGGED'}
                          onChange={() => {
                            field.onChange('PEGGED' as PricingMode);
                            // Reset price currency if not valid for PEGGED mode
                            const references = allowedCurrencies.referenceCurrencies || [];
                            const currentPriceCurrency = watch('priceCurrency');
                            if (currentPriceCurrency && !references.some(r => r.code === currentPriceCurrency)) {
                              setValue('priceCurrency', references[0]?.code || '');
                            }
                          }}
                        />
                        <div>
                          <span className="uk-text-bold">{t('pricing.pegged')}</span>
                          <p className="uk-text-meta uk-margin-remove">{t('pricing.peggedDesc')}</p>
                        </div>
                      </label>
                    </div>
                  )}
                />
                <AnimatePresence>
                  {errors.pricingMode?.message && (
                    <FormMessage>{errors.pricingMode.message}</FormMessage>
                  )}
                </AnimatePresence>
              </div>
              <Grid gap="small">
                <div className="uk-width-1-2@m">
                  <label className="uk-form-label">{t('ads.price')}</label>
                  <Controller
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <Input
                        layout={false}
                        type="number"
                        step="0.00000001"
                        value={field.value ?? ''}
                        status={errors.price && !priceFocused ? 'danger' : undefined}
                        onChange={(e) => {
                          const val = e.target.value;
                          const numVal = parseFloat(val);
                          field.onChange(val === '' || isNaN(numVal) ? undefined : numVal);
                        }}
                        onFocus={() => setPriceFocused(true)}
                        onBlur={() => {
                          field.onBlur();
                          setPriceFocused(false);
                        }}
                      />
                    )}
                  />
                  {priceFocused && (
                    <div className="uk-text-primary uk-text-small uk-margin-small-top">
                      {t('ads.priceGuidance')}
                    </div>
                  )}
                  <AnimatePresence>
                    {errors.price?.message && !priceFocused && (
                      <FormMessage>{errors.price.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>
                <div className="uk-width-1-2@m">
                  <label className="uk-form-label">{t('pricing.referenceCurrency')}</label>
                  <Select layout={false} {...register('priceCurrency')}>
                    {(watchPricingMode === 'FIXED_CRYPTO'
                      ? allowedCurrencies.settlementCurrencies
                      : allowedCurrencies.referenceCurrencies
                    ).map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.name})</option>
                    ))}
                  </Select>
                  <AnimatePresence>
                    {errors.priceCurrency?.message && (
                      <FormMessage>{errors.priceCurrency.message}</FormMessage>
                    )}
                  </AnimatePresence>
                </div>
              </Grid>

              {/* Volatility Protection (PEGGED only) */}
              <AnimatePresence>
                {watchPricingMode === 'PEGGED' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="uk-margin"
                  >
                    <label className="uk-flex uk-flex-middle" style={{ gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        className="uk-checkbox"
                        {...register('volatilityProtection')}
                      />
                      <div>
                        <span className="uk-text-bold">{t('pricing.volatilityProtection')}</span>
                        <p className="uk-text-meta uk-margin-remove">{t('pricing.volatilityProtectionDesc')}</p>
                      </div>
                    </label>

                    {/* Multi-currency tip */}
                    {watch('volatilityProtection') && (watchSettlementCurrencies?.length || 0) > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="uk-margin-small-top"
                      >
                        <Alert variant="primary" className="uk-border-rounded">
                          <p className="uk-margin-remove uk-text-small">{t('pricing.multiCurrencyTip')}</p>
                        </Alert>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stock */}
              <div className="uk-margin">
                <label className="uk-form-label">{t('ads.stock')}</label>
                <Controller
                  control={control}
                  name="stock"
                  render={({ field }) => (
                    <NumberInput 
                      layout={false}
                      {...field}
                      min={0}
                      formWidth="small"
                      status={errors.stock && !stockFocused ? 'danger' : undefined}
                      onFocus={() => setStockFocused(true)}
                      onBlur={() => {
                        field.onBlur();
                        setStockFocused(false);
                      }}
                    />
                  )}
                />
                {stockFocused && (
                  <div className="uk-text-primary uk-text-small uk-margin-small-top">
                    {t('ads.stockGuidance')}
                  </div>
                )}
                <AnimatePresence>
                  {errors.stock?.message && !stockFocused && (
                    <FormMessage>{errors.stock.message}</FormMessage>
                  )}
                </AnimatePresence>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="uk-margin-medium-bottom">
          <Card>
            <CardBody>
              <Heading as="h4" divider>{t('ads.media')}</Heading>
              
              {/* Desktop Drop Area */}
              <div className="uk-visible@m">
                <Upload 
                  url=""
                  multiple={true}
                  className={`uk-placeholder uk-text-center uk-padding-large uk-border-rounded ${styles.uploadArea}`}
                  beforeAll={(_: unknown, files: FileList) => {
                    handleUpload(files);
                    return false;
                  }}
                >
                  <span uk-icon="icon: cloud-upload; ratio: 2"></span>
                  <div className="uk-margin-small-top">
                    <span className="uk-text-middle">{t('ads.uploadText')}</span>
                    <div uk-form-custom="">
                      <input type="file" multiple onChange={(e) => e.target.files && handleUpload(e.target.files)} />
                      <span className="uk-link uk-text-bold">{t('ads.selectFiles')}</span>
                    </div>
                  </div>
                </Upload>
              </div>

              {/* Mobile Buttons */}
              <div className="uk-hidden@m">
                <div className="uk-grid-small uk-child-width-1-2" uk-grid="">
                  <div>
                    <div uk-form-custom="" className="uk-width-1-1">
                      <input type="file" multiple onChange={(e) => e.target.files && handleUpload(e.target.files)} />
                      <Button type="button" variant="default" className="uk-width-1-1">
                        <span uk-icon="icon: upload" className="uk-margin-small-right"></span>
                        {t('ads.uploadFile')}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div uk-form-custom="" className="uk-width-1-1">
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
                      <Button type="button" variant="default" className="uk-width-1-1">
                        <span uk-icon="icon: camera" className="uk-margin-small-right"></span>
                        {t('ads.takePhoto')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Lightbox>
                <Grid gap="small" className="uk-child-width-1-2 uk-child-width-1-4@m uk-margin-top">
                  <AnimatePresence>
                    {mediaPaths.map((path) => (
                      <motion.div 
                        key={path} 
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="uk-inline"
                      >
                        <div className="uk-card uk-card-default uk-card-body uk-padding-remove uk-overflow-hidden uk-border-rounded">
                          <LightboxItem href={`${API_URL}/api/media?p=${path}`}>
                            <Image 
                              src={`${API_URL}/api/media?p=${path}`} 
                              alt="media" 
                              className="uk-width-1-1"
                              containerStyle={{ height: '150px', width: '100%', cursor: 'pointer' }}
                              style={{ height: '150px', width: '100%', objectFit: 'cover' }} 
                            />
                          </LightboxItem>
                          <div className="uk-position-top-left uk-padding-small uk-flex uk-flex-column">
                              <button 
                                type="button" 
                                className={`uk-icon-button uk-margin-small-bottom ${mainPhotoPath === path ? 'uk-button-primary' : 'uk-background-default'}`} 
                                onClick={() => setMainPhotoPath(path)}
                                title={mainPhotoPath === path ? t('ads.mainPhoto') : t('ads.setAsMain')}
                                uk-icon={`icon: ${mainPhotoPath === path ? 'star' : 'image'}; ratio: 0.8`}
                              ></button>
                              <button 
                                type="button" 
                                className="uk-icon-button uk-background-default" 
                                onClick={() => setEditingImagePath(path)}
                                title={t('common.edit')}
                                uk-icon="icon: pencil; ratio: 0.8"
                              ></button>
                          </div>
                          <div className="uk-position-top-right uk-padding-small">
                              <button 
                                type="button" 
                                className="uk-close uk-background-default uk-border-circle uk-padding-small" 
                                onClick={() => {
                                  const updated = mediaPaths.filter(p => p !== path);
                                  setMediaPaths(updated);
                                  if (mainPhotoPath === path) {
                                    setMainPhotoPath(updated.length > 0 ? updated[0] : null);
                                  }
                                }}
                                uk-icon="icon: close; ratio: 0.8"
                              ></button>
                          </div>
                          {mainPhotoPath === path && (
                            <div className="uk-position-bottom-center uk-margin-small-bottom">
                              <Label variant="success">
                                <span uk-icon="icon: star; ratio: 0.6" className="uk-margin-xsmall-right"></span>
                                {t('ads.mainPhoto')}
                              </Label>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Grid>
              </Lightbox>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="uk-margin-large-top uk-flex uk-flex-right">
          <Button 
            type="button" 
            className="uk-margin-right" 
            onClick={() => navigate('/sales/ads')}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={saving || allowedCurrencies.settlementCurrencies.length === 0}>
            {saving ? <><Spinner ratio={0.5} className="uk-margin-small-right" /> {t('ads.saving')}</> : t('common.save')}
          </Button>
        </motion.div>
      </Form>

      {editingImagePath && (
        <MediaEditor 
          imageSrc={`${API_URL}/api/media?p=${editingImagePath}`}
          onSave={handleSaveEditedImage}
          onCancel={() => setEditingImagePath(null)}
        />
      )}
    </motion.div>
  );
};

export default EditAdPage;
