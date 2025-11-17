export function setupFetchTimeout() {
  if (typeof window === 'undefined') return;
  if (window.__fetchTimeoutPatched) return;
  const originalFetch = window.fetch?.bind(window) || fetch;
  // Deshabilitar timeout global por inactividad. Permitir solo por-request via init.timeout
  const defaultTimeout = 0;

  function redirectTo408() {
    try {
      if (document?.visibilityState === 'hidden') return;
      if (window.location?.pathname !== '/408') {
        window.location.assign('/408');
      }
    } catch {}
  }

  window.fetch = async function patchedFetch(input, init = {}) {
    const controller = new AbortController();
    const userSignal = init.signal;
    if (userSignal) {
      if (userSignal.aborted) controller.abort(userSignal.reason);
      else userSignal.addEventListener('abort', () => controller.abort(userSignal.reason), { once: true });
    }

    const timeoutMs = typeof init.timeout === 'number' ? init.timeout : defaultTimeout;
    let timeoutId;
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);
    }

    try {
      const response = await originalFetch(input, { ...init, signal: controller.signal });
      if (response && response.status === 408) {
        redirectTo408();
      }
      return response;
    } catch (err) {
      // En timeouts del lado del cliente o AbortError, NO redirigir automáticamente.
      // Esto evita falsos 408 tras inactividad/OS sleep. Mantener el error para manejo superior/reintentos.
      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  window.__fetchTimeoutPatched = true;
}
