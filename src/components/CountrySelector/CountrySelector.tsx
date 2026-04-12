import { forwardRef, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCountries } from '../../hooks/useCountries';
import { getCountryFlag } from '../../utils/countryUtils';
import { useMergeRefs } from '../../hooks/useMergeRefs';
import { Input } from '../Form/Form';
import { Dropdown } from '../uikit/Dropdown/Dropdown';
import { Nav, NavItem } from '../uikit/Nav/Nav';
import { Spinner } from '../uikit/Spinner/Spinner';
import styles from './CountrySelector.module.scss';

export interface CountrySelectorProps {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  status?: 'danger' | 'success';
}

export const CountrySelector = forwardRef<HTMLDivElement, CountrySelectorProps>(
  ({ value, onChange, placeholder, compact, disabled, className, status }, ref) => {
    const { t } = useTranslation();
    const { countries, loading, getCountryName } = useCountries();
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(containerRef, ref);

    const filteredCountries = useMemo(() => {
      if (!countries?.length) return [];
      if (!search) return countries;
      const lower = search.toLowerCase();
      return countries.filter(
        c => c.name.toLowerCase().includes(lower) || c.code.toLowerCase().includes(lower)
      );
    }, [countries, search]);

    const handleSelect = useCallback((code: string) => {
      onChange(code);
      setSearch('');
    }, [onChange]);

    // Reset search when UIkit hides the dropdown
    useEffect(() => {
      const el = dropdownRef.current;
      if (!el) return;
      const onHide = () => setSearch('');
      el.addEventListener('hidden', onHide);
      return () => el.removeEventListener('hidden', onHide);
    }, []);

    const displayName = value ? getCountryName(value) : null;
    const displayFlag = value ? getCountryFlag(value) : null;
    const searchPlaceholder = placeholder ?? t('profile.searchCountry');

    if (loading && !countries.length) {
      return <Spinner ratio={0.5} />;
    }

    return (
      <div ref={mergedRef} className={`${styles.countrySelector} ${compact ? styles.compactWrapper : ''} ${className ?? ''}`}>
        <div className="uk-inline uk-width-1-1">
          {compact ? (
            <button
              type="button"
              className={styles.compactDisplay}
              disabled={disabled}
            >
              {displayFlag && <span className={styles.countryFlag}>{displayFlag}</span>}
              {displayName ? (
                <span className={styles.countryName}>{value}</span>
              ) : (
                <span className={styles.placeholder}>{t('navbar.selectCountry')}</span>
              )}
            </button>
          ) : (
            <>
              <span className="uk-form-icon" uk-icon="icon: search"></span>
              <Input
                ref={inputRef}
                className="uk-width-1-1"
                placeholder={displayName ? `${displayFlag} ${displayName} (${value})` : searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={disabled}
                status={status}
              />
            </>
          )}
          <Dropdown
            ref={dropdownRef}
            mode="click"
            pos="bottom-left"
            className="uk-width-1-1"
            container={false}
          >
            {compact && (
              <div className="uk-margin-small-bottom">
                <Input
                  className="uk-width-1-1"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <Nav variant="dropdown" className={styles.dropdownNav}>
              {filteredCountries.map(c => (
                <NavItem
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  active={c.code === value}
                >
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <span className={styles.countryItem}>
                      <span className={styles.countryFlag}>{getCountryFlag(c.code)}</span>
                      <span className={styles.countryName}>{c.name}</span>
                      <span className={styles.countryCode}>{c.code}</span>
                    </span>
                  </a>
                </NavItem>
              ))}
              {filteredCountries.length === 0 && (
                <NavItem disabled>
                  <span className="uk-text-muted">{t('ads.noAdsFound')}</span>
                </NavItem>
              )}
            </Nav>
          </Dropdown>
        </div>
      </div>
    );
  }
);
