// Type definitions for future TypeScript migration

/**
 * @typedef {Object} DisplayOptions
 * @property {boolean} year - Show year
 * @property {boolean} month - Show month
 * @property {boolean} week - Show week number
 * @property {boolean} weekday - Show weekday name
 * @property {boolean} day - Show day number
 * @property {boolean} time - Show time
 * @property {string} timeZone - Timezone for display
 * @property {'12h'|'24h'} timeFormat - Time format
 */

/**
 * @typedef {Object} Item
 * @property {number} id - Item ID
 * @property {string} label - Item label
 * @property {number} angle - Angle in degrees
 * @property {number} distance - Distance from center
 * @property {string|string[]} content - Item content
 * @property {boolean[]} [checked] - Checked state for tasks
 * @property {number} width - Item width
 * @property {number} height - Item height
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} rotation - Rotation in degrees
 * @property {boolean} rotation_enabled - Whether rotation is enabled
 */

/**
 * @typedef {Object} SelectedDay
 * @property {number} day - Day of month
 * @property {number} month - Month number
 * @property {number} year - Year
 */

export {};
