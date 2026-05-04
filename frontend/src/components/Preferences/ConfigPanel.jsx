import React, { useEffect, useRef, useState } from 'react';
import { Clock, AlertTriangle, Crown } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import '@styles/components/preferences/ConfigPanel.css';
import SessionOptions from '@components/Preferences/parts/SessionOptions';
import DataManagementOptions from '@components/Preferences/parts/DataManagementOptions';
import HelpIcon from '@components/common/HelpIcon';
import usePremiumModal from '@hooks/usePremiumModal';
import PremiumModal from '@components/Premium/PremiumModal';
import CustomSelect from '@components/common/CustomSelect';
import { usePreferences } from '@hooks/usePreferences';
import useLoadingOverlay from '@hooks/useLoadingOverlay';
import Loader from '@components/common/Loader';

function ToggleOption({ id, label, value, onChange }) {
  return (
    <div
      className="toggle-option"
      onClick={() => onChange(!value)}
      role="checkbox"
      aria-checked={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onChange(!value);
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`toggle-switch ${value ? 'checked' : ''}`}>
        <span className="toggle-thumb" />
      </div>
      <label htmlFor={id} className="toggle-label">
        {label}
      </label>
    </div>
  );
}

function ComingSoonOption({ label }) {
  const { t } = useTranslation();
  return (
    <div className="coming-soon" title={t('common.comingSoon')}>
      <Clock size={16} className="icon" />
      <span className="label-text">{label}</span>
      <span className="soon-text">{t('common.comingSoon')}</span>
    </div>
  );
}



