import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Strikethrough, Underline, Code, Link, RemoveFormatting } from 'lucide-react';
import '@styles/components/common/TextSelectionToolbar.css';
import LinkInputModal from './LinkInputModal';

const calculateMobilePosition = (activeEl) => {
    const container = activeEl.closest('.item-card') || activeEl;
    const rect = container.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let leftPos = rect.left + scrollX + (rect.width / 2);
    const toolbarHalfWidth = 160;
    const margin = 10;
    const minLeft = toolbarHalfWidth + margin;
    const maxLeft = window.innerWidth - toolbarHalfWidth - margin;
    leftPos = Math.max(minLeft, Math.min(leftPos, maxLeft));

    return { top: rect.bottom + scrollY + 10, left: leftPos };
};

const insertTextAtSelection = (activeEl, newText, start, end) => {
    try {
        activeEl.focus();
        const success = document.execCommand('insertText', false, newText);

        if (success) {
            activeEl.setSelectionRange(start, start + newText.length);
        } else {
            activeEl.setRangeText(newText, start, end, 'select');
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } catch (e) {
        activeEl.setRangeText(newText, start, end, 'select');
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

const toggleWrapper = (activeEl, start, end, wrapper, conflicts = []) => {
    const text = activeEl.value;
    let currentText = text.substring(start, end);
    let currentStart = start;
    let currentEnd = end;
    let currentVal = text;

    if (currentText.startsWith(wrapper) && currentText.endsWith(wrapper)) {
        const unwrapped = currentText.slice(wrapper.length, -wrapper.length);
        insertTextAtSelection(activeEl, unwrapped, currentStart, currentEnd);
        return;
    }

    const before = currentVal.substring(currentStart - wrapper.length, currentStart);
    const after = currentVal.substring(currentEnd, currentEnd + wrapper.length);

    if (before === wrapper && after === wrapper) {
        const newVal = currentVal.substring(0, currentStart - wrapper.length) + currentText + currentVal.substring(currentEnd + wrapper.length);
        activeEl.value = newVal;
        activeEl.setSelectionRange(currentStart - wrapper.length, currentEnd - wrapper.length);
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }

    conflicts.forEach(conflict => {
        if (currentText.startsWith(conflict) && currentText.endsWith(conflict)) {
            currentText = currentText.slice(conflict.length, -conflict.length);
            const newVal = currentVal.substring(0, currentStart) + currentText + currentVal.substring(currentEnd);
            activeEl.value = newVal;
            currentVal = newVal;
            currentEnd = currentStart + currentText.length;
            activeEl.setSelectionRange(currentStart, currentEnd);
        }
    });

    conflicts.forEach(conflict => {
        const cBefore = currentVal.substring(currentStart - conflict.length, currentStart);
        const cAfter = currentVal.substring(currentEnd, currentEnd + conflict.length);
        if (cBefore === conflict && cAfter === conflict) {
            const newVal = currentVal.substring(0, currentStart - conflict.length) + currentText + currentVal.substring(currentEnd + conflict.length);
            activeEl.value = newVal;
            currentVal = newVal;
            currentStart -= conflict.length;
            currentEnd -= conflict.length;
            activeEl.setSelectionRange(currentStart, currentEnd);
        }
    });

    currentVal = activeEl.value;
    currentStart = activeEl.selectionStart;
    currentEnd = activeEl.selectionEnd;
    currentText = currentVal.substring(currentStart, currentEnd);

    const newText = wrapper + currentText + wrapper;
    insertTextAtSelection(activeEl, newText, currentStart, currentEnd);
};

export default function TextSelectionToolbar() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef(null);
    const isMouseDown = useRef(false);

    // modal de link
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [pendingLinkAction, setPendingLinkAction] = useState(null); // Función para ejecutar con la URL

    useEffect(() => {
        const updatePosition = (e) => {
            const activeEl = document.activeElement;
            const isContentEditable = activeEl.isContentEditable;
            const isTextInput = activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl.type === 'text');

            if (!isTextInput && !isContentEditable) {
                setVisible(false);
                return;
            }

            if (e && toolbarRef.current && toolbarRef.current.contains(e.target)) return;
            if (e && document.querySelector('.link-input-modal-content')?.contains(e.target)) return;

            const isMobile = window.matchMedia('(max-width: 768px)').matches;

            if (isContentEditable) {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) {
                    setVisible(false);
                    return;
                }
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                if (isMobile) {
                    setPosition(calculateMobilePosition(activeEl));
                } else {
                    setPosition({ top: rect.top - 10, left: rect.left + (rect.width / 2) });
                }
                setVisible(true);
                return;
            }

            const start = activeEl.selectionStart;
            const end = activeEl.selectionEnd;

            if (start !== end) {
                if (isMobile) {
                    setPosition(calculateMobilePosition(activeEl));
                } else {
                    if (e && e.clientX) {
                        setPosition({ top: e.clientY - 10, left: e.clientX });
                    } else {
                        const rect = activeEl.getBoundingClientRect();
                        setPosition({ top: rect.top - 10, left: rect.left + (rect.width / 2) });
                    }
                }
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        const handleMouseUp = (e) => {
            isMouseDown.current = false;
            updatePosition(e);
        };

        const handleSelectionChange = () => {
            if (isLinkModalOpen) return;
            if (isMouseDown.current) return; // Wait for mouseup

            // Debounce or just call updatePosition?
            // selectionchange fires rapidly. But updatePosition is relatively cheap.
            // Let's call it.
            updatePosition();
        };

        const handleScroll = () => {
            if (visible && !isLinkModalOpen) setVisible(false);
        };

        const handleMouseDown = (e) => {
            isMouseDown.current = true;
            if (toolbarRef.current && toolbarRef.current.contains(e.target)) {
                return;
            }
            if (document.querySelector('.link-input-modal-content')?.contains(e.target)) {
                return;
            }
            if (!isLinkModalOpen) {
                setVisible(false);
            }
        };

        const handleKeyUp = (e) => {
            handleSelectionChange();
        };

        const handleTouchEnd = (e) => {
            setTimeout(() => {
                handleMouseUp(e);
            }, 100);
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('selectionchange', handleSelectionChange);
        window.addEventListener('scroll', handleScroll, { capture: true });
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('selectionchange', handleSelectionChange);
            window.removeEventListener('scroll', handleScroll, { capture: true });
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [visible, isLinkModalOpen]);

    const handleRichTextFormat = (type, activeEl) => {
        switch (type) {
            case 'bold':
                document.execCommand('styleWithCSS', false, false);
                document.execCommand('bold');
                break;
            case 'italic':
                document.execCommand('styleWithCSS', false, false);
                document.execCommand('italic');
                break;
            case 'strikethrough':
                document.execCommand('styleWithCSS', false, false);
                document.execCommand('strikeThrough');
                break;
            case 'underline':
                document.execCommand('styleWithCSS', false, false);
                document.execCommand('underline');
                break;
            case 'code':
                document.execCommand('removeFormat');
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('hiliteColor', false, 'transparent');

                const selCode = window.getSelection();
                if (selCode.rangeCount > 0) {
                    const range = selCode.getRangeAt(0);
                    const parent = range.commonAncestorContainer.parentElement;
                    if (parent.tagName === 'CODE' || (parent.tagName === 'SPAN' && parent.style.background.includes('150'))) {
                        document.execCommand('removeFormat');
                    } else {
                        const span = document.createElement('code');
                        span.style.background = 'rgba(150,150,150,0.2)';
                        span.style.padding = '2px 4px';
                        span.style.borderRadius = '4px';
                        span.style.fontFamily = 'monospace';
                        range.surroundContents(span);
                    }
                }
                break;
            case 'link':
                const selectionSaved = window.getSelection().getRangeAt(0).cloneRange();
                setPendingLinkAction(() => (url) => {
                    activeEl.focus();
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(selectionSaved);

                    if (url) {
                        const fragment = selectionSaved.cloneContents();
                        const div = document.createElement('div');
                        div.appendChild(fragment);
                        const innerHTML = div.innerHTML;

                        const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">${innerHTML}</a>`;
                        document.execCommand('insertHTML', false, anchor);
                        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
                setIsLinkModalOpen(true);
                return;
            case 'clear':
                document.execCommand('styleWithCSS', false, false);
                document.execCommand('removeFormat');
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('removeFormat');
                document.execCommand('hiliteColor', false, 'transparent');
                document.execCommand('unlink');

                const selClear = window.getSelection();
                if (selClear.rangeCount > 0) {
                    const range = selClear.getRangeAt(0);
                    let node = range.commonAncestorContainer;
                    if (node.nodeType === 3) node = node.parentElement;

                    if (['SPAN', 'MARK', 'CODE', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'A'].includes(node.tagName)) {
                        if (node.tagName === 'A') {
                            const parent = node.parentNode;
                            while (node.firstChild) parent.insertBefore(node.firstChild, node);
                            parent.removeChild(node);
                        }
                    }
                }
                break;
        }

        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handlePlainTextFormat = (type, activeEl) => {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const text = activeEl.value;
        const selectedText = text.substring(start, end);

        switch (type) {
            case 'bold':
                toggleWrapper(activeEl, start, end, '**', ['`']);
                break;
            case 'italic':
                toggleWrapper(activeEl, start, end, '*', ['`']);
                break;
            case 'strikethrough':
                toggleWrapper(activeEl, start, end, '~~', ['`']);
                break;
            case 'underline':
                toggleWrapper(activeEl, start, end, '__', ['`']);
                break;
            case 'code':
                toggleWrapper(activeEl, start, end, '`', ['**', '*', '~~', '__']);
                break;
            case 'link':
                setPendingLinkAction(() => (url) => {
                    if (url) {
                        const newText = `[${selectedText}](${url})`;
                        insertTextAtSelection(activeEl, newText, start, end);
                    }
                    activeEl.focus();
                });
                setIsLinkModalOpen(true);
                return;
            case 'clear':
                let cleaned = selectedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
                cleaned = cleaned.replace(/(\*\*|__|~~|\*|`)/g, '');
                insertTextAtSelection(activeEl, cleaned, start, end);
                return;
        }
    };

    const applyFormat = (type) => {
        const activeEl = document.activeElement;
        if (!activeEl) return;

        if (activeEl.isContentEditable) {
            handleRichTextFormat(type, activeEl);
        } else {
            handlePlainTextFormat(type, activeEl);
        }
    };

    if (!visible && !isLinkModalOpen) return null;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const mobileStyle = isMobile ? {
        position: 'absolute',
        transform: 'translateX(-50%)',
        marginTop: 0
    } : {};

    return createPortal(
        <>
            {visible && (
                <div
                    className="text-selection-toolbar"
                    style={{
                        top: position.top,
                        left: position.left,
                        ...mobileStyle
                    }}
                    ref={toolbarRef}
                    onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
                >
                    <button onClick={() => applyFormat('bold')} title="Bold">
                        <Bold size={16} />
                    </button>
                    <button onClick={() => applyFormat('italic')} title="Italic">
                        <Italic size={16} />
                    </button>
                    <button onClick={() => applyFormat('strikethrough')} title="Strikethrough">
                        <Strikethrough size={16} />
                    </button>
                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                    <button onClick={() => applyFormat('underline')} title="Underline">
                        <Underline size={16} />
                    </button>
                    <button onClick={() => applyFormat('code')} title="Code">
                        <Code size={16} />
                    </button>
                    <button onClick={() => applyFormat('link')} title="Link">
                        <Link size={16} />
                    </button>
                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                    <button onClick={() => applyFormat('clear')} title="Clear Formatting">
                        <RemoveFormatting size={16} />
                    </button>
                </div>
            )}

            <LinkInputModal
                isOpen={isLinkModalOpen}
                onClose={() => {
                    setIsLinkModalOpen(false);
                    setPendingLinkAction(null);
                }}
                onConfirm={(url) => {
                    if (pendingLinkAction) pendingLinkAction(url);
                }}
            />
        </>,
        document.body
    );
}
