import { useCallback } from 'react';
import { formatDateKey } from '../utils/formatDateKey';
import { useItems } from '../context/ItemsContext';
import { useLocal } from '../context/LocalContext';
import { useAuth } from '../context/AuthContext';

export default function useHandleDrop({
  containerRef,
  setItemsByDate,
  selectedDay,
  rotationAngle,
  radius,
  onInvalidDrop,
}) {
  const { addItem, updateItem, deleteItem } = useItems();
  const { addLocalItem, updateLocalItem, deleteLocalItem } = useLocal();
  const { user, token } = useAuth();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();

      if (!containerRef.current || !selectedDay) {
        if (typeof onInvalidDrop === 'function') {
          onInvalidDrop();
        }
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rad = (rotationAngle * Math.PI) / 180;
      let rotatedX = mouseX * Math.cos(rad) + mouseY * Math.sin(rad);
      let rotatedY = -mouseX * Math.sin(rad) + mouseY * Math.cos(rad);

      const distance = Math.hypot(rotatedX, rotatedY);

      let angle = (Math.atan2(rotatedY, rotatedX) * 180) / Math.PI;
      angle = (angle + 360) % 360;

      const source = e.dataTransfer.getData('source');
      const label = e.dataTransfer.getData('label') || 'Nota';
      const itemId = e.dataTransfer.getData('itemId');
      const dateKey = formatDateKey(selectedDay);

      // Fuera del círculo - solo eliminar si es un drop intencional
      if (distance > radius) {
        if (source === 'dropped' && itemId) {
          // Solo eliminar si realmente se está arrastrando fuera del círculo intencionalmente
          // Determinar si es item local o del servidor
          const idIsNumeric = typeof Number(itemId) === 'number' && Number.isFinite(Number(itemId));
          
          if (idIsNumeric && user && token) {
            // Item del servidor
            setItemsByDate((prev) => {
              const itemsForDate = prev[dateKey] || [];
              return {
                ...prev,
                [dateKey]: itemsForDate.filter((item) => item.id.toString() !== itemId),
              };
            });
            deleteItem(Number(itemId)).catch(() => {});
          } else {
            // Item local
            deleteLocalItem(itemId);
          }
          return;
        }
        if (source === 'sidebar') {
          if (typeof onInvalidDrop === 'function') onInvalidDrop();
          return;
        }
      }

      // Dentro del círculo
      if (source === 'sidebar') {
        if (user && token) {
          // Usuario autenticado - usar servidor
          addItem({
            date: dateKey,
            x: rotatedX,
            y: rotatedY,
            rotation: 0,
            rotation_enabled: true,
            label,
            angle,
            distance,
            content: label === 'Tarea' ? [''] : '',
            ...(label === 'Tarea' ? { checked: [false] } : {}),
            width: label === 'Tarea' ? 200 : 100,
            height: label === 'Tarea' ? 150 : 100,
          }).catch(() => {});
        } else {
          // Usuario no autenticado - usar localStorage
          addLocalItem({
            date: dateKey,
            x: rotatedX,
            y: rotatedY,
            rotation: 0,
            rotation_enabled: true,
            label,
            angle,
            distance,
            content: label === 'Tarea' ? [''] : '',
            ...(label === 'Tarea' ? { checked: [false] } : {}),
            width: label === 'Tarea' ? 200 : 100,
            height: label === 'Tarea' ? 150 : 100,
          });
        }
        return;
      }

      if (source === 'dropped' && itemId) {
        // Determinar si es item local o del servidor
        const idIsNumeric = typeof Number(itemId) === 'number' && Number.isFinite(Number(itemId));
        
        if (idIsNumeric && user && token) {
          // Item del servidor
          setItemsByDate((prev) => {
            const itemsForDate = prev[dateKey] || [];
            const updatedItems = itemsForDate.map((item) =>
              item.id.toString() === itemId ? { ...item, angle, distance } : item
            );
          
            return { ...prev, [dateKey]: updatedItems };
          });

          updateItem(Number(itemId), { angle, distance, x: rotatedX, y: rotatedY }).catch(() => {});
        } else {
          // Item local
          updateLocalItem(itemId, { angle, distance, x: rotatedX, y: rotatedY });
        }
        return;
      }
    },
    [containerRef, selectedDay, rotationAngle, radius, setItemsByDate, onInvalidDrop, addItem, updateItem, deleteItem, addLocalItem, updateLocalItem, deleteLocalItem, user, token]
  );

  return handleDrop;
}
