import React, { useRef, useEffect } from 'react';
import { formatText } from '@utils/textFormatter';
import { markdownToHtml, htmlToMarkdown } from '@utils/markdownConverter';

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
  const [hasContent, setHasContent] = React.useState(!!task);
  const lastValidContentRef = useRef(task || ''); // Store last valid content for revert

  // Sync content to div
  useEffect(() => {
    setHasContent(!!task);
    const el = inputRefsRef.current[index];
    if (el) {
      // Only sync if not editing to avoid cursor jumps, or if empty
      // But for TaskRow, we might need to sync on mount.
      // And if task updates from outside.

      // If we are editing, we assume local state is ahead.
      if (!editingInputs.has(index)) {
        el.innerHTML = markdownToHtml(task || '');
        lastValidContentRef.current = el.innerHTML;
      }
    }
  }, [task, index, editingInputs, inputRefsRef]);
  return (
    <div
      className="scroll-hidden taskitem-row"
      style={{
        height: taskHeight,
        display: 'flex',
        alignItems: 'center',
        position: 'relative' // Ensure absolute placeholder is relative to this row
      }}
      onDoubleClick={(e) => {
        if (editingInputs.has(index)) {
          e.stopPropagation();
          return;
        }
        if (isMobile) return;
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

      <div
        ref={(el) => {
          if (el) {
            inputRefsRef.current[index] = el;
          }
        }}
        contentEditable={!isDragging && (isMobile || editingInputs.has(index))}
        suppressContentEditableWarning={true}
        spellCheck={false}
        className="taskitem-input" // Reuse class for basic styling
        onInput={(e) => {
          const el = e.currentTarget;
          const html = el.innerHTML;
          const textContent = el.textContent;

          // Check width limit
          // If scrollWidth > clientWidth, we are overflowing
          // But we need to allow some buffer or check if it actually grew beyond visible bounds?
          // The user wants "se pueda escribir solo hasta allí".
          // If scrollWidth > clientWidth, it means content is wider than container.
          // Since we set overflow-x: auto (or hidden), it might scroll.
          // But user wants to STOP writing.

          if (el.scrollWidth > el.clientWidth) {
            // Revert content
            if (lastValidContentRef.current !== undefined) {
              el.innerHTML = lastValidContentRef.current;

              // Restore cursor position (end)
              try {
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
              } catch (_) { }
            }
            return;
          }

          lastValidContentRef.current = html;
          setHasContent(textContent.trim().length > 0 || (html && html !== '<br>'));
          const markdown = htmlToMarkdown(html);
          handleTaskChange(index, markdown);
        }}
        onBlur={() => {
          stopEditing(index);
          if (typeof onInputBlur === 'function') onInputBlur();
        }}
        onFocus={() => {
          if (typeof onInputFocus === 'function') onInputFocus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleInputKeyDown(e, index);
          }
        }}
        onDoubleClick={(e) => {
          // Fallback or keep for redundancy, but stop propagation
          e.stopPropagation();
        }}
        onClick={(e) => {
          if (isMobile && !editingInputs.has(index) && !isDragging && !wasDraggingRef.current) {
            startEditing(index);
            focusEditableInput(index);
          }
        }}
        onTouchStart={(e) => {
          if (isDragging || wasDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (isMobile && !editingInputs.has(index)) {
            // Logic to allow scrolling parent if needed, or focus
            // For now, let's keep it simple.
          }
        }}
        onMouseDown={(e) => {
          // Use e.detail to detect double click (2) or triple click (3)
          if (e.detail === 2) {
            e.stopPropagation();
            e.preventDefault(); // Prevent text selection/default double click behavior

            if (isMobile) return;
            if (!isDragging && !wasDraggingRef.current && !editingInputs.has(index)) {
              startEditing(index);
              focusEditableInput(index);
            }
          }
        }}
        style={{
          flex: 1,
          cursor: isMobile ? 'text' : (editingInputs.has(index) ? 'text' : 'inherit'),
          opacity: 1, // Changed from isMobile ? 1 : (editingInputs.has(index) ? 1 : 0.7) to always 1
          pointerEvents: isDragging ? 'none' : 'auto',
          backgroundColor: editingInputs.has(index) ? 'var(--color-bg-secondary)' : 'transparent',
          border: editingInputs.has(index) ? '1px solid var(--color-primary)' : '1px solid transparent',
          padding: '2px 4px',
          fontSize: '11.5px',
          color: 'var(--color-text-primary)',

          // Enforce single line
          whiteSpace: 'nowrap',
          wordBreak: 'keep-all',

          ...(editingInputs.has(index) ? {
            display: 'block',
            overflowX: 'auto', // Allow scrolling while editing if needed, or hidden if preferred
            overflowY: 'hidden',
            textOverflow: 'clip'
          } : {
            display: 'block', // Changed from -webkit-box to block for simple truncation
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }),

          boxSizing: 'border-box',
          textTransform: 'none',
          userSelect: editingInputs.has(index) ? 'text' : 'none',
          lineHeight: '1.5',
          fontFamily: 'inherit',
          outline: 'none',
          minHeight: '1.5em',
          maxHeight: '100%',
          // Override CSS height: 100% to allow flex centering from parent
          height: 'auto',
          width: '100%',
          marginTop: 0,
          alignSelf: 'auto'
        }}
      />
      {(!hasContent && !editingInputs.has(index)) && (
        <div style={{
          position: 'absolute',
          left: '30px', // Adjust based on checkbox width
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          opacity: 0.5,
          fontStyle: 'italic',
          fontSize: '11.5px',
          textTransform: 'none'
        }}>
          {placeholder}
        </div>
      )}
    </div>
  );
}
