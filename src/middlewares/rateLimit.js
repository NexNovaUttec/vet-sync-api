import rateLimit from 'express-rate-limit'

/**
 * Rate limiter general para prevenir saturación del API
 * Limita a 200 peticiones por 5 minutos por IP
 */
export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 200, // Límite de 200 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones, por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true, // Retorna información del rate limit en los headers `RateLimit-*`
  legacyHeaders: false // Deshabilita los headers `X-RateLimit-*`
})
