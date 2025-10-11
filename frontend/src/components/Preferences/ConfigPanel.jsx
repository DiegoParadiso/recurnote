import React, { useEffect, useRef, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import '@styles/components/preferences/ConfigPanel.css';
import SessionOptions from '@components/Preferences/parts/SessionOptions';
import DataManagementOptions from '@components/Preferences/parts/DataManagementOptions';
import HelpIcon from '@components/common/HelpIcon';

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

function PatternSelector({ selectedPattern, onPatternChange }) {
  const { t } = useTranslation();
  return (
    <>
      <label htmlFor="pattern">{t('pattern.background')}</label>
      <select
        id="pattern"
        value={selectedPattern}
        onChange={(e) => onPatternChange(e.target.value)}
      >
        <option value="none">{t('pattern.none')}</option>
        <option value="pattern1">{t('pattern.pattern1')}</option>
        <option value="pattern2">{t('pattern.pattern2')}</option>
        <option value="pattern3">{t('pattern.pattern3')}</option>
        <option value="pattern4">{t('pattern.pattern4')}</option>
        <option value="pattern5">{t('pattern.pattern5')}</option>
        <option value="pattern6">{t('pattern.pattern6')}</option>
        <option value="pattern7">{t('pattern.pattern7')}</option>
        <option value="pattern8">{t('pattern.pattern8')}</option>
      </select>
    </>
  );
}

// Eliminado: SessionOptions y DataManagementOptions ahora están separados en ./parts

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
  const { token, user, refreshMe } = useAuth();
  const { isLightTheme, setIsLightTheme, isAutoTheme, enableAutoTheme, disableAutoTheme, isHighContrast, setIsHighContrast, textScale, setTextScale, reducedMotion, setReducedMotion } = useTheme();
  const pendingRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Estado para el pattern seleccionado
  const [selectedPattern, setSelectedPattern] = useState(() => {
    return localStorage.getItem('circlePattern') || 'none';
  });

  // Función para cambiar el pattern
  const handlePatternChange = (patternId) => {
    setSelectedPattern(patternId);
    localStorage.setItem('circlePattern', patternId);
    // Disparar evento personalizado para que CircleLarge se actualice
    window.dispatchEvent(new CustomEvent('patternChanged', { detail: patternId }));
  };

  // Cargar preferencias guardadas al abrir el panel (solo la primera vez)
  useEffect(() => {
    if (show && user?.preferences && !pendingRef.current) {
      const prefs = user.preferences;
      
      // Aplicar preferencias de visualización solo si no están ya configuradas
      if (prefs.displayOptions) {
        setDisplayOptions(prev => ({ ...prev, ...prefs.displayOptions }));
      }
      
      // Cargar patrón guardado desde preferencias del usuario
      if (prefs.circlePattern) {
        setSelectedPattern(prefs.circlePattern);
        localStorage.setItem('circlePattern', prefs.circlePattern);
        // Disparar evento para que CircleLarge se actualice
        window.dispatchEvent(new CustomEvent('patternChanged', { detail: prefs.circlePattern }));
      }
      
      // NO aplicar preferencias de UI automáticamente - dejar que los toggles funcionen
      // Las preferencias de UI se cargan desde useHomeLogic
      
      // NO aplicar preferencias del círculo automáticamente para evitar conflictos
      // El estado de showSmall se maneja desde el componente padre
    }
  }, [show, user?.preferences, setDisplayOptions]);

  useEffect(() => {
    if (!token) return;
    if (!show) return;
    
    const prefs = {
      displayOptions: {
        ...displayOptions,
        // Persistir idioma 
        language: displayOptions?.language || 'auto',
      },
      ui: {
        leftSidebarPinned: isLeftSidebarPinned,
        rightSidebarPinned: isRightSidebarPinned,
      },
      // Preferencias de accesibilidad
      accessibility: {
        highContrast: isHighContrast,
        textScale,
        reducedMotion,
      },
      circlePattern: selectedPattern,
      // NO guardar showSmall en preferencias para evitar conflictos
      // El estado de showSmall se maneja desde el componente padre
    };
    
    // Debounce 500ms
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/preferences`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ preferences: prefs }),
        });
        
        if (response.ok) {
          // Actualizar el usuario local con las nuevas preferencias
          const updatedUser = { ...user, preferences: prefs };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // NO refrescar el usuario automáticamente para evitar conflictos
          // await refreshMe();
        }
              } catch (error) {
          // Error silencioso al guardar preferencias
        }
    }, 500);
    
    return () => pendingRef.current && clearTimeout(pendingRef.current);
  }, [displayOptions, isLeftSidebarPinned, isRightSidebarPinned, selectedPattern, show, token, user, refreshMe]);
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
        <header className="config-panel-header">
          <h2>{t('common.config')}</h2>
          <button onClick={onClose} aria-label={t('common.close')} className="config-panel-close-btn">
            ×
          </button>
        </header>
        <main className="config-panel-main">
          <section className="config-section">
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
                <div className="visualization-header-options">
                  <PatternSelector
                    selectedPattern={selectedPattern}
                    onPatternChange={handlePatternChange}
                  />
                </div>
              )}
          </section>

          <section className="config-section">
          <h3 className="flex items-center">
            {t('common.visualization')}
            <HelpIcon text={t('help.visualization')} />
          </h3>
            <div className="visualization-header-options">
              {options.map(({ key, label }) => (
                <ToggleOption
                  key={key}
                  id={`toggle-${key}`}
                  label={` ${label}`}
                  value={displayOptions[key]}
                  onChange={(val) => setDisplayOptions((prev) => ({ ...prev, [key]: val }))}
                />
              ))}
            </div>

            {!isMobile && (
              <div className="visualization-header-options">
                <ToggleOption
                  id="toggle-sidebar-left-pinned"
                  label={t('visual.pinLeftSidebar')}
                  value={isLeftSidebarPinned}
                  onChange={setIsLeftSidebarPinned}
                />
                <ToggleOption
                  id="toggle-sidebar-right-pinned"
                  label={t('visual.pinRightSidebar')}
                  value={isRightSidebarPinned}
                  onChange={setIsRightSidebarPinned}
                />
              </div>
            )}

            {!isMobile && (
              <div className="visualization-header-options">
                <ToggleOption
                  id="toggle-account-indicator"
                  label={t('visual.accountIndicator')}
                  value={displayOptions.showAccountIndicator}
                  onChange={(val) => setDisplayOptions((prev) => ({ ...prev, showAccountIndicator: val }))}
                />
              </div>
            )}
          </section>

          <section className="config-section">
          <h3 className="flex items-center">
            {t('common.language_region')}
            <HelpIcon text={t('help.language_region')} />
          </h3>
            <div className="visualization-header-options">
              <label htmlFor="language-select">{t('language.label')}</label>
              <select
                id="language-select"
                value={displayOptions.language || 'auto'}
                onChange={(e) => {
                  const lang = e.target.value;
                  setDisplayOptions(prev => ({ ...prev, language: lang }));
                  // Cambiar idioma inmediatamente
                  const resolved = lang === 'auto' ? undefined : lang;
                  i18n.changeLanguage(resolved);
                  // Persistencia local para modo sin usuario
                  try {
                    const current = JSON.parse(localStorage.getItem('localDisplayOptions') || '{}');
                    localStorage.setItem('localDisplayOptions', JSON.stringify({ ...current, language: lang }));
                  } catch {}
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
                      }).catch(() => {});
                      // Actualizar user local
                      const updatedUser = { ...user, preferences: prefs };
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                  } catch {}
                  // Ajustar atributo lang del HTML
                  document.documentElement.setAttribute('lang', i18n.language || 'en');
                }}
              >
                <option value="auto">{t('language.auto')}</option>
                <option value="es">{t('language.es')}</option>
                <option value="en">{t('language.en')}</option>
              </select>

              <label htmlFor="timezone">{t('timezone.label')}</label>
              <select
                id="timezone"
                value={displayOptions.timeZone}
                onChange={(e) => setDisplayOptions(prev => ({ ...prev, timeZone: e.target.value }))}
              >
                {/* América */}
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/Montevideo">Montevideo (GMT-3)</option>
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="America/Chicago">Chicago (GMT-6)</option>
                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/Lima">Lima (GMT-5)</option>
                <option value="America/Santiago">Santiago de Chile (GMT-4)</option>
                <option value="America/Caracas">Caracas (GMT-4)</option>
                <option value="America/Toronto">Toronto (GMT-5)</option>
                <option value="America/Havana">La Habana (GMT-5)</option>
                <option value="America/Anchorage">Anchorage (GMT-9)</option>
                <option value="America/Juneau">Juneau (GMT-9)</option>
                <option value="America/Denver">Denver (GMT-7)</option>

                {/* Europa */}
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
                <option value="Europe/Berlin">Berlín (GMT+1)</option>
                <option value="Europe/Paris">París (GMT+1)</option>
                <option value="Europe/Rome">Roma (GMT+1)</option>
                <option value="Europe/Moscow">Moscú (GMT+3)</option>
                <option value="Europe/Amsterdam">Ámsterdam (GMT+1)</option>
                <option value="Europe/Oslo">Oslo (GMT+1)</option>
                <option value="Europe/Stockholm">Estocolmo (GMT+1)</option>

                {/* Asia */}
                <option value="Asia/Tokyo">Tokio (GMT+9)</option>
                <option value="Asia/Shanghai">Shanghái (GMT+8)</option>
                <option value="Asia/Singapore">Singapur (GMT+8)</option>
                <option value="Asia/Dubai">Dubái (GMT+4)</option>
                <option value="Asia/Kolkata">India (GMT+5:30)</option>
                <option value="Asia/Seoul">Seúl (GMT+9)</option>
                <option value="Asia/Manila">Manila (GMT+8)</option>
                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>

                {/* Oceanía */}
                <option value="Australia/Sydney">Sídney (GMT+10)</option>
                <option value="Australia/Melbourne">Melbourne (GMT+10)</option>
                <option value="Pacific/Auckland">Auckland (GMT+12)</option>
                <option value="Pacific/Honolulu">Honolulu (GMT-10)</option>
                <option value="Pacific/Fiji">Fiyi (GMT+12)</option>

                {/* UTC */}
                <option value="UTC">UTC</option>
              </select>

              <label htmlFor="timeFormat">{t('timeformat.label')}</label>
              <select
                id="timeFormat"
                value={displayOptions.timeFormat}
                onChange={(e) => setDisplayOptions(prev => ({ ...prev, timeFormat: e.target.value }))}
              >
                <option value="24h">{t('timeformat.h24')}</option>
                <option value="12h">{t('timeformat.h12')}</option>
              </select>
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
    </>
  );
}
