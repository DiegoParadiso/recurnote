import { useCallback, useRef, useState } from 'react';

const DEBOUNCE_SHOW_MS = 80;   // don't show if operation finishes within this window
const MIN_VISIBLE_MS = 600;   // once shown, keep visible for at least this long

/**
 * useLoadingOverlay
 *
 * Returns:
 *  - isLoading: boolean  → render <Loader fullScreen /> when true
 *  - withLoading(fn, opts) → wrap any sync/async action; handles show/hide with anti-bounce
 *    opts.immediate: true  → show loader immediately (skip debounce), for synchronous ops
 */
export default function useLoadingOverlay() {
    const [isLoading, setIsLoading] = useState(false);
    const showTimerRef = useRef(null);
    const shownAtRef = useRef(null);  // timestamp when loader became visible
    const isRunningRef = useRef(false); // prevent concurrent calls (button mashing)

    const withLoading = useCallback(async (fn, { immediate = false } = {}) => {
        // Guard: ignore if a loading cycle is already in progress
        if (isRunningRef.current) return;
        isRunningRef.current = true;

        const delay = immediate ? 0 : DEBOUNCE_SHOW_MS;

        // Schedule (or immediately trigger) the loader
        showTimerRef.current = setTimeout(() => {
            setIsLoading(true);
            shownAtRef.current = Date.now();
        }, delay);

        try {
            await fn();
        } finally {
            clearTimeout(showTimerRef.current);

            if (shownAtRef.current !== null) {
                // Loader is visible — keep it until MIN_VISIBLE_MS is satisfied
                const elapsed = Date.now() - shownAtRef.current;
                const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
                setTimeout(() => {
                    setIsLoading(false);
                    shownAtRef.current = null;
                    isRunningRef.current = false;
                }, remaining);
            } else {
                // Loader never appeared (op finished within debounce window)
                shownAtRef.current = null;
                isRunningRef.current = false;
            }
        }
    }, []);

    return { isLoading, withLoading };
}
