import React from 'react';
import '@styles/layouts/sidebars/ItemRenderer.css';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import { useTranslation } from 'react-i18next';
import WithContextMenu from '@components/common/WithContextMenu';

export default function ItemRenderer({ item, dateKey, toggleTaskCheck, isLocalMode }) {
  const { t } = useTranslation();
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
    if (!window.confirm(t('sidebar.confirmDeleteItem'))) return;

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
      title={t('sidebar.deleteItem')}
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
        <div className="task-container" style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
          {(item.content || []).map((task, idx) => (
            <div key={idx} className="flex gap-2 items-center">
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
                {item.content?.[idx] || t('task.empty')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <WithContextMenu onDelete={() => deleteItem(item.id)}>
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
          title={t('file.download')}
          style={{ display: 'flex', alignItems: 'center', width: '100%' }}
        >
          {item.content.fileData.name}
        </a>
      ) : !hasRealContent(item.content) ? (
        <div className="empty-content-placeholder">
          <span className="text-gray-400 italic">{t('sidebar.noContent')}</span>
        </div>
      ) : typeof item.content === 'object' ? (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '9px', lineHeight: '1.2', margin: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
          {JSON.stringify(item.content, null, 2)}
        </pre>
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '10px', lineHeight: '1.3', margin: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
          {item.content}
        </pre>
      )}
    </div>
    </WithContextMenu>
  );
}
