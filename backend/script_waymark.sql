-- ============================================================
-- WAYMARK — Script de Base de Datos v1.2.0
-- Cambios vs v1.0.0:
--   · Tabla usuario: agregadas columnas is_active, is_staff,
--     is_superuser, created_by (requeridas por Django AbstractBaseUser
--     + PermissionsMixin). last_login NO se incluye (deshabilitado
--     en el modelo con last_login = None).
--   · Nombres de tablas en minúsculas para compatibilidad Linux.
--   · Tablas del sistema Django agregadas (auth, admin, sessions).
--   · Datos iniciales (INSERT) para todas las tablas catálogo.
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_waymark
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE db_waymark;

-- =========================
-- TABLAS CATÁLOGO
-- =========================

CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre TINYTEXT NOT NULL
);

CREATE TABLE tipo_propiedad (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    tipo TINYTEXT NOT NULL
);

CREATE TABLE divisa (
    divisa_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    acronimo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT
);

CREATE TABLE amenidad (
    amenidad_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    icono_nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reserva_estado (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    estado TINYTEXT NOT NULL
);

CREATE TABLE doc_tipo (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre TINYTEXT NOT NULL
);

CREATE TABLE doc_estado (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    estado TINYTEXT NOT NULL
);

-- =========================
-- USUARIO
-- Columnas agregadas vs v1.0.0:
--   · is_active   — requerida por AbstractBaseUser
--   · is_staff    — requerida por AbstractBaseUser (acceso al admin)
--   · is_superuser — requerida por PermissionsMixin
--   · created_by  — campo personalizado en el modelo
-- =========================

CREATE TABLE usuario (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido_p VARCHAR(50) NOT NULL,
    apellido_m VARCHAR(50),
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(50) UNIQUE NOT NULL,
    contra VARCHAR(255) NOT NULL,
    rol INT NOT NULL,
    foto_perfil VARCHAR(255),
    verificado BOOLEAN DEFAULT FALSE,
    ciudad VARCHAR(50) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,

    -- Requeridas por Django auth
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (rol) REFERENCES rol(id)
);

-- =========================
-- PROPIEDAD
-- =========================

CREATE TABLE propiedad (
    propiedad_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    titulo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    pais VARCHAR(25) NOT NULL,
    region VARCHAR(25) NOT NULL,
    ciudad VARCHAR(25) NOT NULL,
    direccion VARCHAR(100) UNIQUE NOT NULL,
    activa BOOLEAN,
    coordenadas JSON NOT NULL,
    precio_noche DECIMAL(10,2) NOT NULL,
    divisa_id INT NOT NULL,
    max_huespedes INT NOT NULL,
    habitaciones INT NOT NULL,
    camas INT NOT NULL,
    banos INT NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME NOT NULL,

    regla_mascotas BOOLEAN NOT NULL,
    regla_ninos BOOLEAN NOT NULL,
    regla_fumar BOOLEAN NOT NULL,
    regla_fiestas BOOLEAN NOT NULL,
    regla_autochecar BOOLEAN NOT NULL,
    regla_apagar BOOLEAN NOT NULL,

    reglas_extra JSON,

    tipo_propiedad INT NOT NULL,
    anfitrion_id INT NOT NULL,

    slug VARCHAR(60) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (divisa_id) REFERENCES divisa(divisa_id),
    FOREIGN KEY (tipo_propiedad) REFERENCES tipo_propiedad(id),
    FOREIGN KEY (anfitrion_id) REFERENCES usuario(usuario_id),

    CHECK (precio_noche > 0),
    CHECK (max_huespedes > 0),
    CHECK (habitaciones >= 0),
    CHECK (camas >= 0),
    CHECK (banos >= 0),
    CHECK (check_in < check_out)
);

-- =========================
-- PROPIEDAD IMAGEN
-- =========================

CREATE TABLE propiedad_imagen (
    prop_ima_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    propiedad_id INT NOT NULL,
    url TEXT NOT NULL,
    orden INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,

    FOREIGN KEY (propiedad_id) REFERENCES propiedad(propiedad_id),

    UNIQUE (propiedad_id, orden)
);

-- =========================
-- AMENIDADES POR PROPIEDAD
-- =========================

CREATE TABLE propiedad_amenidades (
    pro_ame_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    propiedad_id INT NOT NULL,
    amenidad_id INT NOT NULL,

    FOREIGN KEY (propiedad_id) REFERENCES propiedad(propiedad_id),
    FOREIGN KEY (amenidad_id) REFERENCES amenidad(amenidad_id),

    UNIQUE (propiedad_id, amenidad_id)
);

-- =========================
-- RESERVA
-- =========================

CREATE TABLE reserva (
    reserva_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    propiedad_id INT NOT NULL,
    huesped_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    huespedes INT NOT NULL,
    estado INT NOT NULL,
    codigo VARCHAR(12) UNIQUE NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (propiedad_id) REFERENCES propiedad(propiedad_id),
    FOREIGN KEY (huesped_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (estado) REFERENCES reserva_estado(id),

    CHECK (fecha_inicio < fecha_fin),
    CHECK (huespedes > 0)
);

-- =========================
-- CALIFICACION
-- =========================

CREATE TABLE calificacion (
    calificacion_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    autor_id INT NOT NULL,
    puntuacion DECIMAL(3,2) NOT NULL,
    comentario TEXT NOT NULL,
    reserva_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (autor_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (reserva_id) REFERENCES reserva(reserva_id),

    CHECK (puntuacion >= 1 AND puntuacion <= 5)
);

-- =========================
-- FAVORITOS
-- =========================

CREATE TABLE favorito (
    favorito_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    usuario_id INT NOT NULL,
    propiedad_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (propiedad_id) REFERENCES propiedad(propiedad_id),

    UNIQUE (usuario_id, propiedad_id)
);

-- =========================
-- DOCUMENTOS
-- =========================

CREATE TABLE documento (
    documento_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    usuario_id INT NOT NULL,
    tipo INT NOT NULL,
    numero_doc VARCHAR(50) NOT NULL,
    archivo_front VARCHAR(255) NOT NULL,
    archivo_trasero VARCHAR(255) NOT NULL,
    estado INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (tipo) REFERENCES doc_tipo(id),
    FOREIGN KEY (estado) REFERENCES doc_estado(id)
);

-- =========================
-- DATOS INICIALES (catálogos)
-- Sin estos registros el registro/login falla con 400.
-- =========================

-- Roles (el frontend usa id 1=turista, 2=anfitrion, 3=administrador)
INSERT INTO rol (nombre) VALUES
    ('turista'),        -- id = 1
    ('anfitrion'),      -- id = 2
    ('administrador'),  -- id = 3
    ('ambos');          -- id = 4  (turista + anfitrion)

-- Tipos de propiedad
INSERT INTO tipo_propiedad (tipo) VALUES
    ('Casa'),
    ('Departamento'),
    ('Cabaña'),
    ('Hotel'),
    ('Hostal'),
    ('Villa'),
    ('Estudio'),
    ('Loft');

-- Divisas
INSERT INTO divisa (nombre, acronimo) VALUES
    ('Peso mexicano',   'MXN'),
    ('Dólar americano', 'USD'),
    ('Euro',            'EUR');

-- Estados de reserva
INSERT INTO reserva_estado (estado) VALUES
    ('pendiente'),    -- id = 1
    ('confirmada'),   -- id = 2
    ('cancelada'),    -- id = 3
    ('completada');   -- id = 4

-- Tipos de documento
INSERT INTO doc_tipo (nombre) VALUES
    ('INE'),
    ('Pasaporte'),
    ('Licencia de conducir');

-- Estados de documento
INSERT INTO doc_estado (estado) VALUES
    ('pendiente'),   -- id = 1
    ('aprobado'),    -- id = 2
    ('rechazado');   -- id = 3

-- Amenidades base
INSERT INTO amenidad (nombre, icono_nombre, descripcion, categoria) VALUES
    ('WiFi',              'Wifi',           'Conexión a internet inalámbrica',     'Servicios'),
    ('Estacionamiento',   'Car',            'Espacio para vehículo',               'Servicios'),
    ('Aire acondicionado','AirVent',        'Sistema de clima',                    'Clima'),
    ('Calefacción',       'Thermometer',    'Calefacción central o eléctrica',     'Clima'),
    ('Cocina equipada',   'ChefHat',        'Cocina con utensilios completos',     'Cocina'),
    ('Lavadora',          'WashingMachine', 'Lavadora de ropa',                   'Electrodomésticos'),
    ('TV',                'Tv',             'Televisión',                          'Entretenimiento'),
    ('Piscina',           'Waves',          'Alberca privada o compartida',        'Exteriores'),
    ('Gimnasio',          'Dumbbell',       'Área de ejercicio',                   'Exteriores'),
    ('Terraza',           'TreePine',       'Terraza o balcón',                    'Exteriores'),
    ('Caja fuerte',       'Lock',           'Caja fuerte en habitación',           'Seguridad'),
    ('Detector de humo',  'Flame',          'Detector de incendios',               'Seguridad');

-- =========================
-- ÍNDICES
-- =========================

CREATE INDEX idx_anfitriones ON propiedad(anfitrion_id);

-- =========================
-- VISTAS
-- =========================

CREATE VIEW categorias_amenidad AS
    SELECT DISTINCT categoria AS categorias FROM amenidad;

CREATE VIEW ubicaciones AS
    SELECT DISTINCT ciudad, region, pais FROM propiedad;

CREATE VIEW cards AS
    SELECT
        p.propiedad_id,
        p.ciudad,
        p.region,
        p.pais,
        p.precio_noche,
        p.slug,
        d.acronimo AS divisa,
        t.tipo,
        pi.url AS portada,
        AVG(c.puntuacion) AS promedio,
        COUNT(f.propiedad_id) > 10 AS es_favorito,
        COUNT(c.calificacion_id) AS num_resenas
    FROM propiedad p
    LEFT JOIN propiedad_imagen pi
        ON pi.propiedad_id = p.propiedad_id
        AND pi.orden = 1
    LEFT JOIN reserva r
        ON r.propiedad_id = p.propiedad_id
    LEFT JOIN calificacion c
        ON c.reserva_id = r.reserva_id
    LEFT JOIN favorito f
        ON f.propiedad_id = p.propiedad_id
    LEFT JOIN divisa d
        ON d.divisa_id = p.divisa_id
    LEFT JOIN tipo_propiedad t
        ON t.id = p.tipo_propiedad
    WHERE p.activa = TRUE
    GROUP BY
        p.propiedad_id,
        p.ciudad,
        p.region,
        p.pais,
        p.precio_noche,
        p.slug,
        pi.url;

-- =========================
-- SISTEMA DJANGO
-- Tablas requeridas por Django para que admin, permisos
-- y migraciones funcionen correctamente.
-- =========================

-- Registro de migraciones aplicadas
CREATE TABLE django_migrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied DATETIME(6) NOT NULL
);

-- Tipos de contenido (requerido por PermissionsMixin y admin)
CREATE TABLE django_content_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE KEY django_content_type_app_label_model (app_label, model)
);

-- Permisos de Django (requerido por PermissionsMixin)
CREATE TABLE auth_permission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content_type_id INT NOT NULL,
    codename VARCHAR(100) NOT NULL,
    UNIQUE KEY auth_permission_content_type_id_codename (content_type_id, codename),
    FOREIGN KEY (content_type_id) REFERENCES django_content_type(id)
);

