import { useState } from 'react';
import { Clock } from 'lucide-react'; // npm install lucide-react
import './ConfigPanel.css';

function ToggleOption({ id, label, value, onChange }) {
  return (
    <div className="toggle-option" onClick={() => onChange(!value)} role="checkbox" aria-checked={value} tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(!value); }}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`toggle-switch ${value ? 'checked' : ''}`}>
        <span className="toggle-thumb" />
      </div>
      <label htmlFor={id} className="toggle-label">{label}</label>
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

export default function ConfigPanel({
  show,
  onClose,
  showSmall,
  setShowSmall,
  showRightSidebar,
  setShowRightSidebar,
}) {
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
            <h3>Visualización</h3>
            <ToggleOption
              id="toggle-circle-small"
              label={showSmall ? 'Ocultar círculo pequeño' : 'Mostrar círculo pequeño'}
              value={showSmall}
              onChange={setShowSmall}
            />
            <ToggleOption
              id="toggle-sidebar-right"
              label={showRightSidebar ? 'Ocultar sidebar derecho' : 'Mostrar sidebar derecho'}
              value={showRightSidebar}
              onChange={setShowRightSidebar}
            />
          </section>

          <section className="config-section">
            <h3>Preferencias Generales</h3>
            <ComingSoonOption label="Cambiar Plantilla" />
            <ComingSoonOption label="Idiomas" />
            <ComingSoonOption label="Zonas Horarias" />
          </section>

          <section className="config-section">
            <h3>Sesión y Planes</h3>
            <ComingSoonOption label="Inicio de Sesión" />
            <ComingSoonOption label="Registro" />
            <ComingSoonOption label="Planes" />
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
