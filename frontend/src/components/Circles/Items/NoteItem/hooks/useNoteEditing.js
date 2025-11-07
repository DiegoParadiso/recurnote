import { useState, useCallback } from 'react';

export default function useNoteEditing({ textareaRef, isMobile, height, id, content, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    // Ajustar altura del textarea al iniciar edición
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = 'auto';
        const scrollHeight = el.scrollHeight;
        el.style.height = scrollHeight + 'px';
      }
    }, 0);
  }, [textareaRef]);

  const focusEditableTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    const focusOptions = isMobile ? {} : { preventScroll: true };
    try {
      if (isMobile) {
        el.focus(focusOptions);
        const len = (el.value || '').length;
        if (typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(len, len);
        }
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.focus(focusOptions);
            const len = (el.value || '').length;
            if (typeof el.setSelectionRange === 'function') {
              el.setSelectionRange(len, len);
            }
          });
        });
      }
    } catch (_) {}
  }, [textareaRef, isMobile]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    const el = textareaRef.current;
    if (el) {
      requestAnimationFrame(() => {
        const availableHeight = height - 16;
        el.style.height = availableHeight + 'px';
      });
    }
  }, [textareaRef, height]);

  const handleTextareaKeyDown = useCallback((e) => {
    // Permitir salto de línea con Ctrl/Cmd+Enter sin salir de edición
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      const newValue = (content || '').slice(0, start) + '\n' + (content || '').slice(end);
      onUpdate(id, newValue);
      setTimeout(() => {
        try {
          el.selectionStart = el.selectionEnd = start + 1;
        } catch (_) {}
      }, 0);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditing();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing();
      e.target.blur();
    }
  }, [content, id, onUpdate, stopEditing]);

  return { isEditing, setIsEditing, startEditing, stopEditing, focusEditableTextarea, handleTextareaKeyDown };
}