-- Grupos de Django
CREATE TABLE auth_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE auth_group_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    permission_id INT NOT NULL,
    UNIQUE KEY auth_group_permissions_group_id_permission_id (group_id, permission_id),
    FOREIGN KEY (group_id) REFERENCES auth_group(id),
    FOREIGN KEY (permission_id) REFERENCES auth_permission(id)
);

-- Relación M2M Usuario ↔ Grupos (generada por PermissionsMixin)
CREATE TABLE cuentas_usuario_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    group_id INT NOT NULL,
    UNIQUE KEY cuentas_usuario_groups_usuario_id_group_id (usuario_id, group_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (group_id) REFERENCES auth_group(id)
);

-- Relación M2M Usuario ↔ Permisos (generada por PermissionsMixin)
CREATE TABLE cuentas_usuario_user_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    permission_id INT NOT NULL,
    UNIQUE KEY cuentas_usuario_user_perms_usuario_id_permission_id (usuario_id, permission_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (permission_id) REFERENCES auth_permission(id)
);

-- Log del admin de Django
CREATE TABLE django_admin_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_time DATETIME(6) NOT NULL,
    object_id LONGTEXT NULL,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT UNSIGNED NOT NULL,
    change_message LONGTEXT NOT NULL,
    content_type_id INT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (content_type_id) REFERENCES django_content_type(id),
    FOREIGN KEY (user_id) REFERENCES usuario(usuario_id)
);

-- Sesiones (requerido si se usan sesiones de Django)
CREATE TABLE django_session (
    session_key VARCHAR(40) PRIMARY KEY,
    session_data LONGTEXT NOT NULL,
    expire_date DATETIME(6) NOT NULL
);

CREATE INDEX django_session_expire_date ON django_session(expire_date);
