import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import { lockBodyScroll, unlockBodyScroll } from '@utils/scrollLock';

const MAX_CONTAINER_HEIGHT = 260;

export default function NoteItemEditor({
  id,
  content,
  width,
  height,
  onUpdate,
  isDragging,
  onHeightChange,
  textareaRef,
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setIsEditing(true);
    lockBodyScroll();
  };

  const stopEditing = () => {
    setIsEditing(false);
    unlockBodyScroll();
  };

  const focusEditableTextarea = () => {
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
    } catch (_) { }
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const textarea = e.target;

    // Verificar si el nuevo contenido excede la altura del contenedor
    const prevValue = textarea.value;
    const prevHeight = textarea.style.height;

    // Medir el nuevo contenido temporalmente
    textarea.style.height = 'auto';
    textarea.value = newValue;
    const scrollHeight = textarea.scrollHeight;

    // Si excede la altura máxima del contenedor, revertir
    if (scrollHeight > height) {
      textarea.value = prevValue;
      textarea.style.height = prevHeight;
      return; // No actualizar si excede el límite
    }

    // Si cabe, actualizar
    textarea.style.height = prevHeight;
    onUpdate?.(id, newValue);

    // Forzar scrollTop a 0
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.scrollTop = 0;
      }
    });
  };

  const handleTextareaKeyDown = (e) => {
    // Check for new line attempts (Enter, Shift+Enter, Ctrl+Enter)
    if (e.key === 'Enter') {
      const isModifier = e.ctrlKey || e.metaKey || e.shiftKey;

      // If it's a new line attempt (modifier + Enter)
      if (isModifier) {
        const el = e.target;

        // Check if adding a new line would exceed max height
        // We temporarily add a newline to measure
        const prevValue = el.value;
        const start = el.selectionStart ?? content.length;
        const end = el.selectionEnd ?? content.length;
        const potentialValue = (content || '').slice(0, start) + '\n' + (content || '').slice(end);

        // Measure potential height
        const prevHeight = el.style.height;
        el.style.height = 'auto';
        el.value = potentialValue;
        const potentialScrollHeight = el.scrollHeight;

        // Restore
        el.value = prevValue;
        el.style.height = prevHeight;

        if (potentialScrollHeight > MAX_CONTAINER_HEIGHT) {
          e.preventDefault();
          // Optional: Visual feedback or just ignore
          return;
        }

        // If it fits and it was Ctrl/Meta+Enter, we handle the insertion manually
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const newValue = potentialValue;
          onUpdate?.(id, newValue);
          setTimeout(() => {
            try {
              el.selectionStart = el.selectionEnd = start + 1;
            } catch (_) { }
          }, 0);
          return;
        }
        // If it fits and was Shift+Enter, let default behavior happen (or handle manually if needed)
        // Usually Shift+Enter is default behavior in textarea, but we might want to ensure consistency
        return;
      }

      // Enter without Shift/Ctrl/Meta -> Stop editing
      if (!e.shiftKey) {
        e.preventDefault();
        stopEditing();
        e.target.blur();
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing();
      e.target.blur();
    }
  };

  useEffect(() => {
    if (isDragging && textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.blur();
      setIsEditing(false);
    }
  }, [isDragging]);

  // Mantener el scroll siempre arriba (scrollTop = 0) para evitar que el texto suba
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Forzar scrollTop a 0 después de cada cambio de contenido
    textarea.scrollTop = 0;

    // También prevenir scroll automático durante la edición
    const handleScroll = (e) => {
      if (e.target.scrollTop !== 0) {
        e.target.scrollTop = 0;
      }
    };

    textarea.addEventListener('scroll', handleScroll);

    return () => {
      textarea.removeEventListener('scroll', handleScroll);
    };
  }, [content]);

  useEffect(() => {
    return () => {
      if (isEditing) {
        unlockBodyScroll();
      }
    };
  }, [isEditing]);

  return (
    <div className="noteitem-textarea-wrapper">
      <textarea
        ref={textareaRef}
        className="noteitem-textarea"
        value={content}
        onChange={handleTextChange}
        onClick={() => {
          if (isMobile && !isEditing && !isDragging) {
            startEditing();
            focusEditableTextarea();
          }
        }}
        onDoubleClick={() => {
          if (isMobile) return;
          if (!isDragging) {
            startEditing();
            focusEditableTextarea();
          }
        }}
        onFocus={(e) => {
          if (isMobile && !isEditing) {
            startEditing();
            setTimeout(() => {
              e.target.focus();
            }, 0);
          }
          if (!isMobile && !isEditing) {
            e.target.blur();
          }
        }}
        onMouseDown={(e) => {
          if (isMobile) return;
          if (!isEditing) {
            e.preventDefault();
            const dragContainer = e.target.closest('[data-drag-container]');
            if (dragContainer) {
              const mouseEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                clientX: e.clientX,
                clientY: e.clientY,
                button: e.button,
              });
              dragContainer.dispatchEvent(mouseEvent);
            }
          }
        }}
        onBlur={() => {
          stopEditing();
        }}
        onKeyDown={handleTextareaKeyDown}
        onTouchStart={(e) => {
          if (!isEditing && !isDragging) {
            const dragContainer = e.target.closest('[data-drag-container]');
            if (dragContainer) {
              dragContainer.dispatchEvent(new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: e.touches,
                targetTouches: e.targetTouches,
                changedTouches: e.changedTouches
              }));
            }
            e.preventDefault();
          }
        }}
        placeholder={isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit')}
        readOnly={isMobile ? false : !isEditing}
        inputMode="text"
        enterKeyHint="done"
        style={{
          cursor: isMobile ? 'text' : (isEditing ? 'text' : 'grab'),
          opacity: isMobile ? 1 : (isEditing ? 1 : 0.7),
          pointerEvents: isDragging ? 'none' : 'auto',
          backgroundColor: isEditing ? 'var(--color-bg-secondary)' : 'transparent',
          border: isEditing ? '1px solid var(--color-primary)' : '1px solid transparent',
          resize: 'none',
        }}
      />
    </div>
  );
}
