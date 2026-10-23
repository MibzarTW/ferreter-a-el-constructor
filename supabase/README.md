# Instrucciones de Base de Datos y Supabase

Este directorio contiene las migraciones y scripts SQL necesarios para inicializar la base de datos de **Ferretería El Constructor**.

## Orden de Ejecución en Supabase Studio

Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard), ve a la pestaña **SQL Editor** y ejecuta los scripts en este orden:

### 1. `001_schema.sql`
- Habilita la extensión `pg_trgm` para búsquedas eficientes.
- Crea las tablas `categorias`, `subcategorias`, `marcas` y `productos`.
- Crea los índices de rendimiento (categoría, marca, activo, destacado, búsqueda trilateral).
- Crea la función y trigger para auto-actualizar `updated_at`.

### 2. `002_rls.sql`
- Habilita Row Level Security (RLS) en todas las tablas.
- Define políticas permisivas de lectura pública (`SELECT`) para usuarios anónimos y autenticados.
- Restringe `INSERT`, `UPDATE` y `DELETE` únicamente a usuarios autenticados (`authenticated`).

### 3. `003_storage.sql`
- Crea el bucket público `productos` en Supabase Storage.
- Configura las políticas de seguridad del storage (lectura pública, escritura/edición/eliminación restringida a administradores autenticados).

### 4. `004_seed.sql`
- Inserta las **42 categorías** del catálogo agrupadas por sección (`herramientas`, `materiales`, `pinturas`, `electricidad`, `fontaneria`, `ceramicas`, `hogar`).
- Inserta las **22 marcas** del catálogo (`S-00` a `S-74`).
- Inserta las **7 tipologías de cerámicas** como subcategorías de `CAT-23`.
- Inserta **10 productos de prueba completos** con especificaciones, imágenes y badges para verificar el catálogo de inmediato.

---

## Carga Masiva de Productos Reales (Opcional)

Si vas a ejecutar el script `insertar_productos.sql` (6,207 productos):
1. Asegúrate de haber ejecutado previamente `001_schema.sql`, `002_rls.sql` y `004_seed.sql` (para que existan las llaves foráneas de categorías y marcas).
2. Pega y ejecuta el contenido de `insertar_productos.sql` en el SQL Editor.
