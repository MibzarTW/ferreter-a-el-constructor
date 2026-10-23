-- ============================================================
-- Ferretería El Constructor — Row Level Security (RLS)
-- ============================================================
-- Política:
--   SELECT  → público (anon + authenticated)
--   INSERT  → solo authenticated
--   UPDATE  → solo authenticated
--   DELETE  → solo authenticated
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categorias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CATEGORIAS
-- ============================================================
CREATE POLICY "Lectura pública de categorías"
  ON categorias FOR SELECT
  USING (true);

CREATE POLICY "Insertar categorías (auth)"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Actualizar categorías (auth)"
  ON categorias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Eliminar categorías (auth)"
  ON categorias FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- SUBCATEGORIAS
-- ============================================================
CREATE POLICY "Lectura pública de subcategorías"
  ON subcategorias FOR SELECT
  USING (true);

CREATE POLICY "Insertar subcategorías (auth)"
  ON subcategorias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Actualizar subcategorías (auth)"
  ON subcategorias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Eliminar subcategorías (auth)"
  ON subcategorias FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- MARCAS
-- ============================================================
CREATE POLICY "Lectura pública de marcas"
  ON marcas FOR SELECT
  USING (true);

CREATE POLICY "Insertar marcas (auth)"
  ON marcas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Actualizar marcas (auth)"
  ON marcas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Eliminar marcas (auth)"
  ON marcas FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE POLICY "Lectura pública de productos"
  ON productos FOR SELECT
  USING (true);

CREATE POLICY "Insertar productos (auth)"
  ON productos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Actualizar productos (auth)"
  ON productos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Eliminar productos (auth)"
  ON productos FOR DELETE
  TO authenticated
  USING (true);
