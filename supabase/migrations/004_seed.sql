-- ============================================================
-- Ferretería El Constructor — Seed Data
-- ============================================================
-- Contenido:
-- 1. 42 Categorías agrupadas (para compatibilidad total con insertar_productos.sql)
-- 2. 22 Marcas del catálogo
-- 3. 7 Subcategorías (Tipologías de Cerámicas para CAT-23)
-- 4. 10 Productos de prueba variados (con imágenes, especificaciones, etc.)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATEGORÍAS (42 registros)
-- ------------------------------------------------------------
INSERT INTO categorias (id, nombre, slug, grupo, orden) VALUES
-- GRUPO: Herramientas (19 categorías)
('CAT-02', 'Medición', 'medicion', 'herramientas', 1),
('CAT-03', 'Herramientas Manuales', 'herramientas-manuales', 'herramientas', 2),
('CAT-05', 'Dados y Cubos', 'dados-cubos', 'herramientas', 3),
('CAT-06', 'Brocas y Discos', 'brocas-discos', 'herramientas', 4),
('CAT-07', 'Corte', 'corte', 'herramientas', 5),
('CAT-09', 'Eléctricas y Neumáticas', 'electricas-neumaticas', 'herramientas', 6),
('CAT-10', 'Compresores', 'compresores', 'herramientas', 7),
('CAT-12', 'Ferretería General', 'ferreteria-general', 'herramientas', 8),
('CAT-13', 'Herrajes', 'herrajes', 'herramientas', 9),
('CAT-14', 'Chapas y Haladeras', 'chapas-haladeras', 'herramientas', 10),
('CAT-16', 'Abrazaderas', 'abrazaderas', 'herramientas', 11),
('CAT-17', 'Tornillería', 'tornilleria', 'herramientas', 12),
('CAT-30', 'Automotriz', 'automotriz', 'herramientas', 13),
('CAT-40', 'Seguridad Industrial', 'seguridad-industrial', 'herramientas', 14),
('CAT-48', 'Cintas Métricas', 'cintas-metricas', 'herramientas', 15),
('CAT-49', 'Clavos y Grapas', 'clavos-grapas', 'herramientas', 16),
('CAT-53', 'Cuchillería', 'cuchilleria', 'herramientas', 17),
('CAT-54', 'Soldadura', 'soldadura', 'herramientas', 18),
('CAT-58', 'Lijas', 'lijas', 'herramientas', 19),

-- GRUPO: Materiales (8 categorías)
('CAT-24', 'Pegamentos y Siliconas', 'pegamentos-siliconas', 'materiales', 20),
('CAT-34', 'Materiales Básicos', 'materiales-basicos', 'materiales', 21),
('CAT-35', 'Perfiles Metálicos', 'perfiles-metalicos', 'materiales', 22),
('CAT-36', 'Tablaroca', 'tablaroca', 'materiales', 23),
('CAT-42', 'Molduras', 'molduras', 'materiales', 24),
('CAT-51', 'Madera', 'madera', 'materiales', 25),
('CAT-55', 'Escaleras', 'escaleras', 'materiales', 26),
('CAT-57', 'Hierro y Varillas', 'hierro-varillas', 'materiales', 27),

-- GRUPO: Pinturas (3 categorías)
('CAT-26', 'Pinturas y Barnices', 'pinturas-barnices', 'pinturas', 28),
('CAT-27', 'Aceites y Lubricantes', 'aceites-lubricantes', 'pinturas', 29),
('CAT-56', 'Accesorios para Pintar', 'accesorios-para-pintar', 'pinturas', 30),

-- GRUPO: Electricidad (4 categorías)
('CAT-32', 'Cables y Cintas', 'cables-cintas', 'electricidad', 31),
('CAT-44', 'Iluminación y Focos', 'iluminacion-focos', 'electricidad', 32),
('CAT-45', 'Cajas, Switches y Tomas', 'cajas-switches-tomas', 'electricidad', 33),
('CAT-46', 'Pilas', 'pilas', 'electricidad', 34),

