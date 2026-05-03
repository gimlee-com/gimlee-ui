import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import UIkit from 'uikit';
import { Input } from '../../../components/uikit/Form/Form';
import { ModalDialog, ModalHeader, ModalBody, ModalTitle, ModalCloseDefault } from '../../../components/uikit/Modal/Modal';
import { cityService } from '../../services/cityService';
import { useAuth } from '../../../context/AuthContext';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useUIKit } from '../../../hooks/useUIkit';
import { formatAdminArea } from '../../../utils/cityUtils';
import type { CityDetailsDto, CitySuggestionDto } from '../../../types/api';
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
  const { countryOfResidence } = useAuth();
  const isMobile = useIsMobile();

  // Desktop state
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestionDto[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile modal state (draft — only committed on explicit selection)
  const [modalSearch, setModalSearch] = useState('');
  const [modalSuggestions, setModalSuggestions] = useState<CitySuggestionDto[]>([]);
  const modalSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
    container: false,
  });

  useEffect(() => {
    if (initialValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local state from prop
      setCitySearch(initialValue.name);
    } else {
      setCitySearch('');
    }
  }, [initialValue]);

  // Click-outside handler (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Reset modal draft state when modal is closed
  useEffect(() => {
    const el = modalRef.current;
    if (!el || !modalInstance) return;
    const onHidden = () => {
      setModalSearch('');
      setModalSuggestions([]);
      if (modalSearchTimeout.current) clearTimeout(modalSearchTimeout.current);
    };
    UIkit.util.on(el, 'hidden', onHidden);
    return () => { UIkit.util.off(el, 'hidden', onHidden); };
  }, [modalInstance, modalRef]);

  // Pre-fill modal search on open
  useEffect(() => {
    const el = modalRef.current;
    if (!el || !modalInstance) return;
    const onBeforeShow = () => {
      setModalSearch(initialValue?.name ?? '');
      setModalSuggestions([]);
    };
    UIkit.util.on(el, 'beforeshow', onBeforeShow);
    return () => { UIkit.util.off(el, 'beforeshow', onBeforeShow); };
  }, [modalInstance, modalRef, initialValue]);

  const handleCitySearch = (val: string) => {
    setCitySearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.trim().length > 2) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const suggestions = await cityService.getSuggestions({
            query: val,
            cc: countryOfResidence,
          });
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

  const handleModalSearch = useCallback((val: string) => {
    setModalSearch(val);
    if (modalSearchTimeout.current) clearTimeout(modalSearchTimeout.current);

    if (val.trim().length > 2) {
      modalSearchTimeout.current = setTimeout(async () => {
        try {
          const suggestions = await cityService.getSuggestions({
            query: val,
            cc: countryOfResidence,
          });
          setModalSuggestions(suggestions);
        } catch (err) {
          console.error('Failed to fetch city suggestions', err);
        }
      }, 500);
    } else {
      setModalSuggestions([]);
    }
  }, [countryOfResidence]);

  const selectCity = (suggestion: CitySuggestionDto) => {
    const city: CityDetailsDto = {
      id: suggestion.id,
      name: suggestion.name,
      countryCode: suggestion.countryCode,
      region: suggestion.region,
      district: suggestion.district,
    };
    setCitySearch(city.name);
    setCitySuggestions([]);
    setShowSuggestions(false);
    onSelect(city);
  };

  const selectCityFromModal = (suggestion: CitySuggestionDto) => {
    const city: CityDetailsDto = {
      id: suggestion.id,
      name: suggestion.name,
      countryCode: suggestion.countryCode,
      region: suggestion.region,
      district: suggestion.district,
    };
    setCitySearch(city.name);
    onSelect(city);
    modalInstance?.hide();
  };

  const suggestionList = (suggestions: CitySuggestionDto[], onItemClick: (s: CitySuggestionDto) => void) => (
    <ul className={styles.suggestionList}>
      {suggestions.map(suggestion => {
        const adminArea = formatAdminArea(suggestion);
        return (
          <li
            key={suggestion.id}
            className={styles.suggestionItem}
            onClick={() => onItemClick(suggestion)}
          >
            <div className={styles.cityName}>{suggestion.name}, {suggestion.countryCode}</div>
            {adminArea && (
              <div className={styles.adminArea}>{adminArea}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const mobileModal = createPortal(
    <div ref={modalRef} className={`uk-modal uk-modal-full ${styles.mobileModal}`} uk-modal="container: false">
      <ModalDialog className={styles.mobileModalDialog}>
        <ModalCloseDefault />
        <ModalHeader>
          <ModalTitle>{placeholder || t('ads.cityPlaceholder')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="uk-inline uk-width-1-1 uk-margin-small-bottom">
            <span className="uk-form-icon" uk-icon="icon: location"></span>
            <Input
              type="text"
              placeholder={placeholder || t('ads.cityPlaceholder')}
              value={modalSearch}
              onChange={(e) => handleModalSearch(e.target.value)}
              className="uk-width-1-1"
              autoFocus
            />
          </div>
          {modalSuggestions.length > 0 && suggestionList(modalSuggestions, selectCityFromModal)}
        </ModalBody>
      </ModalDialog>
    </div>,
    document.getElementById('root') || document.body
  );

  if (isMobile) {
    return (
      <div className={`uk-inline uk-width-1-1 ${className}`} ref={containerRef}>
        <button
          type="button"
          className={styles.mobileTrigger}
          onClick={() => modalInstance?.show()}
        >
          <span className="uk-form-icon" uk-icon="icon: location" style={{ pointerEvents: 'none' }}></span>
          {citySearch ? (
            <span className={styles.cityName}>{citySearch}</span>
          ) : (
            <span className={styles.mobilePlaceholder}>{placeholder || t('ads.cityPlaceholder')}</span>
          )}
        </button>
        {mobileModal}
      </div>
    );
  }

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
            {suggestionList(citySuggestions, selectCity)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
