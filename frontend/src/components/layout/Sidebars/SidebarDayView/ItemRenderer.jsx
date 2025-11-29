import React from 'react';
import '@styles/layouts/sidebars/ItemRenderer.css';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';
import WithContextMenu from '@components/common/WithContextMenu';
import TaskPreview from './previews/TaskPreview';
import NotePreview from './previews/NotePreview';
import hasRealContent from '@utils/hasRealContent';

export default function ItemRenderer({ item, dateKey, toggleTaskCheck }) {
  const { t } = useTranslation();
  const { deleteItem } = useItems();

  // hasRealContent centralizado en util

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
      className={`delete-btn text-xs text-gray-400 hover:text-gray-600 transition-colors ${!hasRealContent(item.content) ? 'centered' : ''
        }`}
      title={t('sidebar.deleteItem')}
    >
      ×
    </button>
  );

  if (item.label === 'Tarea') {
    return (
      <TaskPreview
        item={item}
        dateKey={dateKey}
        toggleTaskCheck={toggleTaskCheck}
        renderDeleteButton={renderDeleteButton}
      />
    );
  }

  return (
    <WithContextMenu onDelete={() => deleteItem(item.id)}>
      <div
        key={item.id}
        className={`w-full rounded item-card border shadow-sm relative min-h-[2.5rem] ${!hasRealContent(item.content) ? 'empty-content' : ''
          }`}
        title={typeof item.content === 'object' ? JSON.stringify(item.content) : item.content}
      >
        {renderDeleteButton()}
        <NotePreview item={item} />
      </div>
    </WithContextMenu>
  );
}
