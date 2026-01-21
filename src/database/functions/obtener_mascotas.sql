CREATE OR REPLACE FUNCTION obtener_mascotas(
    p_cliente_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,        
    nombre VARCHAR(100),
    nombre_cliente VARCHAR(202),
    nombre_especie VARCHAR(50),
    nombre_raza VARCHAR(100),
    edad INTEGER,
    sexo CHAR(1),
    img_url TEXT,
    fecha_registro TIMESTAMPTZ,
    activo BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.nombre,
        CONCAT(u.nombre, ' ', u.apellido)::VARCHAR(202) as nombre_cliente,
        e.nombre::VARCHAR(50) as nombre_especie,
        r.nombre::VARCHAR(100) as nombre_raza,
        m.edad,
        m.sexo,
        m.img_url,
        m.fecha_registro,
        m.activo
    FROM mascotas m
    INNER JOIN usuarios u ON m.cliente_id = u.id
    INNER JOIN especies e ON m.especie_id = e.id
    INNER JOIN razas r ON m.raza_id = r.id
    WHERE 
        (p_cliente_id IS NULL OR m.cliente_id = p_cliente_id)
        AND m.activo = TRUE
    ORDER BY m.fecha_registro DESC;
END;
$$;