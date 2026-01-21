import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from '#root/config.js'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const verifyConnection = async () => {
  try {
    const { error } = await supabase.from('usuarios').select('id').limit(1)
    if (error) throw error
  } catch (error) {
    console.error('Failed to connect to database:', error.message)
  }
}

export const initDatabaseConnection = () => {
  return verifyConnection()
}
