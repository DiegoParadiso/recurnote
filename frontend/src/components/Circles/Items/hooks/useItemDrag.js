import { useRef, useState, useCallback, useEffect } from 'react';
import { useItems } from '@context/ItemsContext';

export default function useItemDrag({ id, onActivate, onItemDrop }) {
    const [isDragging, setIsDragging] = useState(false);
    const timeoutRef = useRef(null);
    const wasDraggingRef = useRef(false);
    const { markItemAsDragging, unmarkItemAsDragging, captureUndoState, commitUndoState } = useItems();

    const handleContainerDragStart = useCallback(() => {
        if (onActivate) onActivate();

        // Capture state for undo
        captureUndoState?.(id);

        // Marcar el item como en drag inmediatamente
        markItemAsDragging?.(id);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsDragging(true);
            wasDraggingRef.current = true;
        }, 100);
    }, [id, onActivate, markItemAsDragging, captureUndoState]);

    const handleContainerDragEnd = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsDragging(false);
        // Desmarcar el item como en drag inmediatamente para no ignorar el update de drop
        unmarkItemAsDragging?.(id);

        // Commit state for undo (check if changed)
        commitUndoState?.(id);

        if (onItemDrop) onItemDrop(id);
        setTimeout(() => {
            wasDraggingRef.current = false;
        }, 200);
    }, [id, onItemDrop, unmarkItemAsDragging, commitUndoState]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            unmarkItemAsDragging?.(id);
        };
    }, [id, unmarkItemAsDragging]);

    return {
        isDragging,
        wasDraggingRef,
        handleContainerDragStart,
        handleContainerDragEnd,
        setIsDragging,
    };
}