-- GRUPO: Fontanería (4 categorías)
('CAT-19', 'Tuberías y Conexiones', 'tuberias-conexiones', 'fontaneria', 35),
('CAT-20', 'Accesorios para Baño', 'accesorios-bano', 'fontaneria', 36),
('CAT-21', 'Grifería', 'griferia', 'fontaneria', 37),
('CAT-43', 'Bombas de Agua', 'bombas-agua', 'fontaneria', 38),

-- GRUPO: Cerámicas (1 categoría)
('CAT-23', 'Cerámicas y Pisos', 'ceramicas-pisos', 'ceramicas', 39),

-- GRUPO: Hogar (3 categorías)
('CAT-38', 'Jardinería y Decoración', 'jardineria-decoracion', 'hogar', 40),
('CAT-41', 'Hogar y Limpieza', 'hogar-limpieza', 'hogar', 41),
('CAT-50', 'Línea Blanca', 'linea-blanca', 'hogar', 42)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  slug = EXCLUDED.slug,
  grupo = EXCLUDED.grupo,
  orden = EXCLUDED.orden;

-- ------------------------------------------------------------
-- 2. MARCAS (22 registros)
-- ------------------------------------------------------------
INSERT INTO marcas (id, nombre) VALUES
('S-00', 'Genérica / Sin Marca'),
('S-01', 'Marca S-01'),
('S-02', 'Marca S-02'),
('S-04', 'Marca S-04'),
('S-06', 'Marca S-06'),
('S-07', 'Marca S-07'),
('S-08', 'Marca S-08'),
('S-09', 'Marca S-09'),
('S-10', 'Marca S-10'),
('S-11', 'Marca S-11'),
('S-14', 'Marca S-14'),
('S-17', 'Truper'),
('S-21', 'Marca S-21'),
('S-23', 'Marca S-23'),
('S-26', 'Marca S-26'),
('S-27', 'Marca S-27'),
('S-37', 'Marca S-37'),
('S-38', 'Marca S-38'),
('S-39', 'Marca S-39'),
('S-45', 'Marca S-45'),
('S-59', 'Marca S-59'),
('S-60', 'Marca S-60'),
('S-74', 'Marca S-74')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre;

-- ------------------------------------------------------------
-- 3. SUBCATEGORÍAS (Tipologías de Cerámicas para CAT-23)
-- UUIDs fijos para relacionar fácilmente en semillas y queries
-- ------------------------------------------------------------
INSERT INTO subcategorias (id, categoria_id, nombre, slug, orden) VALUES
('b0000000-0000-0000-0000-000000000001', 'CAT-23', 'Mármoles', 'marmoles', 1),
('b0000000-0000-0000-0000-000000000002', 'CAT-23', 'Duelas', 'duelas', 2),
('b0000000-0000-0000-0000-000000000003', 'CAT-23', 'Geométricos', 'geometricos', 3),
('b0000000-0000-0000-0000-000000000004', 'CAT-23', 'Porcelanato', 'porcelanato', 4),
('b0000000-0000-0000-0000-000000000005', 'CAT-23', 'Fachaletas', 'fachaletas', 5),
('b0000000-0000-0000-0000-000000000006', 'CAT-23', 'Azulejos', 'azulejos', 6),
('b0000000-0000-0000-0000-000000000007', 'CAT-23', 'Antideslizantes', 'antideslizantes', 7)
ON CONFLICT (categoria_id, slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  orden = EXCLUDED.orden;

-- ------------------------------------------------------------
-- 4. PRODUCTOS DE PRUEBA (10 productos variados)
-- Al menos 1 por cada grupo principal, 2 cerámicas con subcategoría,
-- 2 con nuevo=true, 3 con destacado=true.
-- ------------------------------------------------------------
INSERT INTO productos (
  codigo, nombre, descripcion, categoria_id, subcategoria_id, marca_id,
  existencia, especificaciones, imagenes, etiquetas, nuevo, destacado, activo
) VALUES
-- 1. Herramientas (CAT-03) - Destacado
(
  'DEMO-001',
  'JUEGO DE DESTORNILLADORES INDUSTRIALES 6 PIEZAS TRUPER',
  'Juego de 6 destornilladores de alta precisión con mango ergonómico bimaterial. Puntas magnetizadas de acero al cromo vanadio para mayor durabilidad.',
  'CAT-03',
  NULL,
  'S-17',
  45,
  '{"material": "Acero Cr-V", "piezas": 6, "tipo_mango": "Ergonómico bimaterial", "aislado": false}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=600&auto=format&fit=crop&q=80'],
  ARRAY['herramientas', 'destornilladores', 'taller'],
  false,
  true,
  true
),

