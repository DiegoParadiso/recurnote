import { useState } from 'react';
import { Clock } from 'lucide-react'; // npm install lucide-react

function ToggleOption({ id, label, value, onChange }) {
  return (
    <div className="flex items-center space-x-3 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={`w-11 h-6 flex items-center rounded-full p-1
          ${value ? 'bg-neutral-700' : 'bg-gray-300'} 
          transition-colors duration-300`}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow-md transform
            duration-300 ease-in-out
            ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </label>
      <label htmlFor={id} className="text-gray-900 font-medium cursor-pointer">
        {label}
      </label>
    </div>
  );
}

function ComingSoonOption({ label }) {
  return (
    <div
      className="flex items-center space-x-2 px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-400 text-sm font-light select-none cursor-not-allowed
        hover:bg-gray-100 transition-colors duration-200"
      title="Próximamente"
    >
      <Clock size={16} className="flex-shrink-0" />
      <span>{label}</span>
      <span className="ml-auto italic text-xs text-gray-300">Próximamente</span>
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
      {/* Fondo para cerrar clic afuera */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panel de configuración"
        className="fixed top-0 left-0 h-full w-80 max-w-full bg-white shadow-lg z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900 select-none">Configuración</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar panel"
            className="text-gray-500 hover:text-gray-700 transition text-3xl leading-none select-none focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
          >
            ×
          </button>
        </header>

        <main
          className="flex-1 overflow-y-auto p-5 space-y-8 scroll-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Visualización */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-gray-800 select-none">Visualización</h3>
            <div className="flex flex-col space-y-4 max-w-xs">
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
            </div>
          </section>

          {/* Preferencias Generales */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-gray-800 select-none">Preferencias Generales</h3>
            <div className="flex flex-col space-y-3 max-w-xs">
              <ComingSoonOption label="Cambiar Plantilla" />
              <ComingSoonOption label="Idiomas" />
              <ComingSoonOption label="Zonas Horarias" />
            </div>
          </section>

          {/* Sesión y Planes */}
          <section>
            <h3 className="text-md font-semibold mb-4 text-gray-800 select-none">Sesión y Planes</h3>
            <div className="flex flex-col space-y-3 max-w-xs">
              <ComingSoonOption label="Inicio de Sesión" />
              <ComingSoonOption label="Registro" />
              <ComingSoonOption label="Planes" />
            </div>
          </section>

          {/* Avanzado */}
          <section>
            <h3 className="text-md font-semibold mb-2 text-gray-800 select-none">Avanzado</h3>
            <p className="text-gray-500 text-sm max-w-xs select-none">
              Opciones avanzadas disponibles próximamente.
            </p>
          </section>
        </main>
      </aside>
    </>
  );
}
