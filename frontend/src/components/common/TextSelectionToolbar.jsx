import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Strikethrough, Underline, Code, Link, RemoveFormatting } from 'lucide-react';
import '@styles/components/common/TextSelectionToolbar.css';
import LinkInputModal from './LinkInputModal';

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

            // If clicking inside the toolbar, do not reposition or hide
            if (e && toolbarRef.current && toolbarRef.current.contains(e.target)) {
                return;
            }

            // If clicking inside the modal, do not hide toolbar (though modal overlay usually blocks this)
            if (e && document.querySelector('.link-input-modal-content')?.contains(e.target)) {
                return;
            }

            // For contentEditable, we need to check the selection from window
            if (isContentEditable) {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) {
                    setVisible(false);
                    return;
                }
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                const isMobile = window.matchMedia('(max-width: 768px)').matches;
                if (isMobile) {
                    // Position below the item container to avoid covering text
                    const container = activeEl.closest('.item-card') || activeEl;
                    const elRect = container.getBoundingClientRect();
                    const scrollY = window.scrollY;
                    const scrollX = window.scrollX;

                    // Calcular posición centrada
                    let leftPos = elRect.left + scrollX + (elRect.width / 2);

                    // Toolbar width aproximado 320px
                    const toolbarHalfWidth = 160;
                    const margin = 10;
                    const minLeft = toolbarHalfWidth + margin;
                    const maxLeft = window.innerWidth - toolbarHalfWidth - margin;

                    leftPos = Math.max(minLeft, Math.min(leftPos, maxLeft));

                    setPosition({
                        top: elRect.bottom + scrollY + 10,
                        left: leftPos
                    });
                } else {
                    setPosition({ top: rect.top - 10, left: rect.left + (rect.width / 2) });
                }
                setVisible(true);
                return;
            }

            // For Textarea/Input
            const start = activeEl.selectionStart;
            const end = activeEl.selectionEnd;

            if (start !== end) {
                // We have a selection

                // Check if mobile
                const isMobile = window.matchMedia('(max-width: 768px)').matches;

                if (isMobile) {
                    // Position below the item container
                    const container = activeEl.closest('.item-card') || activeEl;
                    const rect = container.getBoundingClientRect();

                    const scrollY = window.scrollY;
                    const scrollX = window.scrollX;

                    let leftPos = rect.left + scrollX + (rect.width / 2);

                    // Esquinas
                    const toolbarHalfWidth = 160;
                    const margin = 10;
                    const minLeft = toolbarHalfWidth + margin;
                    const maxLeft = window.innerWidth - toolbarHalfWidth - margin;

                    leftPos = Math.max(minLeft, Math.min(leftPos, maxLeft));

                    setPosition({
                        top: rect.bottom + scrollY + 10,
                        left: leftPos
                    });
                } else {
                    // Desktop behavior (near cursor)
                    // If we have a mouse event, use it. Otherwise (keyboard), center on element.
                    if (e && e.clientX) {
                        const x = e.clientX;
                        const y = e.clientY - 10;
                        setPosition({ top: y, left: x });
                    } else {
                        // Fallback for keyboard selection on desktop textarea
                        const rect = activeEl.getBoundingClientRect();
                        setPosition({
                            top: rect.top - 10,
                            left: rect.left + (rect.width / 2)
                        });
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

    const applyFormat = (type) => {
        const activeEl = document.activeElement;
        if (!activeEl) return;

        if (activeEl.isContentEditable) {
            // Rich Text Mode

            switch (type) {
                case 'bold':
                    document.execCommand('styleWithCSS', false, false);
                    // If in code, remove code format first
                    if (document.queryCommandState('backColor')) { // Check if background color is applied (approx check for code/highlight)
                        // Ideally we check specific color but execCommand is limited.
                        // Let's just try to remove format if it looks like code?
                        // Actually, let's just apply bold. If it was code, it might become <b><code>...</code></b>
                        // But our converter now handles that by prioritizing code.
                        // However, user wants "Code should not have bold".
                        // So we should remove code.
                        // But we can't easily detect "Code" vs "Highlight" with just queryCommandState('backColor').
                        // We can check the node.
                    }
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
                    // Code is exclusive. Remove EVERYTHING else.
                    document.execCommand('removeFormat'); // Removes bold, italic, etc.
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('hiliteColor', false, 'transparent'); // Ensure highlight is gone

                    // Now apply code
                    const selCode = window.getSelection();
                    if (selCode.rangeCount > 0) {
                        const range = selCode.getRangeAt(0);
                        const parent = range.commonAncestorContainer.parentElement;
                        // Toggle off if already code
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
                        // Restore focus first!
                        activeEl.focus();

                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(selectionSaved);

                        if (url) {
                            // Use insertHTML to ensure link is created with inner content preserved
                            const fragment = selectionSaved.cloneContents();
                            const div = document.createElement('div');
                            div.appendChild(fragment);
                            const innerHTML = div.innerHTML;

                            // Add styles to match markdownToHtml output so it looks like a link immediately
                            const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">${innerHTML}</a>`;
                            document.execCommand('insertHTML', false, anchor);

                            // Trigger input event
                            const event = new Event('input', { bubbles: true });
                            activeEl.dispatchEvent(event);
                        }
                    });
                    setIsLinkModalOpen(true);
                    return;
                case 'clear':
                    // 1. Remove semantic tags (bold, italic, etc.) - styleWithCSS: false
                    document.execCommand('styleWithCSS', false, false);
                    document.execCommand('removeFormat');

                    // 2. Remove inline styles (highlight, color) - styleWithCSS: true
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('removeFormat');
                    document.execCommand('hiliteColor', false, 'transparent'); // Explicitly clear highlight
                    document.execCommand('unlink'); // Remove links

                    // 3. Manual cleanup of spans/anchors if execCommand failed (aggressive)
                    const selClear = window.getSelection();
                    if (selClear.rangeCount > 0) {
                        const range = selClear.getRangeAt(0);
                        let node = range.commonAncestorContainer;
                        if (node.nodeType === 3) node = node.parentElement;

                        // If we are inside a span/mark/code/anchor, unwrap it
                        if (['SPAN', 'MARK', 'CODE', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'A'].includes(node.tagName)) {
                            // This is hard to do safely without a library, but execCommand should have handled it.
                            // If not, we might need to rely on the user clicking again.
                            // For links specifically, let's try to unwrap if it's an anchor
                            if (node.tagName === 'A') {
                                const parent = node.parentNode;
                                while (node.firstChild) parent.insertBefore(node.firstChild, node);
                                parent.removeChild(node);
                            }
                        }
                    }
                    break;
            }

            // Trigger input event to ensure React state updates
            const event = new Event('input', { bubbles: true });
            activeEl.dispatchEvent(event);

            return;
        }

        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const text = activeEl.value;
        const selectedText = text.substring(start, end);

        let prefix = '';
        let suffix = '';

        const toggleWrapper = (wrapper, conflicts = []) => {
            let currentText = selectedText;
            let currentStart = start;
            let currentEnd = end;
            let currentVal = text;

            // 1. Check if the SELECTION ITSELF contains the wrapper (e.g. user selected "==text==")
            if (currentText.startsWith(wrapper) && currentText.endsWith(wrapper)) {
                // Unwrap
                const unwrapped = currentText.slice(wrapper.length, -wrapper.length);
                insertTextAtSelection(activeEl, unwrapped, currentStart, currentEnd);
                return;
            }

            // 2. Check if the selection is SURROUNDED by the wrapper (e.g. user selected "text" inside "==text==")
            const before = currentVal.substring(currentStart - wrapper.length, currentStart);
            const after = currentVal.substring(currentEnd, currentEnd + wrapper.length);

            if (before === wrapper && after === wrapper) {
                // Unwrap: Remove wrapper before and after
                const newVal = currentVal.substring(0, currentStart - wrapper.length) + currentText + currentVal.substring(currentEnd + wrapper.length);
                activeEl.value = newVal;
                // Restore selection (it shifts back by wrapper length)
                activeEl.setSelectionRange(currentStart - wrapper.length, currentEnd - wrapper.length);
                const event = new Event('input', { bubbles: true });
                activeEl.dispatchEvent(event);
                return;
            }

            // 3. Remove conflicts from selected text (e.g. user selected "**text**" and wants to highlight)
            conflicts.forEach(conflict => {
                if (currentText.startsWith(conflict) && currentText.endsWith(conflict)) {
                    currentText = currentText.slice(conflict.length, -conflict.length);
                    // Update value
                    const newVal = currentVal.substring(0, currentStart) + currentText + currentVal.substring(currentEnd);
                    activeEl.value = newVal;
                    currentVal = newVal;
                    currentEnd = currentStart + currentText.length;
                    activeEl.setSelectionRange(currentStart, currentEnd);
                }
            });

            // 4. Remove conflicts from surrounding text
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

            // Re-read values after conflict removal
            currentVal = activeEl.value;
            currentStart = activeEl.selectionStart;
            currentEnd = activeEl.selectionEnd;
            currentText = currentVal.substring(currentStart, currentEnd);

            // 5. Apply wrapper
            const newText = wrapper + currentText + wrapper;
            insertTextAtSelection(activeEl, newText, currentStart, currentEnd);
        };

        switch (type) {
            case 'bold':
                toggleWrapper('**', ['`']);
                break;
            case 'italic':
                toggleWrapper('*', ['`']);
                break;
            case 'strikethrough':
                toggleWrapper('~~', ['`']);
                break;
            case 'underline':
                toggleWrapper('__', ['`']);
                break;
            case 'code':
                toggleWrapper('`', ['**', '*', '~~', '__']);
                break;
            case 'link':
                // Open Modal
                setPendingLinkAction(() => (url) => {
                    if (url) {
                        const newText = `[${selectedText}](${url})`;
                        insertTextAtSelection(activeEl, newText, start, end);
                    }
                    // Restore focus to input
                    activeEl.focus();
                });
                setIsLinkModalOpen(true);
                return; // Wait for modal
            case 'clear':
                let cleaned = selectedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
                cleaned = cleaned.replace(/(\*\*|__|~~|\*|`)/g, '');

                insertTextAtSelection(activeEl, cleaned, start, end);
                return;
            default:
                return;
        }
    };

    const insertTextAtSelection = (activeEl, newText, start, end) => {
        try {
            activeEl.focus();
            const success = document.execCommand('insertText', false, newText);

            if (success) {
                activeEl.setSelectionRange(start, start + newText.length);
            } else {
                // Fallback
                activeEl.setRangeText(newText, start, end, 'select');
                const event = new Event('input', { bubbles: true });
                activeEl.dispatchEvent(event);
            }
        } catch (e) {
            // Fallback
            activeEl.setRangeText(newText, start, end, 'select');
            const event = new Event('input', { bubbles: true });
            activeEl.dispatchEvent(event);
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