-- 2. Herramientas eléctricas (CAT-09) - Nuevo & Destacado
(
  'DEMO-002',
  'TALADRO PERCUTOR INALÁMBRICO 20V TRUPER MAX',
  'Taladro percutor de 20V con 2 baterías de litio y cargador rápido. Mandril metálico de 1/2 pulgada, control de torque de 21 posiciones.',
  'CAT-09',
  NULL,
  'S-17',
  18,
  '{"voltaje": "20V", "mandril": "1/2 pulg", "velocidad": "0-450 / 0-1650 RPM", "baterias": "2x 2.0Ah"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80'],
  ARRAY['inalambrico', 'taladro', 'truper'],
  true,
  true,
  true
),

-- 3. Materiales (CAT-34)
(
  'DEMO-003',
  'CEMENTO GRIS ESTRUCTURAL 42.5 KG',
  'Cemento Portland de uso general de alto desempeño estructural. Ideal para zapatas, losas, columnas y repellos.',
  'CAT-34',
  NULL,
  'S-00',
  120,
  '{"peso": "42.5 kg", "tipo": "Portland Tipo I", "rendimiento": "Estándar construcción"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=80'],
  ARRAY['cemento', 'construccion', 'obra'],
  false,
  false,
  true
),

-- 4. Pinturas (CAT-26) - Destacado
(
  'DEMO-004',
  'PINTURA LÁTEX ACRÍLICA PREMIUM BLANCO PURO 1 GALÓN',
  'Pintura base agua antihongos y antibacterial con acabado satinado. Alto poder cubriente y lavabilidad superior para interiores y exteriores.',
  'CAT-26',
  NULL,
  'S-04',
  60,
  '{"volumen": "1 Galón", "acabado": "Satinado", "rendimiento": "35-40 m2/gal", "base": "Acrílica"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'],
  ARRAY['pintura', 'latex', 'acabados'],
  false,
  true,
  true
),

-- 5. Electricidad (CAT-32)
(
  'DEMO-005',
  'ROLLO DE CABLE THHN #12 AWG COBRE ROJO 100M',
  'Cable eléctrico de cobre electrolítico de 99.9% de pureza con aislamiento termoplástico THHN/THWN resistente a la humedad y calor hasta 90°C.',
  'CAT-32',
  NULL,
  'S-08',
  35,
  '{"calibre": "#12 AWG", "longitud": "100 metros", "voltaje": "600V", "color": "Rojo"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
  ARRAY['cables', 'instalacion', 'electricidad'],
  false,
  false,
  true
),

-- 6. Fontanería (CAT-19)
(
  'DEMO-006',
  'TUBO PVC PRESIÓN 1/2 PULGADA RDE 13.5 (6 METROS)',
  'Tubo de policloruro de vinilo para conducción de agua potable a presión. Extremo liso para unión con cemento solvente.',
  'CAT-19',
  NULL,
  'S-00',
  85,
  '{"diametro": "1/2 pulg", "longitud": "6 metros", "tipo": "RDE 13.5", "presion": "315 PSI"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80'],
  ARRAY['pvc', 'fontaneria', 'agua'],
  false,
  false,
  true
),

