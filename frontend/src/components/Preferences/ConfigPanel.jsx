import { useState } from 'react';
import { Clock, User, LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import './ConfigPanel.css';

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
            <LogOut size={16} style={{ marginRight: 6 }} />
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <button
            className="session-button"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
          <button
            className="session-button register"
            onClick={() => navigate('/register')}
          >
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
  showRightSidebar,
  setShowRightSidebar,
  isRightSidebarPinned,
  setIsRightSidebarPinned,
  isLeftSidebarPinned,
  setIsLeftSidebarPinned,
}) {
  const isMobile = useIsMobile();  // USAMOS EL HOOK

  if (!show) return null;

  return (
    <>
      <div
        className="config-panel-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panel de configuración"
        className="config-panel"
      >
        <header className="config-panel-header">
          <h2>Configuración</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar panel"
            className="config-panel-close-btn"
          >
            ×
          </button>
        </header>
        <main className="config-panel-main">
          <section className="config-section">
            <h3>Sesión</h3>
            <SessionOptions />
          </section>

          {!isMobile && (
            <section className="config-section">
              <h3>Visualización</h3>
              <ToggleOption
                id="toggle-calendar"
                label="Calendario"
                value={showSmall}
                onChange={setShowSmall}
              />
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
            </section>
          )}

          <section className="config-section">
            <h3>Preferencias Generales</h3>
            <ComingSoonOption label="Cambiar Plantilla" />
            <ComingSoonOption label="Idiomas" />
            <ComingSoonOption label="Zonas Horarias" />
          </section>

          <section className="config-section">
            <h3>Avanzado</h3>
            <p>Opciones avanzadas disponibles próximamente.</p>
          </section>
        </main>
      </aside>
    </>
  );
}