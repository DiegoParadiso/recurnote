export function setupFetchTimeout() {
  if (typeof window === 'undefined') return;
  if (window.__fetchTimeoutPatched) return;
  const originalFetch = window.fetch?.bind(window) || fetch;
  const defaultTimeout = Number(import.meta.env?.VITE_FETCH_TIMEOUT_MS) || 8000;

  function redirectTo408() {
    try {
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
      if (controller.signal.aborted && (controller.signal.reason === 'timeout' || err?.name === 'AbortError')) {
        redirectTo408();
      }
      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  window.__fetchTimeoutPatched = true;
}
