// DayItemGroup.jsx
import React, { useCallback, useState } from 'react';
import i18n from '../../../../i18n/index.js';
import { formatDateKey } from '@utils/formatDateKey';
import '@styles/layouts/sidebars/DayItemGroup.css';

// Singleton transparente para ocultar el ghost del navegador durante DnD
let __sidebarTransparentDragImg;
function getTransparentDragImg() {
  if (typeof document === 'undefined') return null;
  if (!__sidebarTransparentDragImg) {
    const img = document.createElement('img');
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; // 1x1 transparent gif
    img.style.position = 'absolute';
    img.style.left = '-9999px';
    img.style.top = '-9999px';
    document.body.appendChild(img);
    __sidebarTransparentDragImg = img;
  }
  return __sidebarTransparentDragImg;
}

export default function DayItemGroup({ date, items, onDaySelect, renderItem, onReorder }) {
  const key = formatDateKey(date.toObject());
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  const handleDragStart = useCallback((e, itemId) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('sidebar-sourceId', itemId);
    e.dataTransfer.setData('sidebar-dateKey', key);
    // Usar imagen transparente singleton como drag image
    try {
      const img = getTransparentDragImg();
      if (img && typeof e.dataTransfer.setDragImage === 'function') {
        e.dataTransfer.setDragImage(img, 0, 0);
      }
    } catch {}
    setDraggingId(itemId);
  }, [key]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, targetId) => {
    const sourceDateKey = e.dataTransfer.getData('sidebar-dateKey');
    if (sourceDateKey !== key) return;
    if (draggingId && draggingId !== targetId) {
      setOverId(targetId);
    }
  }, [key, draggingId]);

  const handleDragLeave = useCallback(() => {
    setOverId(null);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('sidebar-sourceId');
    const sourceDateKey = e.dataTransfer.getData('sidebar-dateKey');
    if (!sourceId || !sourceDateKey) return;
    if (sourceDateKey !== key) return;
    if (typeof onReorder === 'function') {
      onReorder(key, sourceId, targetId);
    }
    setOverId(null);
    setDraggingId(null);
  }, [key, onReorder]);

  const handleDragEnd = useCallback(() => {
    setOverId(null);
    setDraggingId(null);
  }, []);

  return (
    <div className="flex flex-col gap-2 border-b day-item-group pb-3">
      <h3
        onClick={() => onDaySelect(date.toObject())}
        className="text-[10px] font-semibold  mono tracking-wide uppercase cursor-pointer day-header transition"
      >
        {date.setLocale(i18n.language || 'en').toFormat('cccc d LLLL')}
      </h3>

      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={handleDragEnd}
          className={`sidebar-draggable ${draggingId === item.id ? 'is-dragging' : ''} ${overId === item.id ? 'is-drag-over' : ''}`}
        >
          {renderItem(item, key)}
        </div>
      ))}
    </div>
  );
}
