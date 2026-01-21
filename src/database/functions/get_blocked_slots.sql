-- =============================================
-- Función para obtener horarios bloqueados para un servicio en un día específico
-- =============================================

CREATE OR REPLACE FUNCTION get_blocked_slots_for_day(
    p_servicio_id INTEGER,
    p_fecha DATE
)
RETURNS TABLE (
    hora_formateada TEXT
) AS $$
DECLARE
    slot_time TIME;
    service_duration INTEGER;
    service_category_id INTEGER;
    day_letter TEXT;
    hora_inicio_general TIME := '07:00:00';
    hora_fin_general TIME := '20:00:00';
    intervalo_minutos INTEGER := 30;
BEGIN
    -- Obtener información del servicio
    SELECT s.duracion_estimada, s.categoria_id 
    INTO service_duration, service_category_id
    FROM servicios s 
    WHERE s.id = p_servicio_id AND s.activo = true;
    
    -- Si el servicio no existe, retornar vacío
    IF service_duration IS NULL THEN
        RETURN;
    END IF;
    
    -- Obtener la letra del día
    day_letter := CASE EXTRACT(DOW FROM p_fecha)
        WHEN 0 THEN 'D'  -- Domingo
        WHEN 1 THEN 'L'  -- Lunes
        WHEN 2 THEN 'M'  -- Martes
        WHEN 3 THEN 'W'  -- Miércoles
        WHEN 4 THEN 'J'  -- Jueves
        WHEN 5 THEN 'V'  -- Viernes
        WHEN 6 THEN 'S'  -- Sábado
    END;
    
    -- Iterar por cada hora en intervalos de 30 minutos
    slot_time := hora_inicio_general;
    WHILE slot_time <= (hora_fin_general - (service_duration || ' minutes')::INTERVAL) LOOP
        
        DECLARE
            appointment_end_time TIME;
            available_count INTEGER := 0;
        BEGIN
            appointment_end_time := slot_time + (service_duration || ' minutes')::INTERVAL;
            
            -- Contar profesionales disponibles para este horario
            SELECT COUNT(DISTINCT p.id) INTO available_count
            FROM profesionales p
            INNER JOIN profesional_categorias pc ON p.id = pc.profesional_id
            INNER JOIN horarios_profesionales hp ON p.id = hp.profesional_id
            WHERE p.activo = true 
                AND pc.activo = true
                AND pc.categoria_id = service_category_id
                -- El profesional trabaja este día
                AND hp.dias_trabajo LIKE '%' || day_letter || '%'
                -- La cita completa está dentro del horario laboral
                AND hp.hora_inicio <= slot_time 
                AND hp.hora_fin >= appointment_end_time
                -- No tiene citas que se superpongan
                AND NOT EXISTS (
                    SELECT 1 FROM citas c 
                    WHERE c.profesional_id = p.id 
                        AND c.fecha = p_fecha
                        AND c.status IN ('Programada', 'En Curso')
                        AND NOT (
                            -- La nueva cita termina antes de que empiece la existente
                            appointment_end_time <= c.hora_inicio OR
                            -- La nueva cita empieza después de que termine la existente
                            slot_time >= c.hora_fin
                        )
                );
            
            -- Si no hay profesionales disponibles, agregar a horarios bloqueados
            IF available_count = 0 THEN
                hora_formateada := TO_CHAR(slot_time, 'HH24:MI');
                RETURN NEXT;
            END IF;
        END;
        
        -- Avanzar al siguiente intervalo (30 minutos)
        slot_time := slot_time + (intervalo_minutos || ' minutes')::INTERVAL;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;
