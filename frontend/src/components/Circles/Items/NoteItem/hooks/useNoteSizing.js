import { useState, useLayoutEffect } from 'react';
import { getFontFromComputedStyle, measureTextWidth, measureLongestLineWidth } from '@utils/measureTextWidth';

export default function useNoteSizing({ textareaRef, content, width, height, id, onUpdate, t, isMobile }) {
  const [minWidthPx, setMinWidthPx] = useState(120);
  const [minHeightPx, setMinHeightPx] = useState(40);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    let containerPaddingLeft = 8;
    let containerPaddingRight = 8;
    try {
      const dragWrapper = el.closest('[data-drag-container]');
      const containerEl = dragWrapper ? dragWrapper.parentElement : null;
      if (containerEl) {
        const ccs = window.getComputedStyle(containerEl);
        containerPaddingLeft = parseFloat(ccs.paddingLeft || '8') || 8;
        containerPaddingRight = parseFloat(ccs.paddingRight || '8') || 8;
      }
    } catch (_) { }
    const placeholderText = isMobile ? t('note.placeholderMobile') : t('common.doubleClickToEdit');
    try {
      const cs = window.getComputedStyle(el);
      const font = getFontFromComputedStyle(cs);
      const measure = (text) => measureTextWidth(text, font);
      const paddingLeft = parseFloat(cs.paddingLeft || '0');
      const paddingRight = parseFloat(cs.paddingRight || '0');
      const borders = 2;
      const extraSafety = 16;
      const placeholderWidth = measure(placeholderText);
      const desiredFromPlaceholder = Math.ceil(
        placeholderWidth + paddingLeft + paddingRight + borders + extraSafety + containerPaddingLeft + containerPaddingRight
      );
      const lines = (content || '').split('\n');
      const longest = measureLongestLineWidth(lines, font);
      const desiredFromContent = Math.ceil(
        longest + paddingLeft + paddingRight + borders + extraSafety + containerPaddingLeft + containerPaddingRight
      );
      const desired = Math.max(desiredFromPlaceholder, desiredFromContent);
      const baseMin = 200;
      const maxAllowed = 250;
      const minW = Math.max(baseMin, Math.min(maxAllowed, desired));
      setMinWidthPx(minW);
      if (width < minW) {
        onUpdate?.(id, content, null, { width: minW, height });
      }
    } catch (_) { }
  }, [t, isMobile, width, height, id, content, onUpdate, textareaRef]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    try {
      const prevHeight = el.style.height;
      el.style.height = 'auto';
      let containerPaddingTop = 8;
      let containerPaddingBottom = 8;
      const dragWrapper = el.closest('[data-drag-container]');
      const containerEl = dragWrapper ? dragWrapper.parentElement : null;
      if (containerEl) {
        const ccs = window.getComputedStyle(containerEl);
        containerPaddingTop = parseFloat(ccs.paddingTop || '8') || 8;
        containerPaddingBottom = parseFloat(ccs.paddingBottom || '8') || 8;
      }
      const scrollHeight = el.scrollHeight;
      const desiredMinHeight = Math.max(40, Math.ceil(scrollHeight + containerPaddingTop + containerPaddingBottom));
      setMinHeightPx(desiredMinHeight);
      if (height < desiredMinHeight) {
        onUpdate?.(id, content, null, { width, height: desiredMinHeight });
      }
      el.style.height = prevHeight;
    } catch (_) { }
  }, [content, width, height, id, onUpdate, textareaRef]);

  return { minWidthPx, minHeightPx };
}
