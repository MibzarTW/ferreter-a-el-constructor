-- ============================================================
-- Ferretería El Constructor — Schema v1.0
-- ============================================================
-- Ejecutar en Supabase Dashboard > SQL Editor
-- Orden: 001_schema → 002_rls → 003_storage → 004_seed
-- ============================================================

-- Extensión para búsqueda fuzzy (ILIKE, similarity)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- TABLA: categorias
-- 42 categorías del catálogo. El campo 'grupo' mapea cada
-- categoría a su página web (herramientas, materiales, etc.).
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id          TEXT PRIMARY KEY,            -- 'CAT-02', 'CAT-03', ..., 'CAT-58'
  nombre      TEXT NOT NULL,               -- 'Herramientas manuales', 'Medición', etc.
  slug        TEXT UNIQUE NOT NULL,        -- 'herramientas-manuales', 'medicion', etc.
  grupo       TEXT NOT NULL,               -- 'herramientas', 'materiales', 'pinturas',
                                           -- 'electricidad', 'fontaneria', 'ceramicas', 'hogar'
  icono       TEXT,                        -- Clase Font Awesome o URL de icono
  orden       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_grupo ON categorias(grupo);

-- ============================================================
-- TABLA: subcategorias
-- Subcategorías dentro de una categoría.
-- Ejemplo: CAT-23 (Cerámicas) tiene 7 tipologías.
-- ============================================================
CREATE TABLE IF NOT EXISTS subcategorias (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id  TEXT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  slug          TEXT NOT NULL,
  orden         INTEGER DEFAULT 0,
  UNIQUE(categoria_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_subcategorias_categoria ON subcategorias(categoria_id);

-- ============================================================
-- TABLA: marcas
-- 22 marcas del catálogo (S-00 a S-74, con huecos).
-- S-00 = marca genérica/no identificada.
-- ============================================================
CREATE TABLE IF NOT EXISTS marcas (
  id          TEXT PRIMARY KEY,            -- 'S-00', 'S-01', ..., 'S-74'
  nombre      TEXT NOT NULL,               -- Nombre legible de la marca
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: productos
-- PK es 'codigo' (TEXT) para compatibilidad directa con
-- insertar_productos.sql (6207 registros).
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  codigo            TEXT PRIMARY KEY,      -- Código del producto (ej: '100787')
  nombre            TEXT NOT NULL,
  descripcion       TEXT,
  categoria_id      TEXT REFERENCES categorias(id),
  subcategoria_id   UUID REFERENCES subcategorias(id) ON DELETE SET NULL,
  marca_id          TEXT REFERENCES marcas(id),
  existencia        NUMERIC DEFAULT 0,
  especificaciones  JSONB DEFAULT '{}'::jsonb,
  imagenes          TEXT[] DEFAULT '{}',
  etiquetas         TEXT[] DEFAULT '{}',
  nuevo             BOOLEAN DEFAULT false,
  destacado         BOOLEAN DEFAULT false,
  activo            BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes del frontend
CREATE INDEX IF NOT EXISTS idx_productos_categoria    ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_marca        ON productos(marca_id);
CREATE INDEX IF NOT EXISTS idx_productos_subcategoria ON productos(subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo       ON productos(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_productos_nuevo        ON productos(nuevo)  WHERE nuevo = true;
CREATE INDEX IF NOT EXISTS idx_productos_destacado    ON productos(destacado) WHERE destacado = true;
CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm  ON productos USING gin (nombre gin_trgm_ops);

-- ============================================================
-- TRIGGER: actualizar updated_at automáticamente en UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
