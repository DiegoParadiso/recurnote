const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

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
        refreshSubscribers.push((failedResponse) => {
          if (failedResponse) {
            resolve(failedResponse);
          } else {
            resolve(fetch(url, { ...options, headers }));
          }
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
         isRefreshing = false;
         localStorage.removeItem('user');
         window.dispatchEvent(new CustomEvent('auth:expired'));
         
         // Resolver cualquier petición pendiente con la respuesta original 401
         refreshSubscribers.forEach(cb => cb(response));
         refreshSubscribers = [];
         
         return response; // Devolver la respuesta 401 original para que no se congele
      }
      
      // onRefreshed(null); // Esto estaba ejecutando fetch en los subscribers
      isRefreshing = false;
      
      // Ejecutar los callbacks pendientes para que vuelvan a intentar el fetch
      refreshSubscribers.forEach(cb => cb());
      refreshSubscribers = [];

      return fetch(url, { ...options, headers });
    } catch (err) {
      isRefreshing = false;
      refreshSubscribers.forEach(cb => cb(response));
      refreshSubscribers = [];
      return response; 
    }
  }

  return response;
}
