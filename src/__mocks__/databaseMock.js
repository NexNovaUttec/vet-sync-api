// Mock del cliente de Supabase para tests.
// Los tests de authController mockean userModel directamente,
// así que nunca se necesita una conexión real.
export const supabase = {
  from: () => ({ select: () => ({ limit: () => Promise.resolve({ error: null }) }) })
}

export const initDatabaseConnection = () => Promise.resolve()
