import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { expandCollapseProps } from '../../../animations';
import { Grid } from '../../../components/uikit/Grid/Grid';
import { Input, Select, FormLabel } from '../../../components/Form/Form';
import { Button } from '../../../components/uikit/Button/Button';
import { Icon } from '../../../components/uikit/Icon/Icon';
import { CategorySelector } from '../CategorySelector/CategorySelector';
import { CitySelector } from '../CitySelector/CitySelector';
import { cityService } from '../../services/cityService';
import { useAuth } from '../../../context/AuthContext';
import { getCurrencyFormatInfo } from '../../../utils/currencyUtils';
import type { CityDetailsDto, CategoryPathElementDto } from '../../../types/api';
import styles from './AdSearchFilters.module.scss';

export const AdSearchFilters: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferredCurrency } = useAuth();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for filters
  const [text, setText] = useState(searchParams.get('t') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minp') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxp') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('by') || 'CREATED_DATE');
  const [sortDir, setSortDir] = useState(searchParams.get('dir') || 'DESC');
  
  const [selectedCity, setSelectedCity] = useState<CityDetailsDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);

  const currencyInfo = getCurrencyFormatInfo(preferredCurrency || 'USD');

  // Sync from URL on mount and when URL changes
  useEffect(() => {
    setText(searchParams.get('t') || '');
    setMinPrice(searchParams.get('minp') || '');
    setMaxPrice(searchParams.get('maxp') || '');
    setSortBy(searchParams.get('by') || 'CREATED_DATE');
    setSortDir(searchParams.get('dir') || 'DESC');

    const cityId = searchParams.get('cty');
    if (cityId && (!selectedCity || selectedCity.id !== cityId)) {
        cityService.getCityById(cityId).then(setSelectedCity).catch(() => setSelectedCity(null));
    } else if (!cityId) {
        setSelectedCity(null);
    }

    const catId = searchParams.get('cat');
    if (!catId) {
        setSelectedCategory(null);
    }
    // Note: Category name fetching is missing as there's no easy endpoint for it by ID alone without tree.
    // For now, if catId is present but selectedCategory is null, we just know it's filtered by some category.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedCity is state set by this effect; including it would cause unnecessary re-execution
  }, [searchParams]);

  const applyFilters = useCallback((overrides: Record<string, string | null> = {}) => {
    const newParams = new URLSearchParams(searchParams);
    
    const updates = {
        t: text,
        minp: minPrice,
        maxp: maxPrice,
        by: sortBy,
        dir: sortDir,
        cty: selectedCity?.id || null,
        cat: selectedCategory?.id || null,
        p: '0', // Reset to page 0 on filter change
        ...overrides
    };

    Object.entries(updates).forEach(([key, value]) => {
        if (value) {
            newParams.set(key, value.toString());
        } else {
            newParams.delete(key);
        }
    });

    setSearchParams(newParams);
  }, [text, minPrice, maxPrice, sortBy, sortDir, selectedCity, selectedCategory, searchParams, setSearchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const removeFilter = (key: string) => {
    if (key === 't') setText('');
    if (key === 'cty') setSelectedCity(null);
    if (key === 'cat') setSelectedCategory(null);
    if (key === 'minp') setMinPrice('');
    if (key === 'maxp') setMaxPrice('');
    
    applyFilters({ [key]: null });
  };

  const handleCategorySelect = (id: number, path: CategoryPathElementDto[]) => {
    const leaf = path[path.length - 1];
    setSelectedCategory({ id, name: leaf.name });
    // We apply category immediately for better UX
    const newParams = new URLSearchParams(searchParams);
    newParams.set('cat', id.toString());
    newParams.set('p', '0');
    setSearchParams(newParams);
  };

  const formatBadgePrice = (price: string) => {
    return currencyInfo.isPrefix 
      ? `${currencyInfo.symbol} ${price}` 
      : `${price} ${currencyInfo.symbol}`;
  };

  const hasAdvancedFilters = minPrice || maxPrice || selectedCity || selectedCategory || sortBy !== 'CREATED_DATE' || sortDir !== 'DESC';

  return (
    <div className={styles.filtersContainer}>
      <form onSubmit={handleSearchSubmit}>
        <div className="uk-flex uk-flex-middle">
          <div className="uk-inline uk-flex-1">
            <span className="uk-form-icon" uk-icon="icon: search"></span>
            <Input 
              className="uk-width-1-1" 
              type="text" 
              placeholder={t('ads.searchPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            className="uk-margin-small-left"
          >
            <Icon icon="search" className="uk-hidden@m" />
            <span className="uk-visible@m">{t('common.search')}</span>
          </Button>
          <Button 
            type="button" 
            variant="default" 
            className="uk-margin-small-left"
            onClick={() => setShowAdvanced(!showAdvanced)}
            title={t('ads.advancedFilters')}
          >
            <Icon icon="settings" />
            <span className="uk-visible@m uk-margin-small-left">{t('ads.filters')}</span>
            {hasAdvancedFilters && <span className="uk-badge uk-margin-small-left">!</span>}
          </Button>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              {...expandCollapseProps}
              onAnimationStart={() => {
                if (!showAdvanced) setIsExpanded(false);
              }}
              onAnimationComplete={() => {
                if (showAdvanced) setIsExpanded(true);
              }}
              className={`${styles.advancedWrapper} ${isExpanded ? styles.expanded : ''}`}
            >
              <div className="uk-padding-small uk-background-muted uk-margin-small-top uk-border-rounded">
                <Grid gap="small">
                  <div className="uk-width-1-2@s uk-width-1-3@m">
                    <FormLabel>{t('ads.city')}</FormLabel>
                    <CitySelector 
                        initialValue={selectedCity} 
                        onSelect={(city) => {
                            setSelectedCity(city);
                        }} 
                    />
                  </div>
                  <div className="uk-width-1-2@s uk-width-1-3@m">
                    <FormLabel>{t('ads.category')}</FormLabel>
                    <div className="uk-flex uk-flex-middle">
                        <Button 
                            type="button" 
                            variant="default" 
                            className="uk-width-1-1 uk-text-truncate"
                            uk-toggle="target: #category-selector"
                        >
                            {selectedCategory?.name || t('ads.selectCategory')}
                        </Button>
                    </div>
                    <CategorySelector onSelect={handleCategorySelect} allowParentSelection={true} />
                  </div>
                  <div className="uk-width-1-1@s uk-width-1-3@m">
                    <FormLabel>{t('ads.sorting')}</FormLabel>
                    <div className="uk-flex">
                        <div className="uk-flex-1">
                            <Select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as 'CREATED_DATE' | 'PRICE')}
                                className="uk-width-1-1"
                            >
                                <option value="CREATED_DATE">{t('ads.sort.date')}</option>
                                <option value="PRICE">{t('ads.sort.price')}</option>
                            </Select>
                        </div>
                        <div className="uk-margin-small-left" style={{ minWidth: '100px' }}>
                            <Select 
                                value={sortDir} 
                                onChange={(e) => setSortDir(e.target.value as 'ASC' | 'DESC')}
                                className="uk-width-1-1"
                            >
                                <option value="DESC">{t('ads.sort.desc')}</option>
                                <option value="ASC">{t('ads.sort.asc')}</option>
                            </Select>
                        </div>
                    </div>
                  </div>
                  <div className="uk-width-1-1">
                    <FormLabel>{t('ads.priceRange')}</FormLabel>
                    <div className="uk-flex uk-flex-middle">
                        {currencyInfo.isPrefix && <span className="uk-margin-small-right">{currencyInfo.symbol}</span>}
                        <Input 
                            type="number" 
                            placeholder={t('ads.minPrice')} 
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className={styles.priceInput}
                        />
                        <span className="uk-margin-small-horizontal">-</span>
                        <Input 
                            type="number" 
                            placeholder={t('ads.maxPrice')} 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className={styles.priceInput}
                        />
                        {!currencyInfo.isPrefix && <span className="uk-margin-small-left">{currencyInfo.symbol}</span>}
                    </div>
                  </div>
                </Grid>
                <Grid gap="small" className="uk-margin-small-top uk-flex-right uk-flex-middle">
                    <div className="uk-width-auto@s uk-width-1-1">
                        <Button 
                            type="button" 
                            variant="link" 
                            className="uk-width-1-1 uk-width-auto@s"
                            onClick={() => {
                                setText('');
                                setMinPrice('');
                                setMaxPrice('');
                                setSortBy('CREATED_DATE');
                                setSortDir('DESC');
                                setSelectedCity(null);
                                setSelectedCategory(null);
                                setSearchParams(new URLSearchParams());
                            }}
                        >
                            {t('common.reset')}
                        </Button>
                    </div>
                    <div className="uk-width-auto@s uk-width-1-1">
                        <Button type="submit" variant="primary" className="uk-width-1-1 uk-width-auto@s">{t('ads.applyFilters')}</Button>
                    </div>
                </Grid>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className={styles.activeFilters}>
        <AnimatePresence>
            {searchParams.get('t') && (
                <FilterBadge label={`${t('common.search')}: ${searchParams.get('t')}`} onRemove={() => removeFilter('t')} />
            )}
            {selectedCity && (
                <FilterBadge label={`${t('ads.city')}: ${selectedCity.name}`} onRemove={() => removeFilter('cty')} />
            )}
            {selectedCategory && (
                <FilterBadge label={`${t('ads.category')}: ${selectedCategory.name}`} onRemove={() => removeFilter('cat')} />
            )}
            {searchParams.get('minp') && (
                <FilterBadge label={`${t('ads.minPrice')}: ${formatBadgePrice(searchParams.get('minp')!)}`} onRemove={() => removeFilter('minp')} />
            )}
            {searchParams.get('maxp') && (
                <FilterBadge label={`${t('ads.maxPrice')}: ${formatBadgePrice(searchParams.get('maxp')!)}`} onRemove={() => removeFilter('maxp')} />
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface FilterBadgeProps {
    label: string;
    onRemove: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, onRemove }) => (
    <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="uk-label uk-margin-small-right uk-margin-small-bottom uk-flex-inline uk-flex-middle"
        style={{ textTransform: 'none', padding: '2px 10px' }}
    >
        {label}
        <Icon 
            icon="close" 
            ratio={0.7} 
            className="uk-margin-small-left" 
            style={{ cursor: 'pointer' }}
            onClick={onRemove}
        />
    </motion.span>
);
