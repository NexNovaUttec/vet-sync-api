-- =====================================================
-- CRON SIMPLE: ELIMINAR REFRESH TOKENS EXPIRADOS
-- Elimina tokens creados hace más de 7 días
-- Ejecución: Diario a las 2:00 AM (Ciudad de México)
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Crear el cron job
SELECT cron.schedule(
  'limpiar-tokens-expirados',
  '0 2 * * *',  -- Diario a las 2:00 AM
  $$DELETE FROM refresh_tokens 
    WHERE created_at < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City' - INTERVAL '7 days');$$
);

-- =====================================================
-- COMANDOS DE GESTIÓN
-- =====================================================

-- Ver el job activo
SELECT jobid, jobname, schedule, command, active FROM cron.job;

-- Ver historial de ejecuciones
-- SELECT jobid, start_time, end_time, status, return_message
-- FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'limpiar-tokens-expirados')
-- ORDER BY start_time DESC LIMIT 10;

-- Ejecutar manualmente para probar
-- DELETE FROM refresh_tokens 
-- WHERE created_at < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City' - INTERVAL '7 days');

-- Ver cuántos tokens serían eliminados (SIN ELIMINAR)
-- SELECT COUNT(*) as tokens_a_eliminar
-- FROM refresh_tokens 
-- WHERE created_at < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City' - INTERVAL '7 days');

-- Pausar el cron job
-- UPDATE cron.job SET active = false WHERE jobname = 'limpiar-tokens-expirados';

-- Reactivar el cron job
-- UPDATE cron.job SET active = true WHERE jobname = 'limpiar-tokens-expirados';

-- Eliminar completamente el cron job
-- SELECT cron.unschedule('limpiar-tokens-expirados');