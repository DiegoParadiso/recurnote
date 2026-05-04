import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos de login desde esta IP, por favor intenta de nuevo después de 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Demasiados intentos de registro desde esta IP, por favor intenta de nuevo después de 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Demasiadas solicitudes de recuperación desde esta IP, por favor intenta de nuevo después de 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Limitar a 100 requests por minuto
  message: { message: 'Demasiadas peticiones a la API, por favor intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
