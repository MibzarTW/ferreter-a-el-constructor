-- ============================================================
-- Ferretería El Constructor — Storage (bucket de imágenes)
-- ============================================================
-- Bucket 'productos': lectura pública, escritura authenticated
-- ============================================================

-- Crear bucket público para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública (cualquier visitante puede ver las imágenes)
CREATE POLICY "Lectura pública bucket productos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'productos');

-- Subir imágenes (solo usuarios autenticados / admin)
CREATE POLICY "Subir imágenes (auth)"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'productos');

-- Actualizar imágenes (solo usuarios autenticados / admin)
CREATE POLICY "Actualizar imágenes (auth)"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'productos');

-- Eliminar imágenes (solo usuarios autenticados / admin)
CREATE POLICY "Eliminar imágenes (auth)"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'productos');
