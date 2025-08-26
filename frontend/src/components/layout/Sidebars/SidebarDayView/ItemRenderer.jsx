import React from 'react';
import '../../../../styles/layouts/sidebars/ItemRenderer.css';
import { useItems } from '../../../../context/ItemsContext';
import { useAuth } from '../../../../context/AuthContext';

export default function ItemRenderer({ item, dateKey, toggleTaskCheck, isLocalMode }) {
  const { deleteItem } = useItems();
  const { user, token } = useAuth();

  // Función para determinar si el item tiene contenido real
  const hasRealContent = (content) => {
    if (!content) return false;
    if (typeof content === 'string') return content.trim().length > 0;
    if (Array.isArray(content)) return content.some(item => item && item.trim && item.trim().length > 0);
    if (typeof content === 'object') {
      // Para archivos, verificar si realmente hay datos
      if (content.fileData && content.base64) return true;
      // Para otros objetos, verificar si no está vacío
      return Object.keys(content).length > 0 && JSON.stringify(content) !== '{}';
    }
    return false;
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('¿Eliminar este ítem?')) return;

    // Usar deleteItem del ItemsContext para todo (tanto servidor como local)
    try {
      await deleteItem(item.id);
            } catch (error) {
          // Error silencioso al eliminar item
        }
  };

  const renderDeleteButton = () => (
    <button
      onClick={handleDelete}
      className={`delete-btn text-xs text-gray-400 hover:text-gray-600 transition-colors ${
        !hasRealContent(item.content) ? 'centered' : ''
      }`}
      title="Eliminar item"
    >
      ×
    </button>
  );

  if (item.label === 'Tarea') {
    return (
      <div
        key={item.id}
        className="w-full rounded item-card border shadow-sm text-[10px] relative min-h-[2.5rem]"
      >
        {renderDeleteButton()}
        {(item.content || []).map((task, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-1">
            <label className="checkbox-label relative cursor-pointer select-none flex-shrink-0">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={item.checked?.[idx] || false}
                onChange={() => toggleTaskCheck(dateKey, item.id, idx)}
              />
              <span
                className={`checkbox-box ${item.checked?.[idx] ? 'checked' : ''}`}
              >
                <svg
                  viewBox="0 0 12 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L4 8L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>
            <span 
              className={`flex-1 ${item.content?.[idx] ? (item.checked?.[idx] ? 'line-through' : '') : 'empty-task-text'}`}
              style={{ wordBreak: 'break-word', lineHeight: '1.3' }}
            >
              {item.content?.[idx] || 'Tarea sin descripción'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
          <div
        key={item.id}
        className={`w-full rounded item-card border shadow-sm text-[10px] relative min-h-[2.5rem] ${
          !hasRealContent(item.content) ? 'empty-content' : ''
        }`}
        title={typeof item.content === 'object' ? JSON.stringify(item.content) : item.content}
      >
      {renderDeleteButton()}
      {typeof item.content === 'object' && item.content.fileData && item.content.base64 ? (
        <a
          href={item.content.base64}
          download={item.content.fileData.name}
          className="file-download-link"
          title="Descargar archivo"
        >
          {item.content.fileData.name}
        </a>
      ) : !hasRealContent(item.content) ? (
        <div className="empty-content-placeholder">
          <span className="text-gray-400 italic">Sin contenido</span>
        </div>
      ) : typeof item.content === 'object' ? (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '9px', lineHeight: '1.2', margin: 0 }}>
          {JSON.stringify(item.content, null, 2)}
        </pre>
      ) : (
        <div style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
          {item.content}
        </div>
      )}
    </div>
  );
}
