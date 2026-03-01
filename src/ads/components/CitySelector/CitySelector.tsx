import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../../../components/uikit/Form/Form';
import { cityService } from '../../services/cityService';
import type { CityDetailsDto, CitySuggestion } from '../../../types/api';
import styles from './CitySelector.module.scss';

interface CitySelectorProps {
  initialValue?: CityDetailsDto | null;
  onSelect: (city: CityDetailsDto | null) => void;
  placeholder?: string;
  className?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ 
  initialValue, 
  onSelect, 
  placeholder,
  className 
}) => {
  const { t } = useTranslation();
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValue) {
      const districtSuffix = initialValue.district ? ` (${initialValue.district})` : '';
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local state from prop
      setCitySearch(`${initialValue.name}${districtSuffix}, ${initialValue.country}`);
    } else {
      setCitySearch('');
    }
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySearch = (val: string) => {
    setCitySearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.trim().length > 2) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const suggestions = await cityService.getSuggestions(val);
          setCitySuggestions(suggestions);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Failed to fetch city suggestions', err);
        }
      }, 500);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
      if (val.trim().length === 0) {
        onSelect(null);
      }
    }
  };

  const selectCity = (city: CityDetailsDto) => {
    const districtSuffix = city.district ? ` (${city.district})` : '';
    setCitySearch(`${city.name}${districtSuffix}, ${city.country}`);
    setCitySuggestions([]);
    setShowSuggestions(false);
    onSelect(city);
  };

  return (
    <div className={`uk-inline uk-width-1-1 ${className}`} ref={containerRef}>
      <span className="uk-form-icon" uk-icon="icon: location"></span>
      <Input
        type="text"
        placeholder={placeholder || t('ads.cityPlaceholder')}
        value={citySearch}
        onChange={(e) => handleCitySearch(e.target.value)}
        onFocus={() => { if (citySuggestions.length > 0) setShowSuggestions(true); }}
        className="uk-width-1-1"
      />
      <AnimatePresence>
        {showSuggestions && citySuggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`uk-dropdown uk-show uk-width-1-1 ${styles.dropdown}`}
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
  );
};
