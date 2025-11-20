let lockCount = 0;
let savedScrollY = 0;

export function lockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

export function unlockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    const body = document.body;
    const top = body.style.top;
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.overflow = '';
    const y = top ? -parseInt(top, 10) || 0 : 0;
    window.scrollTo(0, y);
  }
}
