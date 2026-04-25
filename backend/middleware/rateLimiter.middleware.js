import rateLimit from 'express-rate-limit';

// Limitador estricto para rutas de autenticación (Login, Registro, Password Reset)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limitar cada IP a 10 requests por ventana
  message: { message: 'Demasiados intentos desde esta IP, por favor intenta de nuevo después de 15 minutos.' },
  standardHeaders: true, // Retorna la información de límite en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

// Limitador general para API
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Limitar a 100 requests por minuto
  message: { message: 'Demasiadas peticiones a la API, por favor intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
