// Corre ANTES de que cualquier módulo sea importado.
// Garantiza que el cliente de Supabase se inicialice con una URL válida
// aunque las variables de entorno reales no estén presentes en CI.
// Los tests usan mocks de userModel, así que nunca se hacen llamadas reales.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.placeholder'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-ci'
