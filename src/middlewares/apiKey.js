import { apiKey } from '#root/config.js'

export const validateApiKey = (req, res, next) => {
  // Obtener API key desde headers o query params
  const providedApiKey = req.headers['x-api-key'] || req.headers['api-key']

  if (!providedApiKey) {
    return res.status(401).json({
      error: 'API key requerida',
      message: 'Incluye la API key en el header "x-api-key"'
    })
  }

  if (providedApiKey !== apiKey) {
    return res.status(401).json({
      error: 'API key inválida'
    })
  }

  next()
}
