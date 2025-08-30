import React, { useEffect, useRef, useState } from 'react';
import { Clock, User, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useItems } from '../../context/ItemsContext';
import useIsMobile from '../../hooks/useIsMobile';
import BottomToast from '../common/BottomToast';
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

function PatternSelector({ selectedPattern, onPatternChange }) {
  return (
    <>
      <label htmlFor="pattern">Fondo del círculo</label>
      <select
        id="pattern"
        value={selectedPattern}
        onChange={(e) => onPatternChange(e.target.value)}
      >
        <option value="none">Sin fondo</option>
        <option value="pattern1">Patrón 1</option>
        <option value="pattern2">Patrón 2</option>
        <option value="pattern3">Patrón 3</option>
        <option value="pattern4">Patrón 4</option>
        <option value="pattern5">Patrón 5</option>
        <option value="pattern6">Patrón 6</option>
        <option value="pattern7">Patrón 7</option>
        <option value="pattern8">Patrón 8</option>
      </select>
    </>
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

function DataManagementOptions() {
  const { user, token } = useAuth();
  const { itemsByDate, deleteItem, setItemsByDate } = useItems();
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeletingPast, setIsDeletingPast] = useState(false);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [showConfirmPast, setShowConfirmPast] = useState(false);
  const [errorToast, setErrorToast] = useState('');

  // Calcular estadísticas
  const totalItems = Object.values(itemsByDate).reduce((acc, items) => acc + items.length, 0);
  
  const pastItems = Object.entries(itemsByDate).reduce((acc, [dateKey, items]) => {
    try {
      // Intentar parsear la fecha en diferentes formatos
      let date;
      if (dateKey.includes('-')) {
        // Formato ISO (YYYY-MM-DD)
        date = new Date(dateKey);
      } else {
        // Formato personalizado, intentar parsear
        const parts = dateKey.split('/');
        if (parts.length === 3) {
          // Formato DD/MM/YYYY o MM/DD/YYYY
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          date = new Date(dateKey);
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today && !isNaN(date.getTime())) {
        acc.count += items.length;
        acc.dates.push({ dateKey, items });
      }
    } catch (error) {
      console.error('Error parseando fecha:', dateKey, error);
    }
    return acc;
  }, { count: 0, dates: [] });

  const handleDeleteAllItems = async () => {
    setIsDeletingAll(true);
    setShowConfirmAll(false);

    try {
      if (user && token) {
        // Usuario autenticado - eliminar del servidor
        const deletePromises = Object.values(itemsByDate).flat().map(item => 
          deleteItem(item.id).catch(error => {
            console.error('Error eliminando item:', error);
            return null; // Continuar con otros items
          })
        );

        await Promise.all(deletePromises);
        setErrorToast('Todos los items han sido eliminados del servidor');
      } else {
        // Usuario no autenticado - limpiar contexto y localStorage
        setItemsByDate({});
        localStorage.removeItem('localItems');
        setErrorToast('Todos los items locales han sido eliminados');
      }
    } catch (error) {
      setErrorToast('Error al eliminar todos los items');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeletePastItems = async () => {
    setIsDeletingPast(true);
    setShowConfirmPast(false);

    try {
      if (user && token) {
        // Usuario autenticado - eliminar del servidor
        const deletePromises = pastItems.dates.flatMap(({ items }) => 
          items.map(item => 
            deleteItem(item.id).catch(error => {
              console.error('Error eliminando item del pasado:', error);
              return null; // Continuar con otros items
            })
          )
        );

        await Promise.all(deletePromises);
        setErrorToast(`${pastItems.count} items de días pasados han sido eliminados del servidor`);
      } else {
        // Usuario no autenticado - actualizar el contexto local
        const updatedItemsByDate = { ...itemsByDate };
        
        // Eliminar las fechas que contienen items del pasado
        pastItems.dates.forEach(({ dateKey }) => {
          delete updatedItemsByDate[dateKey];
        });
        
        // Actualizar el contexto
        setItemsByDate(updatedItemsByDate);
        
        // También limpiar localStorage si existe
        try {
          const localItems = JSON.parse(localStorage.getItem('localItems') || '{}');
          const updatedLocalItems = {};
          
          Object.entries(localItems).forEach(([dateKey, items]) => {
            const date = new Date(dateKey);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (date >= today) {
              updatedLocalItems[dateKey] = items;
            }
          });
          
          localStorage.setItem('localItems', JSON.stringify(updatedLocalItems));
        } catch (error) {
          console.error('Error actualizando localStorage:', error);
        }
        
        setErrorToast(`${pastItems.count} items de días pasados han sido eliminados`);
      }
    } catch (error) {
      setErrorToast('Error al eliminar items de días pasados');
    } finally {
      setIsDeletingPast(false);
    }
  };

  // No mostrar mensaje de autenticación requerida, permitir que funcione para ambos casos

  return (
    <div className="data-management-options">
      <div className="data-stats">
        <div className="stat-item">
          <span className="stat-label">Total de items:</span>
          <span className="stat-value">{totalItems}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Items pasados:</span>
          <span className="stat-value">{pastItems.count}</span>
        </div>
        {!user && (
          <div className="stat-item full-width">
            <span className="stat-label">Modo:</span>
            <span className="stat-value">Local</span>
          </div>
        )}
      </div>

      <div className="danger-zone">
        <h4>Eliminación</h4>

        <div className="danger-actions">
          <button
            className="danger-button"
            onClick={() => setShowConfirmPast(true)}
            disabled={isDeletingPast || pastItems.count === 0}
          >
            <Trash2 size={16} />
            {isDeletingPast ? 'Eliminando...' : 'Eliminar items pasados'}
          </button>

          <button
            className="danger-button"
            onClick={() => setShowConfirmAll(true)}
            disabled={isDeletingAll || totalItems === 0}
          >
            <Trash2 size={16} />
            {isDeletingAll ? 'Eliminando...' : 'Eliminar todos los items'}
          </button>
        </div>
      </div>

      {/* Confirmación para eliminar items de días pasados */}
      {showConfirmPast && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h4>Confirmar eliminación</h4>
            <p>¿Estás seguro de que quieres eliminar {pastItems.count} items de días pasados?</p>
            <div className="info-container">
              <div className="info-item">Esta acción no se puede deshacer</div>
              {!user && (
                <div className="info-item">Los items se eliminarán del almacenamiento</div>
              )}
            </div>
            <div className="confirmation-buttons">
              <button
                className="confirm-button"
                onClick={handleDeletePastItems}
                disabled={isDeletingPast}
              >
                {isDeletingPast ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmPast(false)}
                disabled={isDeletingPast}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación para eliminar todos los items */}
      {showConfirmAll && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h4>Confirmar eliminación total</h4>
            <p>¿Estás completamente seguro de que quieres eliminar TODOS los {totalItems} items?</p>
            <div className="info-container">
              <div className="info-item">Esta acción no se puede deshacer</div>
              {!user && (
                <div className="info-item">Los items se eliminarán del almacenamiento</div>
              )}
            </div>
            <div className="confirmation-buttons">
              <button
                className="confirm-button"
                onClick={handleDeleteAllItems}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? 'Eliminando...' : 'Sí, eliminar todo'}
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmAll(false)}
                disabled={isDeletingAll}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomToast 
        message={errorToast} 
        onClose={() => setErrorToast('')} 
        duration={5000}
      />
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
  const { isLightTheme, isAutoTheme, enableAutoTheme, disableAutoTheme } = useTheme();
  const pendingRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Estado para el pattern seleccionado
  const [selectedPattern, setSelectedPattern] = useState(() => {
    return localStorage.getItem('circlePattern') || 'pattern1';
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
      displayOptions,
      ui: {
        leftSidebarPinned: isLeftSidebarPinned,
        rightSidebarPinned: isRightSidebarPinned,
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
            <h3>Apariencia</h3>
            <div className="visualization-header-options">
              <ToggleOption
                id="toggle-auto-theme"
                label="Modo día/noche automático"
                value={isAutoTheme}
                onChange={(value) => {
                  if (value) {
                    enableAutoTheme();
                  } else {
                    disableAutoTheme();
                  }
                }}
              />
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

            <div className="visualization-header-options">
              <ToggleOption
                id="toggle-account-indicator"
                label="Mostrar indicador de cuenta"
                value={displayOptions.showAccountIndicator}
                onChange={(val) => setDisplayOptions((prev) => ({ ...prev, showAccountIndicator: val }))}
              />
            </div>
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

          <section className="config-section">
            <h3>Gestión de Datos</h3>
            <DataManagementOptions />
          </section>
        </main>
      </aside>
    </>
  );
}
