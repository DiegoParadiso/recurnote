import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
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
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const textareaRef = useRef(null);
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
    } catch (_) {}
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    onUpdate?.(id, newValue);
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      const newValue = (content || '').slice(0, start) + '\n' + (content || '').slice(end);
      onUpdate?.(id, newValue);
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
  };

  useEffect(() => {
    if (isDragging && textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.blur();
      setIsEditing(false);
    }
  }, [isDragging]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxAvailableHeight = MAX_CONTAINER_HEIGHT - 16;
    const neededHeight = Math.min(scrollHeight, maxAvailableHeight);

    textarea.style.height = neededHeight + 'px';

    const desiredContainerHeight = Math.max(neededHeight + 16, height);
    if (desiredContainerHeight !== height) {
      onHeightChange?.(desiredContainerHeight);
    }
  }, [content, height, onHeightChange]);

  useEffect(() => {
    if (textareaRef.current && !isEditing) {
      const textarea = textareaRef.current;
      const availableHeight = height - 16;
      textarea.style.height = availableHeight + 'px';
    }
  }, [height, isEditing]);

  useEffect(() => {
    return () => {
      if (isEditing) {
        unlockBodyScroll();
      }
    };
  }, [isEditing]);

  return (
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
      onBlur={() => {
        stopEditing();
      }}
      onKeyDown={handleTextareaKeyDown}
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
  );
}
