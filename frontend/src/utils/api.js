const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

export async function apiFetch(url, options = {}) {
  options.credentials = 'include';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !options._retry) {
    if (isRefreshing) {
      return new Promise(resolve => {
        refreshSubscribers.push(() => {
          resolve(fetch(url, { ...options, headers }));
        });
      });
    }

    isRefreshing = true;
    options._retry = true;

    try {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!refreshRes.ok) {
         localStorage.removeItem('user');
         window.location.reload();
         throw new Error('Refresh failed');
      }
      
      onRefreshed(null);
      isRefreshing = false;

      return fetch(url, { ...options, headers });
    } catch (err) {
      isRefreshing = false;
      return response;
    }
  }

  return response;
}
