import { useState, useCallback } from 'react';

export default function useTaskEditing({ isMobile, inputRefsRef }) {
  const [editingInputs, setEditingInputs] = useState(new Set());

  const startEditing = useCallback((index) => {
    setEditingInputs(prev => new Set([...prev, index]));
  }, []);

  const stopEditing = useCallback((index) => {
    setEditingInputs(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const handleInputKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing(index);
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing(index);
      e.target.blur();
    }
  }, [stopEditing]);

  const focusEditableInput = useCallback((index) => {
    const el = inputRefsRef.current[index];
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
  }, [inputRefsRef, isMobile]);

  return { editingInputs, setEditingInputs, startEditing, stopEditing, handleInputKeyDown, focusEditableInput };
}
