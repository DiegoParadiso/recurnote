import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Strikethrough, Underline, Highlighter, Code, Link, RemoveFormatting } from 'lucide-react';
import '@styles/components/common/TextSelectionToolbar.css';
import LinkInputModal from './LinkInputModal';

export default function TextSelectionToolbar() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef(null);

    // modal de link
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [pendingLinkAction, setPendingLinkAction] = useState(null); // Función para ejecutar con la URL

    useEffect(() => {
        const handleMouseUp = (e) => {
            const activeEl = document.activeElement;
            const isContentEditable = activeEl.isContentEditable;
            const isTextInput = activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl.type === 'text');

            if (!isTextInput && !isContentEditable) {
                setVisible(false);
                return;
            }

            // If clicking inside the toolbar, do not reposition or hide
            if (toolbarRef.current && toolbarRef.current.contains(e.target)) {
                return;
            }

            // If clicking inside the modal, do not hide toolbar (though modal overlay usually blocks this)
            if (document.querySelector('.link-input-modal-content')?.contains(e.target)) {
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

                    // Calculate centered position
                    let leftPos = elRect.left + scrollX + (elRect.width / 2);

                    // Clamp to screen edges
                    // Toolbar width approx 320px (estimated safe max width for mobile toolbar)
                    // Half width = 160px
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

                    // Calculate centered position
                    let leftPos = rect.left + scrollX + (rect.width / 2);

                    // Clamp to screen edges
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
                    // Position toolbar above the mouse cursor as an approximation
                    // Ideally we would use the caret coordinates, but that requires a library or complex logic
                    // Using clientX/Y from the mouse event is a good "minimalist" heuristic for mouse selection

                    // Ensure it doesn't go off screen
                    const x = e.clientX;
                    const y = e.clientY - 10; // 10px offset

                    setPosition({ top: y, left: x });
                }
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        const handleSelectionChange = () => {
            // If modal is open, don't hide toolbar logic based on selection change
            if (isLinkModalOpen) return;

            const activeEl = document.activeElement;
            const isContentEditable = activeEl.isContentEditable;
            const isTextInput = activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl.type === 'text');

            if (!activeEl || (!isTextInput && !isContentEditable)) {
                setVisible(false);
                return;
            }

            if (isContentEditable) {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) {
                    setVisible(false);
                }
                return;
            }

            if (activeEl.selectionStart === activeEl.selectionEnd) {
                setVisible(false);
            }
        };

        const handleScroll = () => {
            if (visible && !isLinkModalOpen) setVisible(false);
        };

        const handleMouseDown = (e) => {
            // Don't hide if clicking the toolbar itself
            if (toolbarRef.current && toolbarRef.current.contains(e.target)) {
                return;
            }
            // Don't hide if clicking inside modal
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
            // Wait a bit for selection to settle after touch end
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
            document.execCommand('styleWithCSS', false, false);

            switch (type) {
                case 'bold':
                    document.execCommand('bold');
                    break;
                case 'italic':
                    document.execCommand('italic');
                    break;
                case 'strikethrough':
                    document.execCommand('strikeThrough');
                    break;
                case 'underline':
                    document.execCommand('underline');
                    break;
                case 'highlight':
                    document.execCommand('hiliteColor', false, '#fef08a');
                    break;
                case 'code':
                    // Code is tricky in execCommand, usually implies wrapping in <pre> or <code>
                    // Simple toggle implementation
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const parent = range.commonAncestorContainer.parentElement;
                        if (parent.tagName === 'CODE') {
                            // Unwrap
                            // This is complex to do perfectly with vanilla JS without a library
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
                    // Open Modal instead of prompt
                    // Save selection range if needed? 
                    // execCommand operates on current selection, so we must ensure selection is preserved or restored.
                    // When modal opens, focus is lost. We might need to restore it.
                    // But for contentEditable, selection might be lost if we focus input.

                    // Strategy: Save range
                    const selectionSaved = window.getSelection().getRangeAt(0).cloneRange();

                    setPendingLinkAction(() => (url) => {
                        // Restore selection
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(selectionSaved);

                        if (url) document.execCommand('createLink', false, url);
                    });
                    setIsLinkModalOpen(true);
                    return; // Return early, wait for modal
                case 'clear':
                    document.execCommand('removeFormat');
                    break;
            }
            return;
        }

        // Plain Text Mode (Textarea/Input)
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const text = activeEl.value;
        const selectedText = text.substring(start, end);

        let prefix = '';
        let suffix = '';

        switch (type) {
            case 'bold':
                prefix = '**';
                suffix = '**';
                break;
            case 'italic':
                prefix = '*';
                suffix = '*';
                break;
            case 'strikethrough':
                prefix = '~~';
                suffix = '~~';
                break;
            case 'underline':
                prefix = '__';
                suffix = '__';
                break;
            case 'highlight':
                prefix = '==';
                suffix = '==';
                break;
            case 'code':
                prefix = '`';
                suffix = '`';
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
                // Strip formatting from selected text
                // 1. Remove links: [text](url) -> text
                let cleaned = selectedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
                // 2. Remove other markers: **, __, ~~, ==, *, `
                cleaned = cleaned.replace(/(\*\*|__|~~|==|\*|`)/g, '');

                insertTextAtSelection(activeEl, cleaned, start, end);
                return;
            default:
                return;
        }

        const newText = prefix + selectedText + suffix;
        insertTextAtSelection(activeEl, newText, start, end);
    };

    const insertTextAtSelection = (activeEl, newText, start, end) => {
        try {
            activeEl.focus();
            // This is the most robust way to support undo/redo
            const success = document.execCommand('insertText', false, newText);

            if (success) {
                // Restore selection to cover the new text so toolbar stays visible
                activeEl.setSelectionRange(start, start + newText.length);
            } else {
                // Fallback
                activeEl.setRangeText(newText, start, end, 'select');
                // Manually trigger input event
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
                    <button onClick={() => applyFormat('highlight')} title="Highlight">
                        <Highlighter size={16} />
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
