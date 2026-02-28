import { useState, useLayoutEffect } from 'react';
import { getFontFromComputedStyle, measureTextWidth } from '@utils/measureTextWidth';

export default function useTaskSizing({
  isMobile,
  t,
  inputRefsRef,
  item,
  computedMinHeight,
}) {
  const [minWidthPx, setMinWidthPx] = useState(140);

  useLayoutEffect(() => {
    try {
      let refInput = null;
      for (const ref of Object.values(inputRefsRef.current)) {
        if (ref) { refInput = ref; break; }
      }

      let tempInput = null;
      if (!refInput) {
        tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        refInput = tempInput;
      }

      const cs = window.getComputedStyle(refInput);
      let containerPaddingLeft = 8;
      let containerPaddingRight = 8;
      const dragContainer = document.querySelector('[data-drag-container]');
      const containerEl = dragContainer ? dragContainer.parentElement : null;
      if (containerEl) {
        const ccs = window.getComputedStyle(containerEl);
        containerPaddingLeft = parseFloat(ccs.paddingLeft || '8') || 8;
        containerPaddingRight = parseFloat(ccs.paddingRight || '8') || 8;
      }

      const font = getFontFromComputedStyle(cs);
      const measure = (text) => measureTextWidth(text || '', font);

      const placeholderText = isMobile ? t('task.placeholderMobile') : t('common.doubleClickToEdit');
      const tasks = (item.content || []).length > 0 ? (item.content || []) : [placeholderText];
      let longest = 0;
      for (const tsk of tasks) {
        longest = Math.max(longest, measure(tsk || placeholderText));
      }

      const paddingLeft = parseFloat(cs.paddingLeft || '0');
      const paddingRight = parseFloat(cs.paddingRight || '0');
      const checkboxAndGaps = 14 + 8 + 2; // checkbox + gap + minor adj
      const borders = 2;
      const extraSafety = 16;
      const desired = Math.ceil(
        longest + paddingLeft + paddingRight + checkboxAndGaps + borders + extraSafety + containerPaddingLeft + containerPaddingRight
      );
      const baseMin = 148;
      const maxAllowed = 400;
      const minW = Math.max(baseMin, Math.min(maxAllowed, desired));
      setMinWidthPx(minW);

      if (tempInput) {
        document.body.removeChild(tempInput);
      }
    } catch (_) { }
  }, [item.content, item.width, computedMinHeight, isMobile, t]);

  return { minWidthPx };
}