-- 7. Cerámicas (CAT-23) - Tipología: Porcelanato
(
  'DEMO-007',
  'PORCELANATO ESMALTADO CARRARA PULIDO 60X120 CM',
  'Porcelanato rectificado con diseño de mármol Carrara acabado pulido ultra brillante. Ideal para pisos y muros en zonas residenciales y comerciales.',
  'CAT-23',
  'b0000000-0000-0000-0000-000000000004',
  'S-02',
  150,
  '{"medida": "60x120 cm", "tamaño": "60x120 cm", "acabado": "Pulido brillante", "superficie": "Esmaltada", "m2_por_caja": "1.44", "piezas_x_caja": "2", "tipologia": "porcelanato"}'::jsonb,
  ARRAY[
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&auto=format&fit=crop&q=80'
  ],
  ARRAY['ceramica', 'piso', 'porcelanato', 'carrara'],
  false,
  false,
  true
),

-- 8. Cerámicas (CAT-23) - Tipología: Duelas (Madera) - Nuevo
(
  'DEMO-008',
  'PISO CERÁMICO DUELA NOGAL NATURAL 20X100 CM',
  'Cerámica imitación madera formato duela con relieve texturizado antideslizante suave. Textura realista para salas, terrazas y dormitorios.',
  'CAT-23',
  'b0000000-0000-0000-0000-000000000002',
  'S-02',
  210,
  '{"medida": "20x100 cm", "tamaño": "20x100 cm", "acabado": "Mate texturizado", "superficie": "Relieve madera", "m2_por_caja": "1.60", "piezas_x_caja": "8", "tipologia": "duelas"}'::jsonb,
  ARRAY[
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=600&auto=format&fit=crop&q=80'
  ],
  ARRAY['ceramica', 'piso', 'madera', 'duela'],
  true,
  false,
  true
),

-- 9. Hogar / Jardinería (CAT-38)
(
  'DEMO-009',
  'MANGUERA REFORZADA PARA JARDÍN 5/8 PULGADA 25 METROS',
  'Manguera de 3 capas con refuerzo de hilo de poliéster de alta resistencia a la presión y a los rayos UV. Conexiones metálicas de latón.',
  'CAT-38',
  NULL,
  'S-17',
  40,
  '{"diametro": "5/8 pulg", "longitud": "25 metros", "capas": 3, "presion_rotura": "250 PSI"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=600&auto=format&fit=crop&q=80'],
  ARRAY['jardin', 'manguera', 'riego'],
  false,
  false,
  true
),

-- 10. Seguridad Industrial (CAT-40)
(
  'DEMO-010',
  'CASCO DE PROTECCIÓN CLASE E CON AJUSTE MATRACA',
  'Casco de polietileno de alta densidad dieléctrico hasta 20,000V. Suspensión de 4 puntos y arnés con perilla de ajuste rápido.',
  'CAT-40',
  NULL,
  'S-17',
  75,
  '{"clase": "Clase E (Eléctrico)", "color": "Amarillo", "norma": "ANSI Z89.1", "ajuste": "Matraca / Ranura"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=600&auto=format&fit=crop&q=80'],
  ARRAY['seguridad', 'casco', 'epp'],
  false,
  false,
  true
)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  categoria_id = EXCLUDED.categoria_id,
  subcategoria_id = EXCLUDED.subcategoria_id,
  marca_id = EXCLUDED.marca_id,
  existencia = EXCLUDED.existencia,
  especificaciones = EXCLUDED.especificaciones,
  imagenes = EXCLUDED.imagenes,
  etiquetas = EXCLUDED.etiquetas,
  nuevo = EXCLUDED.nuevo,
  destacado = EXCLUDED.destacado,
  activo = EXCLUDED.activo;
