export const MOBILE_BOTTOM_SAFE_OFFSET = 60; // altura de controles inferiores móviles
export const RIGHT_SIDEBAR_MOBILE_WIDTH = 'calc(100vw - 50px)';
export const RIGHT_SIDEBAR_Z_INDEX = 70;
export const LEFT_SIDEBAR_Z_INDEX = 100;

// Sidebars
export const SIDEBAR_WIDTH_PX = 260;
export const SIDEBAR_WIDTH = `${SIDEBAR_WIDTH_PX}px`;
export const SIDEBAR_HOVER_STRIP_WIDTH = 60;
export const SIDEBAR_HOVER_STRIP_WIDTH_PX = `${SIDEBAR_HOVER_STRIP_WIDTH}px`;
export const NAVBAR_TOP_OFFSET = 60; // si hay barra superior

// Curved Sidebar Mobile
export const MOBILE_CAROUSEL_HEIGHT = 96;
export const MOBILE_CAROUSEL_HEIGHT_PX = `${MOBILE_CAROUSEL_HEIGHT}px`;

// Z-Index helpers (mirror theme.css)
export const Z_INDEX = {
  base: 1,
  low: 10,
  mid: 20,
  high: 30,
  overlay: 40,
  modal: 70,
  floating: 100,
  toast: 9999,
};

// Theme color helpers (for inline usages that need programmatic values)
export const THEME = {
  bg: 'var(--color-bg)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  neutral: 'var(--color-neutral)'
};


