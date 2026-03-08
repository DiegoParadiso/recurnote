/**
 * Module-level drag coordinator.
 *
 * Tracks when ANY draggable component (UnifiedContainer, CircleSmall, etc.)
 * finishes a drag gesture so that sibling/child components can suppress
 * the synthetic click that browsers fire after mouseup/touchend.
 *
 * This is intentionally a plain module (not React context) so values are
 * always synchronous and never stale inside closures.
 */

let _dragEndTime = 0;

/**
 * Call this whenever a drag gesture ends with actual movement.
 */
export function notifyDragEnd() {
    _dragEndTime = Date.now();
}

/**
 * Returns true if a drag ended within the last `withinMs` milliseconds.
 * Default window is 300 ms — long enough to cover the synthetic click
 * that browsers fire after touchend, even on older iOS.
 */
export function wasDragRecently(withinMs = 300) {
    return Date.now() - _dragEndTime < withinMs;
}
