-- =====================================================
-- SCRIPT COMPLETO: CRON PARA GESTIÓN DE ESTADOS DE CITAS
-- Sistema de actualización automática de estados basado en horarios
-- Zona horaria: Ciudad de México (America/Mexico_City)
-- =====================================================

-- 1. Habilitar la extensión pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Crear tabla de logs (opcional pero recomendada)
CREATE TABLE IF NOT EXISTS logs_cron (
  id SERIAL PRIMARY KEY,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accion TEXT NOT NULL,
  detalles TEXT,
  error TEXT
);

-- 3. Función para actualizar citas a "En Curso"
CREATE OR REPLACE FUNCTION actualizar_citas_en_curso()
RETURNS TABLE(citas_actualizadas INTEGER, detalles TEXT) AS $$
DECLARE 
  actualizadas INTEGER := 0;
  resultado TEXT := '';
  fecha_mexico DATE;
  hora_mexico TIME;
BEGIN
  -- Obtener fecha y hora actual en Ciudad de México
  fecha_mexico := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::DATE;
  hora_mexico := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::TIME;
  
  -- Actualizar citas que deben estar "En Curso"
  WITH citas_a_actualizar AS (
    UPDATE citas 
    SET status = 'En Curso'
    WHERE status IN ('Programada', 'Reprogramada')
      AND fecha <= fecha_mexico
      AND hora_inicio <= hora_mexico
      AND hora_fin >= hora_mexico
      AND status != 'Cancelada'
    RETURNING id
  )
  SELECT COUNT(*) INTO actualizadas FROM citas_a_actualizar;
  
  resultado := 'Citas actualizadas a En Curso: ' || actualizadas || 
               ' (Hora México: ' || hora_mexico || ', Fecha: ' || fecha_mexico || ')';
  
  RETURN QUERY SELECT actualizadas, resultado;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para actualizar citas a "Completada"
CREATE OR REPLACE FUNCTION actualizar_citas_completadas()
RETURNS TABLE(citas_actualizadas INTEGER, detalles TEXT) AS $$
DECLARE 
  actualizadas INTEGER := 0;
  resultado TEXT := '';
  fecha_mexico DATE;
  hora_mexico TIME;
BEGIN
  -- Obtener fecha y hora actual en Ciudad de México
  fecha_mexico := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::DATE;
  hora_mexico := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::TIME;
  
  -- Actualizar citas que deben estar "Completadas"
  WITH citas_a_actualizar AS (
    UPDATE citas 
    SET status = 'Completada'
    WHERE status IN ('Programada', 'Reprogramada', 'En Curso')
      AND (
        fecha < fecha_mexico 
        OR (fecha = fecha_mexico AND hora_fin < hora_mexico)
      )
      AND status != 'Cancelada'
    RETURNING id
  )
  SELECT COUNT(*) INTO actualizadas FROM citas_a_actualizar;
  
  resultado := 'Citas actualizadas a Completada: ' || actualizadas || 
               ' (Hora México: ' || hora_mexico || ', Fecha: ' || fecha_mexico || ')';
  
  RETURN QUERY SELECT actualizadas, resultado;
END;
$$ LANGUAGE plpgsql;

-- 5. Función unificada principal
CREATE OR REPLACE FUNCTION gestionar_estados_citas()
RETURNS TABLE(
  en_curso_actualizadas INTEGER, 
  completadas_actualizadas INTEGER,
  resultado TEXT
) AS $$
DECLARE 
  en_curso_count INTEGER := 0;
  completadas_count INTEGER := 0;
  resultado_final TEXT := '';
  fecha_hora_mexico TIMESTAMP;
BEGIN
  -- Obtener fecha y hora actual en Ciudad de México
  fecha_hora_mexico := CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City';
  
  -- Ejecutar actualización a "En Curso"
  SELECT citas_actualizadas INTO en_curso_count 
  FROM actualizar_citas_en_curso();
  
  -- Ejecutar actualización a "Completada"  
  SELECT citas_actualizadas INTO completadas_count 
  FROM actualizar_citas_completadas();
  
  resultado_final := 'Proceso completado - En curso: ' || en_curso_count || 
                     ', Completadas: ' || completadas_count ||
                     ' (Ejecutado: ' || fecha_hora_mexico || ')';
  
  -- Log del resultado con hora de México
  INSERT INTO logs_cron (fecha_hora, accion, detalles) 
  VALUES (fecha_hora_mexico, 'gestionar_estados_citas', resultado_final);
  
  RETURN QUERY SELECT en_curso_count, completadas_count, resultado_final;
EXCEPTION WHEN OTHERS THEN
  -- Log de errores con hora de México
  INSERT INTO logs_cron (fecha_hora, accion, detalles, error) 
  VALUES (fecha_hora_mexico, 'gestionar_estados_citas', 'Error en ejecución', SQLERRM);
  
  RETURN QUERY SELECT 0, 0, 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 6. Función de utilidad para verificar zona horaria
CREATE OR REPLACE FUNCTION verificar_zona_horaria()
RETURNS TABLE(
  descripcion TEXT,
  valor TEXT
) AS $$
BEGIN
  RETURN QUERY SELECT 
    'Hora UTC'::TEXT,
    CURRENT_TIMESTAMP::TEXT;
  
  RETURN QUERY SELECT 
    'Hora Ciudad de México'::TEXT,
    (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::TEXT;
    
  RETURN QUERY SELECT 
    'Fecha UTC'::TEXT,
    CURRENT_DATE::TEXT;
    
  RETURN QUERY SELECT 
    'Fecha Ciudad de México'::TEXT,
    (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')::DATE::TEXT;
    
  RETURN QUERY SELECT 
    'Zona horaria del servidor'::TEXT,
    current_setting('TIMEZONE')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. Eliminar job anterior si existe
SELECT cron.unschedule('actualizar-estados-citas');

-- 8. Crear el cron job para ejecutarse cada 15 minutos
SELECT cron.schedule(
  'actualizar-estados-citas',       -- Nombre del job
  '*/15 * * * *',                   -- Cada 15 minutos
  'SELECT gestionar_estados_citas();' -- Comando a ejecutar
);

-- =====================================================
-- COMANDOS DE GESTIÓN Y MONITOREO
-- =====================================================

-- Ver jobs activos
-- SELECT jobid, jobname, schedule, command, active FROM cron.job;

-- Ver historial de ejecuciones
-- SELECT 
--   jobid,
--   runid,
--   start_time,
--   end_time,
--   status,
--   return_message
-- FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'actualizar-estados-citas')
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Ver logs de la aplicación
-- SELECT 
--   fecha_hora,
--   accion,
--   detalles,
--   error
-- FROM logs_cron 
-- ORDER BY fecha_hora DESC 
-- LIMIT 10;

-- Ejecutar manualmente para probar
-- SELECT gestionar_estados_citas();

-- Verificar zona horaria
-- SELECT * FROM verificar_zona_horaria();

-- Pausar el cron job
-- UPDATE cron.job SET active = false WHERE jobname = 'actualizar-estados-citas';

-- Reactivar el cron job
-- UPDATE cron.job SET active = true WHERE jobname = 'actualizar-estados-citas';

-- Eliminar el cron job
-- SELECT cron.unschedule('actualizar-estados-citas');