import React, { useEffect, useRef } from 'react';
import { Clock, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import '../../styles/components/preferences/ConfigPanel.css';

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
  return (
    <div className="coming-soon" title="Próximamente">
      <Clock size={16} className="icon" />
      <span className="label-text">{label}</span>
      <span className="soon-text">Próximamente</span>
    </div>
  );
}

function SessionOptions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="session-container">
      {user ? (
        <>
          <div className="session-info">
            <User size={16} style={{ marginRight: 8 }} />
            <span>Hola, {user.name || user.email || 'Usuario'}</span>
          </div>
          <button className="session-button logout" onClick={() => logout()}>
            <LogOut size={16} style={{ marginRight: 6 }} />Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <button className="session-button" onClick={() => navigate('/login')}>
            Iniciar sesión
          </button>
          <button className="session-button register" onClick={() => navigate('/register')}>
            Registrarse
          </button>
        </>
      )}
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
  const isMobile = useIsMobile();
  const { token, user, refreshMe } = useAuth();
  const pendingRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Cargar preferencias guardadas al abrir el panel (solo la primera vez)
  useEffect(() => {
    if (show && user?.preferences && !pendingRef.current) {
      const prefs = user.preferences;
      
      // Aplicar preferencias de visualización solo si no están ya configuradas
      if (prefs.displayOptions) {
        setDisplayOptions(prev => ({ ...prev, ...prefs.displayOptions }));
      }
      
      // NO aplicar preferencias de UI automáticamente - dejar que los toggles funcionen
      // Las preferencias de UI se cargan desde useHomeLogic
      
      // Aplicar preferencias del círculo solo si no están ya configuradas
      if (prefs.circle && prefs.circle.showSmall !== undefined && showSmall === true) {
        setShowSmall(prefs.circle.showSmall);
      }
    }
  }, [show, user?.preferences, setDisplayOptions, setShowSmall, showSmall]);

  useEffect(() => {
    if (!token) return;
    if (!show) return;
    
    const prefs = {
      displayOptions,
      ui: {
        leftSidebarPinned: isLeftSidebarPinned,
        rightSidebarPinned: isRightSidebarPinned,
      },
      circle: { showSmall },
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
        console.error('Error saving preferences:', error);
      }
    }, 500);
    
    return () => pendingRef.current && clearTimeout(pendingRef.current);
  }, [displayOptions, isLeftSidebarPinned, isRightSidebarPinned, showSmall, show, token, user, refreshMe]);
  if (!show) return null;

  const options = [
    { key: 'year', label: 'Año' },
    { key: 'month', label: 'Mes' },
    { key: 'week', label: 'Semana' },
    { key: 'weekday', label: 'Día de la semana' }, 
    { key: 'day', label: 'Día' }, 
    { key: 'time', label: 'Horario' },
  ];

  return (
    <>
      <div className="config-panel-backdrop" onClick={onClose} aria-hidden="true" />

      <aside role="dialog" aria-modal="true" aria-label="Panel de configuración" className="config-panel">
        <header className="config-panel-header">
          <h2>Configuración</h2>
          <button onClick={onClose} aria-label="Cerrar panel" className="config-panel-close-btn">
            ×
          </button>
        </header>
        <main className="config-panel-main">
          <section className="config-section">
            <h3>Sesión</h3>
            <SessionOptions />
          </section>

          <section className="config-section">
            <h3>Visualización</h3>
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
                  label="Fijar sidebar izquierdo"
                  value={isLeftSidebarPinned}
                  onChange={setIsLeftSidebarPinned}
                />
                <ToggleOption
                  id="toggle-sidebar-right-pinned"
                  label="Fijar sidebar derecho"
                  value={isRightSidebarPinned}
                  onChange={setIsRightSidebarPinned}
                />
              </div>
            )}
          </section>

          <section className="config-section">
            <h3>Idioma y región</h3>
            <div className="visualization-header-options">
              <label htmlFor="timezone">Zona horaria</label>
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

              <label htmlFor="timeFormat">Formato de hora</label>
              <select
                id="timeFormat"
                value={displayOptions.timeFormat}
                onChange={(e) => setDisplayOptions(prev => ({ ...prev, timeFormat: e.target.value }))}
              >
                <option value="24h">24 horas</option>
                <option value="12h">12 horas (AM/PM)</option>
              </select>
            </div>
          </section>

          <section className="config-section">
            <h3>Notificaciones</h3>
            <ComingSoonOption label="Activar recordatorios" />
            <ComingSoonOption label="Sonido / vibración" />
            <ComingSoonOption label="Recordar X minutos antes" />
            <ComingSoonOption label="Alertas silenciosas vs activas" />
          </section>

          <section className="config-section">
            <h3>Privacidad</h3>
            <ComingSoonOption label="Mostrar eventos privados como ocultos" />
            <ComingSoonOption label="Bloquear modificación de ciertos días" />
            <ComingSoonOption label="Exportar respaldo encriptado" />
          </section>

          <section className="config-section">
            <h3>Integraciones</h3>
            <ComingSoonOption label="Google Calendar / Outlook" />
            <ComingSoonOption label="Importar/Exportar calendario (ICS, CSV)" />
            <ComingSoonOption label="API para programadores" />
            <ComingSoonOption label="Integración con Notion / Trello" />
          </section>

          <section className="config-section">
            <h3>Accesibilidad</h3>
            <ComingSoonOption label="Modo alto contraste" />
            <ComingSoonOption label="Texto grande" />
            <ComingSoonOption label="Navegación con teclado" />
            <ComingSoonOption label="Animaciones reducidas" />
          </section>
        </main>
      </aside>
    </>
  );
}
