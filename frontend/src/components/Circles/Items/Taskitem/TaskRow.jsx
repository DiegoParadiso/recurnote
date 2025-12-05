import React from 'react';

export default function TaskRow({
  index,
  task,
  checked,
  inputRefsRef,
  isMobile,
  isDragging,
  wasDraggingRef,
  editingInputs,
  setEditingInputs,
  handleTaskChange,
  handleCheckChange,
  startEditing,
  stopEditing,
  handleInputKeyDown,
  focusEditableInput,

  taskHeight,
  placeholder,
  onInputFocus,
  onInputBlur,
}) {
  return (
    <div
      className="scroll-hidden taskitem-row"
      style={{ height: taskHeight }}
      onDoubleClick={() => {
        if (isMobile) return;
        if (editingInputs.has(index)) return; // Allow default double-click behavior (select text) if already editing
        if (!isDragging && !wasDraggingRef.current) {
          startEditing(index);
          focusEditableInput(index);
        }
      }}
    >
      <label
        tabIndex={0}
        className="checkbox-label"
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!isDragging && !wasDraggingRef.current) {
              handleCheckChange(index, !checked);
            }
          }
        }}
      >
        <input
          type="checkbox"
          className="checkbox-input"
          checked={checked}
          onChange={(e) => handleCheckChange(index, e.target.checked)}
          disabled={isDragging}
        />
        <span className={`checkbox-box ${checked ? 'checked' : ''}`}>
          <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="checkbox-svg">
            <path d="M1 5L4 8L11 1" />
          </svg>
        </span>
      </label>

      <input
        ref={(el) => {
          if (el) {
            inputRefsRef.current[index] = el;
          }
        }}
        type="text"
        value={task}
        onChange={(e) => handleTaskChange(index, e.target.value)}
        onClick={(e) => {
          if (isMobile && !editingInputs.has(index) && !isDragging && !wasDraggingRef.current) {
            startEditing(index);
            focusEditableInput(index);
          }
        }}
        onTouchStart={(e) => {
          // Bloquear completamente los eventos touch si el contenedor está en drag
          if (isDragging || wasDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (isMobile && !editingInputs.has(index)) {
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

        onBlur={() => {
          stopEditing(index);
          if (typeof onInputBlur === 'function') onInputBlur();
        }}
        onKeyDown={(e) => handleInputKeyDown(e, index)}
        placeholder={placeholder}
        className="taskitem-input"
        readOnly={isMobile ? false : !editingInputs.has(index)}
        inputMode="text"
        enterKeyHint="done"
        style={{
          cursor: isMobile ? 'text' : (editingInputs.has(index) ? 'text' : 'inherit'),
          opacity: isMobile ? 1 : (editingInputs.has(index) ? 1 : 0.7),
          pointerEvents: isDragging ? 'none' : (isMobile ? 'auto' : (editingInputs.has(index) ? 'auto' : 'none')),
          backgroundColor: editingInputs.has(index) ? 'var(--color-bg-secondary)' : 'transparent',
          border: editingInputs.has(index) ? '1px solid var(--color-primary)' : '1px solid transparent',
        }}
      />
    </div>
  );
}
