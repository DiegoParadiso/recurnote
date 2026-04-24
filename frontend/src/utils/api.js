const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

export async function apiFetch(url, options = {}) {
  let token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !options._retry) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
       return response;
    }

    if (isRefreshing) {
      return new Promise(resolve => {
        refreshSubscribers.push(newToken => {
          headers['Authorization'] = `Bearer ${newToken}`;
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
        body: JSON.stringify({ refreshToken })
      });

      if (!refreshRes.ok) {
         localStorage.removeItem('token');
         localStorage.removeItem('refreshToken');
         localStorage.removeItem('user');
         window.location.reload();
         throw new Error('Refresh failed');
      }

      const data = await refreshRes.json();
      localStorage.setItem('token', data.token);
      headers['Authorization'] = `Bearer ${data.token}`;
      
      onRefreshed(data.token);
      isRefreshing = false;

      return fetch(url, { ...options, headers });
    } catch (err) {
      isRefreshing = false;
      return response;
    }
  }

  return response;
}
