import React, { useState, useEffect, useRef } from 'react';
import { markdownToHtml, htmlToMarkdown } from '@utils/markdownConverter';
import { useTranslation } from 'react-i18next';
import useIsMobile from '@hooks/useIsMobile';
import { lockBodyScroll, unlockBodyScroll } from '@utils/scrollLock';

const MAX_CONTAINER_HEIGHT = 260;

import { useItems } from '@context/ItemsContext';

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
  const lastValidContentRef = useRef(content); // Store last valid HTML content
  const { captureUndoState, commitUndoState } = useItems();

  // We use textareaRef from props as the main ref for the div
  // This allows the parent to measure it.

  const startEditing = () => {
    setIsEditing(true);
    lockBodyScroll();
  };

  const stopEditing = () => {
    setIsEditing(false);
    unlockBodyScroll();
  };

  const focusEditor = () => {
    const el = textareaRef.current;
    if (!el) return;

    const focusOptions = { preventScroll: true };
    try {
      el.focus(focusOptions);
      // Move cursor to end
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (_) { }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {

      if (!isEditing) {
        const initialHtml = markdownToHtml(content || '');
        el.innerHTML = initialHtml;
        lastValidContentRef.current = initialHtml;
      } else {
      }
      if (!content && !isEditing) {
      }
    }
  }, [content, isEditing]);

  const handleInput = (e) => {
    const el = e.currentTarget;
    const html = el.innerHTML;
    const markdown = htmlToMarkdown(html);

    // Check height
    // Calculate overhead (padding/borders of parent)
    const currentRenderedHeight = el.offsetHeight;
    const overhead = Math.max(0, height - currentRenderedHeight);

    // Calculate desired height of the editor (content + padding + border)
    // scrollHeight includes padding but not border.
    // offsetHeight - clientHeight gives border width (vertical).
    const borderHeight = el.offsetHeight - el.clientHeight;
    const contentHeight = el.scrollHeight + borderHeight;

    const totalRequiredHeight = contentHeight + overhead;

    if (totalRequiredHeight > MAX_CONTAINER_HEIGHT) {
      // Revert content
      if (lastValidContentRef.current !== undefined) {
        el.innerHTML = lastValidContentRef.current;

        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (_) { }
      }
      return; // Stop update
    }

    // Valid content, update ref
    lastValidContentRef.current = html;

    // Request resize
    if (totalRequiredHeight > height) {
      onHeightChange?.(totalRequiredHeight);
    }

    onUpdate?.(id, markdown);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Prevent default div insertion if we want just BR?
      // Or let it be.
      // If we want to stop editing on Enter (without shift/ctrl/meta):
      // e.preventDefault();
      // stopEditing();
      // el.blur();

      // But usually notes allow newlines.
      // If the user wants to exit, maybe Escape?
      // Or click outside.
      // The original textarea stopped editing on Enter without Shift.
      // Let's preserve that behavior but allow Ctrl+Enter / Meta+Enter for newlines too.

      e.preventDefault();
      stopEditing();
      e.target.blur();
    } else if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
      // Allow newline
      // contentEditable handles this, but sometimes inserts <div>.
      // We might want to force <br>.
      // document.execCommand('insertLineBreak');
      // e.preventDefault();
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

  useEffect(() => {
    return () => {
      if (isEditing) {
        unlockBodyScroll();
      }
    };
  }, [isEditing]);

  return (
    <div className="noteitem-textarea-wrapper"
      onClick={(e) => {
        // Allow link clicks to propagate
        if (e.target.tagName === 'A' || e.target.closest('a')) {
          return;
        }
        if (isMobile && !isEditing && !isDragging) {
          startEditing();
          setTimeout(focusEditor, 0);
        }
      }}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <div
        ref={textareaRef}
        contentEditable={isEditing}
        className="noteitem-textarea"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // Commit undo state on blur
          commitUndoState?.(id);

          // Use setTimeout to check where focus went (more reliable than relatedTarget)
          setTimeout(() => {
            const activeEl = document.activeElement;
            if (activeEl) {
              const isToolbar = activeEl.closest('.text-selection-toolbar');
              const isModal = activeEl.closest('.link-input-modal-content') || activeEl.closest('.link-input-modal-overlay');
              if (isToolbar || isModal) {
                return;
              }
            }
            stopEditing();
          }, 0);
        }}
        onFocus={(e) => {
          // Capture undo state on focus
          captureUndoState?.(id);

          if (isMobile && !isEditing) {
            startEditing();
          }
        }}
        onDoubleClick={() => {
          if (!isMobile && !isEditing && !isDragging) {
            startEditing();
            setTimeout(focusEditor, 0);
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
          } else {
            e.stopPropagation(); // Allow text selection
          }
        }}
        onTouchStart={(e) => {
          if (!isEditing && !isDragging) {
            // Propagate drag
          } else {
            e.stopPropagation();
          }
        }}
        autoCapitalize="sentences"
        style={{
          minHeight: '1.5em',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowY: 'auto',
          overflowY: 'auto',
          // padding: '0', // Removed to respect CSS class padding
          fontSize: '11.5px',
          lineHeight: '1.5',
          color: 'var(--color-text-primary)',
          fontFamily: 'Inter, sans-serif',
          width: '100%',
          height: '100%',
          cursor: isEditing ? 'text' : 'grab',
          userSelect: isEditing ? 'text' : 'none',
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          boxSizing: 'border-box',
          textTransform: 'none'
        }}
        suppressContentEditableWarning={true}
      />

      {(!content && !isEditing) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          fontStyle: 'italic',
          opacity: 0.6,
          // Match padding of .noteitem-textarea
          paddingLeft: '1.5rem',
          paddingRight: '0.5rem',
          paddingTop: '0.3rem',
          paddingBottom: '0.5rem',
          fontSize: '11.5px',
          lineHeight: '1.5',
          color: 'var(--color-text-primary)',
          textTransform: 'none',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit')}
        </div>
      )}
    </div>
  );
}
