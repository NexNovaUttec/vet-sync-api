-- =============================================
-- Database initialization script for VetSync API
-- =============================================

-- Enable necessary extensions
-- ===========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- Users and Authentication
-- ========================
CREATE TABLE public.usuarios (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    direccion TEXT NULL,
    jwt_secret TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_registro TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
) TABLESPACE pg_default;

CREATE TABLE public.refresh_tokens (
    id SERIAL NOT NULL,
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NULL DEFAULT NOW(),
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash),
    CONSTRAINT refresh_tokens_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE
) TABLESPACE pg_default;

-- Administrators
-- ==============
CREATE TABLE public.administradores (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN NULL DEFAULT true,
    fecha_registro TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT administradores_pkey PRIMARY KEY (id),
    CONSTRAINT administradores_email_key UNIQUE (email)
) TABLESPACE pg_default;

-- Pet Management
-- ==============
CREATE TABLE public.especies (
    id SERIAL NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    CONSTRAINT especies_pkey PRIMARY KEY (id),
    CONSTRAINT especies_nombre_key UNIQUE (nombre)
) TABLESPACE pg_default;

CREATE TABLE public.razas (
    id SERIAL NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie_id INTEGER NULL,
    CONSTRAINT razas_pkey PRIMARY KEY (id),
    CONSTRAINT razas_nombre_especie_id_key UNIQUE (nombre, especie_id),
    CONSTRAINT razas_especie_id_fkey 
        FOREIGN KEY (especie_id) 
        REFERENCES public.especies(id) 
        ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE TABLE public.mascotas (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    cliente_id UUID NOT NULL,
    especie_id INTEGER NOT NULL,
    raza_id INTEGER NOT NULL,
    edad INTEGER NULL,
    sexo CHAR(1) NULL,
    img_url TEXT NULL,
    fecha_registro TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NULL DEFAULT true,
    CONSTRAINT mascotas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_cliente 
        FOREIGN KEY (cliente_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_especie 
        FOREIGN KEY (especie_id) 
        REFERENCES public.especies(id),
    CONSTRAINT fk_raza 
        FOREIGN KEY (raza_id) 
        REFERENCES public.razas(id),
    CONSTRAINT mascotas_sexo_check 
        CHECK (sexo = ANY (ARRAY['M'::bpchar, 'H'::bpchar]))
) TABLESPACE pg_default;

-- Services
-- ========
CREATE TABLE public.categorias_servicio (
    id SERIAL NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NULL DEFAULT true,
    CONSTRAINT categorias_servicio_pkey PRIMARY KEY (id),
    CONSTRAINT categorias_servicio_nombre_key UNIQUE (nombre)
) TABLESPACE pg_default;

CREATE TABLE public.servicios (
    id SERIAL NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    categoria_id INTEGER NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    duracion_estimada INTEGER NOT NULL, -- en minutos
    img_url TEXT NULL,
    activo BOOLEAN NULL DEFAULT true,
    CONSTRAINT servicios_pkey PRIMARY KEY (id),
    CONSTRAINT fk_categoria 
        FOREIGN KEY (categoria_id) 
        REFERENCES public.categorias_servicio(id) 
        ON DELETE RESTRICT
) TABLESPACE pg_default;

-- Tabla de profesionales (veterinarios)
CREATE TABLE public.profesionales (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NULL,
    telefono VARCHAR(20) NULL,
    especialidad VARCHAR(100) NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_registro TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profesionales_pkey PRIMARY KEY (id),
    CONSTRAINT profesionales_email_key UNIQUE (email)
);

-- Tabla de relación entre profesionales y categorías de servicio
CREATE TABLE public.profesional_categorias (
    profesional_id UUID NOT NULL,
    categoria_id INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profesional_categorias_pkey PRIMARY KEY (profesional_id, categoria_id),
    CONSTRAINT fk_profesional
        FOREIGN KEY (profesional_id) 
        REFERENCES public.profesionales(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_categoria_servicio
        FOREIGN KEY (categoria_id) 
        REFERENCES public.categorias_servicio(id)
        ON DELETE CASCADE
);

-- Tabla de horarios de profesionales
CREATE TABLE public.horarios_profesionales (
    id SERIAL NOT NULL,
    profesional_id UUID NOT NULL,
    dias_trabajo VARCHAR(10) NOT NULL, -- L=Lu, M=Ma, W=Mi, J=Ju, V=Vi, S=Sá, D=Do
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fecha_creacion TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horarios_profesionales_pkey PRIMARY KEY (id),
    CONSTRAINT fk_profesional_horario
        FOREIGN KEY (profesional_id) 
        REFERENCES public.profesionales(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_horario_valido 
        CHECK (hora_fin > hora_inicio),
    CONSTRAINT chk_dias_trabajo 
        CHECK (dias_trabajo ~ '^[LMWJVSD]+$')
);


-- =============================================
-- Citas
-- =============================================

-- Tabla principal de citas
CREATE TABLE public.citas (
    id SERIAL NOT NULL,
    cliente_id UUID NOT NULL,
    mascota_id UUID NOT NULL,
    profesional_id UUID NOT NULL,
    servicio_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Programada',
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo_consulta TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT citas_pkey PRIMARY KEY (id),
    CONSTRAINT fk_cliente
        FOREIGN KEY (cliente_id) 
        REFERENCES public.usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_mascota
        FOREIGN KEY (mascota_id) 
        REFERENCES public.mascotas(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_profesional
        FOREIGN KEY (profesional_id) 
        REFERENCES public.profesionales(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_servicio
        FOREIGN KEY (servicio_id) 
        REFERENCES public.servicios(id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_status_valido 
        CHECK (status IN ('Programada', 'En Curso', 'Completada', 'Cancelada', 'No asistió', 'Reprogramada')),
    CONSTRAINT chk_horario_valido 
        CHECK (hora_fin > hora_inicio)
);

-- Función para actualizar automáticamente la fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente la fecha de actualización
CREATE TRIGGER trigger_actualizar_citas
    BEFORE UPDATE ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Usuarios y Autenticación
-- ========================
CREATE INDEX IF NOT EXISTS idx_usuarios_email 
    ON public.usuarios(email);

CREATE INDEX IF NOT EXISTS idx_usuarios_activo 
    ON public.usuarios(activo) 
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_usuarios_fecha_registro 
    ON public.usuarios(fecha_registro);

-- Tokens de Actualización
-- =======================
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash 
    ON public.refresh_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
    ON public.refresh_tokens(user_id);

-- Administradores
-- ===============
CREATE INDEX IF NOT EXISTS idx_administradores_email 
    ON public.administradores(email);

CREATE INDEX IF NOT EXISTS idx_administradores_activo 
    ON public.administradores(activo) 
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_administradores_fecha_registro 
    ON public.administradores(fecha_registro);

-- Especies y Razas
-- ================
CREATE INDEX IF NOT EXISTS idx_especies_nombre 
    ON public.especies(nombre);

CREATE INDEX IF NOT EXISTS idx_razas_nombre 
    ON public.razas(nombre);

CREATE INDEX IF NOT EXISTS idx_razas_especie_id 
    ON public.razas(especie_id);

-- Mascotas
-- ========
CREATE INDEX IF NOT EXISTS idx_mascotas_cliente_id 
    ON public.mascotas(cliente_id);

CREATE INDEX IF NOT EXISTS idx_mascotas_especie_id 
    ON public.mascotas(especie_id);

CREATE INDEX IF NOT EXISTS idx_mascotas_raza_id 
    ON public.mascotas(raza_id);

CREATE INDEX IF NOT EXISTS idx_mascotas_activo 
    ON public.mascotas(activo) 
    WHERE activo = true;

-- Servicios
-- =========
CREATE INDEX IF NOT EXISTS idx_categorias_servicio_activo 
    ON public.categorias_servicio(activo) 
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_servicios_categoria_id 
    ON public.servicios(categoria_id);

CREATE INDEX IF NOT EXISTS idx_servicios_activo 
    ON public.servicios(activo) 
    WHERE activo = true;

-- Profesionales
-- =============
CREATE INDEX IF NOT EXISTS idx_profesionales_activo 
    ON public.profesionales(activo) 
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_profesionales_email 
    ON public.profesionales(email);

CREATE INDEX IF NOT EXISTS idx_profesional_categorias_activo 
    ON public.profesional_categorias(activo) 
    WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_horarios_profesional_id 
    ON public.horarios_profesionales(profesional_id);

-- Citas
-- =====
CREATE INDEX IF NOT EXISTS idx_citas_cliente_id 
    ON public.citas(cliente_id);

CREATE INDEX IF NOT EXISTS idx_citas_profesional_id 
    ON public.citas(profesional_id);

CREATE INDEX IF NOT EXISTS idx_citas_fecha 
    ON public.citas(fecha);

CREATE INDEX IF NOT EXISTS idx_citas_status 
    ON public.citas(status)
    WHERE status = 'Programada';

-- =============================================