export default function ConfigPanel({
  show,
  onClose,
  showSmall,
  setShowSmall,
  isLeftSidebarPinned,
  setIsLeftSidebarPinned,
  isRightSidebarPinned,
  setIsRightSidebarPinned,
  displayOptions,
  setDisplayOptions,
}) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { token, user } = useAuth();
  const { isLightTheme, setIsLightTheme, isAutoTheme, enableAutoTheme, disableAutoTheme, isHighContrast, setIsHighContrast, textScale, setTextScale, reducedMotion, setReducedMotion } = useTheme();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { isOpen: isPremiumOpen, openModal: openPremiumModal, closeModal: closePremiumModal, handleUpgrade } = usePremiumModal();

  // Use centralized preference management
  const { preferences, updatePreference, updatePreferences } = usePreferences();

  // Loading overlay for heavy actions (anti-bounce: 80ms debounce + 600ms min visible)
  const { isLoading, withLoading } = useLoadingOverlay();

  // Estado para el pattern seleccionado
  const [selectedPattern, setSelectedPattern] = useState(() => {
    if (!user?.is_vip) return 'none';
    return localStorage.getItem('circlePattern') || preferences.circlePattern || 'none';
  });

  // Función para cambiar el pattern
  const handlePatternChange = (patternId) => {
    if (patternId === selectedPattern) return;

    setSelectedPattern(patternId);
    updatePreference('circlePattern', patternId);
    localStorage.setItem('circlePattern', patternId);

    // Notificar a otros componentes del cambio
    window.dispatchEvent(new CustomEvent('patternChanged', { detail: patternId }));
  };

  // Load pattern from preferences when panel opens
  useEffect(() => {
    if (show && preferences.circlePattern) {
      setSelectedPattern(preferences.circlePattern);
      localStorage.setItem('circlePattern', preferences.circlePattern);
      window.dispatchEvent(new CustomEvent('patternChanged', { detail: preferences.circlePattern }));
    }
  }, [show, preferences.circlePattern]);
  if (!show) return null;

  const options = [
    { key: 'year', label: t('display.year') },
    { key: 'month', label: t('display.month') },
    { key: 'week', label: t('display.week') },
    { key: 'weekday', label: t('display.weekday') },
    { key: 'day', label: t('display.day') },
    { key: 'time', label: t('display.time') },
  ];

  return (
    <>
      <div className="config-panel-backdrop" onClick={onClose} aria-hidden="true" />

      <aside role="dialog" aria-modal="true" aria-label="Panel de configuración" className="config-panel">
        {/* Botón de cierre flotante — solo visible en mobile (header oculto en mobile) */}
        <button onClick={onClose} aria-label={t('common.close')} className="config-panel-close-btn">
          ✕
        </button>
        <main className="config-panel-main">
          <header className="config-panel-header">
            <h2>{t('common.config')}</h2>
          </header>
          <section className="pt-5 config-section">
            <h3 className="flex items-center">
              {t('common.session')}
              <HelpIcon text={t('help.session')} />
            </h3>
            <SessionOptions />
          </section>
          <section className="config-section">
            <h3 className="flex items-center">
              {t('common.appearance')}
              <HelpIcon text={t('help.appearance')} />
            </h3>
            <div className="visualization-header-options">
              <ToggleOption
                id="toggle-auto-theme"
                label={t('common.auto_theme')}
                value={isAutoTheme}
                onChange={(value) => {
                  if (value) {
                    enableAutoTheme();
                  } else {
                    disableAutoTheme();
                  }
                }}
              />
              {!isAutoTheme && (
                <>
                  <ToggleOption
                    id="toggle-dark-mode"
                    label={t('common.dark_mode')}
                    value={!isLightTheme}
                    onChange={(val) => setIsLightTheme(!val)}
                  />
                  <ToggleOption
                    id="toggle-light-mode"
                    label={t('common.light_mode')}
                    value={isLightTheme}
                    onChange={(val) => setIsLightTheme(val)}
                  />
                </>
              )}
            </div>
            {!isMobile && (
              <>
                <div className="visualization-header-options" style={{ padding: '0.75rem 1.25rem', marginTop: 0, marginBottom: '0.5rem', minWidth: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', gap: '1rem' }}>
                    <label style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('itemBg.label')}</span>
                      {!user?.is_vip && <Crown size={14} style={{ color: 'var(--color-text-primary)', flexShrink: 0 }} />}
                    </label>
                    <div style={{ flex: '0 0 200px', minWidth: 0 }} onClickCapture={(e) => {
                      if (!user?.is_vip) {
                        e.preventDefault();
                        e.stopPropagation();
                        openPremiumModal();
                      }
                    }}>
                      <CustomSelect
                        value={preferences.itemBackground || 'normal'}
                        onChange={(val) => withLoading(async () => {
                          updatePreference('itemBackground', val);
                          document.documentElement.setAttribute('data-item-bg', val);
                        })}
                        options={[
                          { value: 'normal', label: t('itemBg.normal') },
                          { value: 'blur', label: t('itemBg.blur') },
                          { value: 'liquid', label: t('itemBg.liquid') },
                        ]}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', gap: '1rem' }}>
                    <label style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('circleSmallBg.label')}</span>
                      {!user?.is_vip && <Crown size={14} style={{ color: 'var(--color-text-primary)', flexShrink: 0 }} />}
                    </label>
                    <div style={{ flex: '0 0 200px', minWidth: 0 }} onClickCapture={(e) => {
                      if (!user?.is_vip) {
                        e.preventDefault();
                        e.stopPropagation();
                        openPremiumModal();
                      }
                    }}>
                      <CustomSelect
                        value={preferences.circleSmallBackground || 'normal'}
                        onChange={(val) => withLoading(async () => {
                          updatePreference('circleSmallBackground', val);
                          if (val === 'normal') {
                            document.documentElement.removeAttribute('data-circle-small-bg');
                          } else {
                            document.documentElement.setAttribute('data-circle-small-bg', val);
                          }
                        }, { immediate: true })}
                        options={[
                          { value: 'normal', label: t('circleSmallBg.normal') },
                          { value: 'blur', label: t('circleSmallBg.blur') },
                          { value: 'liquid', label: t('circleSmallBg.liquid') },
                        ]}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, width: '100%', gap: '1rem' }}>
                    <label style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('pattern.background')}</span>
                      {!user?.is_vip && <Crown size={14} style={{ color: 'var(--color-text-primary)', flexShrink: 0 }} />}
                    </label>
                    <div style={{ flex: '0 0 200px', minWidth: 0 }} onClickCapture={(e) => {
                      if (!user?.is_vip) {
                        e.preventDefault();
                        e.stopPropagation();
                        openPremiumModal();
                      }
                    }}>
                      <CustomSelect
                        value={selectedPattern || 'none'}
                        onChange={(val) => withLoading(async () => handlePatternChange(val))}
                        options={[
                          { value: 'none', label: t('pattern.none') },
                          { value: 'pattern1', label: t('pattern.pattern1') },
                          { value: 'pattern2', label: t('pattern.pattern2') },
                          { value: 'pattern3', label: t('pattern.pattern3') },
                          { value: 'pattern4', label: t('pattern.pattern4') },
                          { value: 'pattern5', label: t('pattern.pattern5') },
                          { value: 'pattern6', label: t('pattern.pattern6') },
                          { value: 'pattern7', label: t('pattern.pattern7') },
                          { value: 'pattern8', label: t('pattern.pattern8') },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
          <section className="config-section">
            <h3 className="flex items-center">
              {t('common.visualization')}
              <HelpIcon text={t('help.visualization')} />
            </h3>
            {!isMobile && (
              <div className="visualization-header-options">
                <ToggleOption
                  id="toggle-fullboard-mode"
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {t('visual.fullboardMode')}
                      {!user?.is_vip && <Crown size={14} style={{ color: 'var(--color-text-primary)' }} />}
                    </span>
                  }
                  value={displayOptions.fullboardMode}
                  onChange={(val) => {
                    if (!user?.is_vip) {
                      openPremiumModal();
                      return;
                    }
                    withLoading(async () => setDisplayOptions((prev) => ({ ...prev, fullboardMode: val })), { immediate: true });
                  }}
                />
                <ToggleOption
                  id="toggle-show-logo"
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {t('visual.showLogo')}
                      {!user?.is_vip && <Crown size={14} style={{ color: 'var(--color-text-primary)' }} />}
                    </span>
                  }
                  value={displayOptions.showLogo !== false}
                  onChange={(val) => {
                    if (!user?.is_vip) {
                      openPremiumModal();
                      return;
                    }
                    setDisplayOptions((prev) => ({ ...prev, showLogo: val }));
                  }}
                />
                <ToggleOption
                  id="toggle-account-indicator"
                  label={t('visual.accountIndicator')}
                  value={displayOptions.showAccountIndicator}
                  onChange={(val) => withLoading(async () => setDisplayOptions((prev) => ({ ...prev, showAccountIndicator: val })), { immediate: true })}
                />
                <ToggleOption
                  id="toggle-sidebar-left-pinned"
                  label={t('visual.pinLeftSidebar')}
                  value={isLeftSidebarPinned}
                  onChange={(val) => withLoading(async () => setIsLeftSidebarPinned(val), { immediate: true })}
                />
                <ToggleOption
                  id="toggle-sidebar-right-pinned"
                  label={t('visual.pinRightSidebar')}
                  value={isRightSidebarPinned}
                  onChange={(val) => withLoading(async () => setIsRightSidebarPinned(val), { immediate: true })}
                />
              </div>
            )}
            <div className="visualization-header-options">
              {options.map(({ key, label }) => (
                <ToggleOption
                  key={key}
                  id={`toggle-${key}`}
                  label={` ${label}`}
                  value={displayOptions[key]}
                  onChange={(val) => withLoading(async () => setDisplayOptions((prev) => ({ ...prev, [key]: val })), { immediate: true })}
                />
              ))}
            </div>
          </section>

          <section className="config-section">
            <h3 className="flex items-center">
              {t('common.language_region')}
              <HelpIcon text={t('help.language_region')} />
            </h3>
            <div className="visualization-header-options" style={{ padding: '0.75rem 1.25rem', marginTop: 0, marginBottom: '0.5rem', minWidth: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', gap: '1rem' }}>
                <label htmlFor="language-select" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('language.label')}</label>
                <div style={{ flex: '0 0 200px', minWidth: 0 }}>
                  <CustomSelect
                    value={displayOptions.language || 'auto'}
                    onChange={(lang) => withLoading(async () => {
                      setDisplayOptions(prev => ({ ...prev, language: lang }));
                      // Cambiar idioma inmediatamente
                      const resolved = lang === 'auto' ? undefined : lang;
                      await i18n.changeLanguage(resolved);
                      // Persistencia local para modo sin usuario
                      try {
                        const current = JSON.parse(localStorage.getItem('localDisplayOptions') || '{}');
                        localStorage.setItem('localDisplayOptions', JSON.stringify({ ...current, language: lang }));
                      } catch { }
                      // Guardar en backend si hay token
                      try {
                        if (token) {
                          const prefs = {
                            ...(user?.preferences || {}),
                            displayOptions: {
                              ...(user?.preferences?.displayOptions || {}),
                              language: lang,
                            },
                          };
                          fetch(`${API_URL}/api/auth/preferences`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ preferences: prefs }),
                          }).catch(() => { });
                          // Actualizar user local
                          const updatedUser = { ...user, preferences: prefs };
                          updateUser(updatedUser);
                        }
                      } catch { }
                      // Ajustar atributo lang del HTML
                      document.documentElement.setAttribute('lang', i18n.language || 'en');
                    })}
                    options={[
                      { value: 'auto', label: t('language.auto') },
                      { value: 'es', label: t('language.es') },
                      { value: 'en', label: t('language.en') },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', gap: '1rem' }}>
                <label htmlFor="timezone" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('timezone.label')}</label>
                <div style={{ flex: '0 0 200px', minWidth: 0 }}>
                  <CustomSelect
                    value={displayOptions.timeZone}
                    onChange={(val) => setDisplayOptions(prev => ({ ...prev, timeZone: val }))}
                    options={[
                      // América
                      { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
                      { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
                      { value: "America/Montevideo", label: "Montevideo (GMT-3)" },
                      { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
                      { value: "America/New_York", label: "Nueva York (GMT-5)" },
                      { value: "America/Chicago", label: "Chicago (GMT-6)" },
                      { value: "America/Los_Angeles", label: "Los Ángeles (GMT-8)" },
                      { value: "America/Bogota", label: "Bogotá (GMT-5)" },
                      { value: "America/Lima", label: "Lima (GMT-5)" },
                      { value: "America/Santiago", label: "Santiago de Chile (GMT-4)" },
                      { value: "America/Caracas", label: "Caracas (GMT-4)" },
                      { value: "America/Toronto", label: "Toronto (GMT-5)" },
                      { value: "America/Havana", label: "La Habana (GMT-5)" },
                      { value: "America/Anchorage", label: "Anchorage (GMT-9)" },
                      { value: "America/Juneau", label: "Juneau (GMT-9)" },
                      { value: "America/Denver", label: "Denver (GMT-7)" },
                      // Europa
                      { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
                      { value: "Europe/London", label: "Londres (GMT+0)" },
                      { value: "Europe/Berlin", label: "Berlín (GMT+1)" },
                      { value: "Europe/Paris", label: "París (GMT+1)" },
                      { value: "Europe/Rome", label: "Roma (GMT+1)" },
                      { value: "Europe/Moscow", label: "Moscú (GMT+3)" },
                      { value: "Europe/Amsterdam", label: "Ámsterdam (GMT+1)" },
                      { value: "Europe/Oslo", label: "Oslo (GMT+1)" },
                      { value: "Europe/Stockholm", label: "Estocolmo (GMT+1)" },
                      // Asia
                      { value: "Asia/Tokyo", label: "Tokio (GMT+9)" },
                      { value: "Asia/Shanghai", label: "Shanghái (GMT+8)" },
                      { value: "Asia/Singapore", label: "Singapur (GMT+8)" },
                      { value: "Asia/Dubai", label: "Dubái (GMT+4)" },
                      { value: "Asia/Kolkata", label: "India (GMT+5:30)" },
                      { value: "Asia/Seoul", label: "Seúl (GMT+9)" },
                      { value: "Asia/Manila", label: "Manila (GMT+8)" },
                      { value: "Asia/Bangkok", label: "Bangkok (GMT+7)" },
                      // Oceanía
                      { value: "Australia/Sydney", label: "Sídney (GMT+10)" },
                      { value: "Australia/Melbourne", label: "Melbourne (GMT+10)" },
                      { value: "Pacific/Auckland", label: "Auckland (GMT+12)" },
                      { value: "Pacific/Honolulu", label: "Honolulu (GMT-10)" },
                      { value: "Pacific/Fiji", label: "Fiyi (GMT+12)" },
                      // UTC
                      { value: "UTC", label: "UTC" },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, width: '100%', gap: '1rem' }}>
                <label htmlFor="timeFormat" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('timeformat.label')}</label>
                <div style={{ flex: '0 0 200px', minWidth: 0 }}>
                  <CustomSelect
                    value={displayOptions.timeFormat}
                    onChange={(val) => setDisplayOptions(prev => ({ ...prev, timeFormat: val }))}
                    options={[
                      { value: '24h', label: t('timeformat.h24') },
                      { value: '12h', label: t('timeformat.h12') },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="config-section">
            <h3 className="flex items-center">
              {t('common.accessibility')}
              <HelpIcon text={t('help.accessibility')} />
            </h3>
            <div className="visualization-header-options">
              <ToggleOption
                id="toggle-high-contrast"
                label={t('common.high_contrast')}
                value={isHighContrast}
                onChange={setIsHighContrast}
              />
              <ToggleOption
                id="toggle-large-text"
                label={t('common.large_text')}
                value={textScale === 'large'}
                onChange={(val) => setTextScale(val ? 'large' : 'normal')}
              />
              <ToggleOption
                id="toggle-reduced-motion"
                label={t('common.reduced_motion')}
                value={reducedMotion}
                onChange={setReducedMotion}
              />
            </div>
          </section>

          {/* Secciones ‘coming soon’ eliminadas */}

          <section className="config-section">
            <h3 className="flex items-center">
              {t('common.data_management')}
              <HelpIcon text={t('help.data_management')} />
            </h3>
            <DataManagementOptions />
          </section>
        </main>
      </aside>
      <PremiumModal isOpen={isPremiumOpen} onClose={closePremiumModal} onUpgrade={handleUpgrade} />
      {isLoading && <Loader fullScreen />}
    </>
  );
}
