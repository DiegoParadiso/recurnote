import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Strikethrough, Underline, Highlighter, Code, Link, RemoveFormatting } from 'lucide-react';
import '@styles/components/common/TextSelectionToolbar.css';

export default function TextSelectionToolbar() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef(null);

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

            // For contentEditable, we need to check the selection from window
            if (isContentEditable) {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed) {
                    setVisible(false);
                    return;
                }
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setPosition({ top: rect.top - 10, left: rect.left + (rect.width / 2) });
                setVisible(true);
                return;
            }

            // For Textarea/Input
            const start = activeEl.selectionStart;
            const end = activeEl.selectionEnd;

            if (start !== end) {
                // We have a selection
                // Position toolbar above the mouse cursor as an approximation
                // Ideally we would use the caret coordinates, but that requires a library or complex logic
                // Using clientX/Y from the mouse event is a good "minimalist" heuristic for mouse selection

                // Ensure it doesn't go off screen
                const x = e.clientX;
                const y = e.clientY - 10; // 10px offset

                setPosition({ top: y, left: x });
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        const handleSelectionChange = () => {
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
            if (visible) setVisible(false);
        };

        const handleMouseDown = (e) => {
            // Don't hide if clicking the toolbar itself
            if (toolbarRef.current && toolbarRef.current.contains(e.target)) {
                return;
            }
            setVisible(false);
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('selectionchange', handleSelectionChange);
        window.addEventListener('scroll', handleScroll, { capture: true });
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('selectionchange', handleSelectionChange);
            window.removeEventListener('scroll', handleScroll, { capture: true });
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [visible]);

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
                    const url = window.prompt('Enter URL:', 'https://');
                    if (url) document.execCommand('createLink', false, url);
                    break;
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
                const url = window.prompt('Enter URL:', 'https://');
                if (url) {
                    prefix = '[';
                    suffix = `](${url})`;
                } else {
                    return;
                }
                break;
            case 'clear':
                // Strip formatting from selected text
                // 1. Remove links: [text](url) -> text
                let cleaned = selectedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
                // 2. Remove other markers: **, __, ~~, ==, *, `
                cleaned = cleaned.replace(/(\*\*|__|~~|==|\*|`)/g, '');

                const newTextClear = cleaned;
                try {
                    activeEl.focus();
                    const success = document.execCommand('insertText', false, newTextClear);

                    if (success) {
                        // Restore selection to cover the new text so toolbar stays visible
                        activeEl.setSelectionRange(start, start + newTextClear.length);
                    } else {
                        // Fallback
                        activeEl.setRangeText(newTextClear, start, end, 'select');
                        // Manually trigger input event
                        const event = new Event('input', { bubbles: true });
                        activeEl.dispatchEvent(event);
                    }
                } catch (e) {
                    // Fallback
                    activeEl.setRangeText(newTextClear, start, end, 'select');
                    const event = new Event('input', { bubbles: true });
                    activeEl.dispatchEvent(event);
                }
                // Do not hide toolbar
                // setVisible(false);
                return;
            default:
                return;
        }

        // Check if already formatted (simple check)
        // If the selection itself contains the markers at edges, remove them
        // Or if the surrounding text has markers

        // Simple implementation: Just wrap
        // Ideally we would toggle, but that requires more complex parsing

        const newText = prefix + selectedText + suffix;

        // Use execCommand if possible to preserve undo history, but it's deprecated
        // For textareas, setRangeText is standard but doesn't trigger undo in all browsers
        // A trick is to use execCommand('insertText')

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

        // setVisible(false); // Keep visible
    };

    if (!visible) return null;

    return createPortal(
        <div
            className="text-selection-toolbar"
            style={{ top: position.top, left: position.left }}
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
        </div>,
        document.body
    );
}
