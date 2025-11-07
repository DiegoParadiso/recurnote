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
  touchStartPosRef,
  touchIsDragRef,
  taskHeight,
  placeholder,
}) {
  return (
    <div className="scroll-hidden taskitem-row" style={{ height: taskHeight }}>
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
        onTouchStart={(e) => {
          if (isMobile && !editingInputs.has(index) && !isDragging && !wasDraggingRef.current) {
            touchStartPosRef.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              time: Date.now(),
              inputIndex: index
            };
            touchIsDragRef.current = false;
          }
        }}
        onTouchMove={(e) => {
          if (isMobile) {
            e.preventDefault();
            // No stopPropagation: permitir que el contenedor maneje el drag
            if (touchStartPosRef.current) {
              const touch = e.touches[0];
              const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
              const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 10) {
                touchIsDragRef.current = true;
                touchStartPosRef.current = null;
              }
            }
          }
        }}
        onTouchEnd={(e) => {
          if (isMobile && touchStartPosRef.current && !touchIsDragRef.current && !isDragging && !wasDraggingRef.current) {
            const timeSinceStart = Date.now() - touchStartPosRef.current.time;
            const inputIndex = touchStartPosRef.current.inputIndex;
            if (timeSinceStart < 300 && inputIndex === index && !editingInputs.has(index)) {
              e.stopPropagation();
              setEditingInputs(prev => new Set([...prev, index]));
              requestAnimationFrame(() => {
                const el = inputRefsRef.current[index];
                if (el) {
                  el.focus();
                  const len = (el.value || '').length;
                  if (typeof el.setSelectionRange === 'function') {
                    el.setSelectionRange(len, len);
                  }
                }
              });
            }
          }
          touchStartPosRef.current = null;
          touchIsDragRef.current = false;
        }}
        onDoubleClick={() => {
          if (isMobile) return;
          if (!isDragging && !wasDraggingRef.current) {
            startEditing(index);
            focusEditableInput(index);
          }
        }}
        onClick={() => {
          if (isMobile && !editingInputs.has(index) && !isDragging && !wasDraggingRef.current) {
            startEditing(index);
            focusEditableInput(index);
          }
        }}
        onFocus={(e) => {
          if (isMobile) {
            if (!editingInputs.has(index)) {
              startEditing(index);
              setTimeout(() => {
                e.target.focus();
              }, 0);
            }
            return;
          }
          if (!editingInputs.has(index)) {
            e.target.blur();
          }
        }}
        onMouseDown={(e) => {
          if (isMobile) return;
          if (!editingInputs.has(index)) {
            e.preventDefault();
            const dragContainer = e.target.closest('[data-drag-container]');
            if (dragContainer) {
              const mouseEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                clientX: e.clientX,
                clientY: e.clientY,
                button: e.button
              });
              dragContainer.dispatchEvent(mouseEvent);
            }
          }
        }}
        onBlur={() => {
          stopEditing(index);
        }}
        onKeyDown={(e) => handleInputKeyDown(e, index)}
        placeholder={placeholder}
        className="taskitem-input"
        readOnly={isMobile ? false : !editingInputs.has(index)}
        inputMode="text"
        enterKeyHint="done"
        style={{
          cursor: isMobile ? 'text' : (editingInputs.has(index) ? 'text' : 'grab'),
          opacity: isMobile ? 1 : (editingInputs.has(index) ? 1 : 0.7),
          pointerEvents: isDragging ? 'none' : 'auto',
          backgroundColor: editingInputs.has(index) ? 'var(--color-bg-secondary)' : 'transparent',
          border: editingInputs.has(index) ? '1px solid var(--color-primary)' : '1px solid transparent',
        }}
      />
    </div>
  );
}
