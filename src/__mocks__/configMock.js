// Mock de config.js para tests.
// Provee valores válidos que permiten que createClient() no lance errores,
// aunque los tests mockean userModel y nunca hacen llamadas reales a Supabase.
export const port = '3000'
export const NODE_ENV = 'test'
export const logger = 'dev'
export const supabaseUrl = 'https://placeholder.supabase.co'
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.placeholder_signature_for_testing'
export const apiKey = 'test-api-key'
export const allowedOrigins = ['http://localhost:5173']
