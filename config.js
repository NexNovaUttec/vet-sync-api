import dotenv from 'dotenv'
dotenv.config()

export const {
  PORT: port = '3000',
  NODE_ENV,
  logger = NODE_ENV === 'production' ? 'combined' : 'dev',
  SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: supabaseKey,
  API_KEY: apiKey,
  ALLOWED_ORIGINS: envOrigins = 'http://localhost:5173, https://vet-sync.vercel.app',
  allowedOrigins = envOrigins.split(',').map(origin => origin.trim())
} = process.env
