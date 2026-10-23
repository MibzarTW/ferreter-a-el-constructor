# Manual del Panel de Administración — Ferretería El Constructor

El panel de administración se encuentra en `/admin` y permite la gestión integral del catálogo en Supabase sin necesidad de modificar código.

---

## 1. Creación de los Usuarios Administradores en Supabase

Dado que el catálogo cuenta con políticas RLS que restringen la inserción, modificación y eliminación exclusivamente a usuarios autenticados, debes crear los usuarios administradores (máximo 3) en tu consola de Supabase:

1. Ingresa a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. En el menú lateral izquierdo, ve a **Authentication** > **Users**.
3. Haz clic en el botón verde **"Add user"** > **"Create user"**.
4. Ingresa el **Email** y una **Contraseña segura**:
   - Ejemplo: `admin@elconstructor.com`
5. Marca la casilla **"Auto Confirm User"** (para que pueda iniciar sesión de inmediato sin requerir confirmación por correo).
6. Haz clic en **"Create user"**.
7. Repite los pasos para hasta 3 usuarios administradores.

---

## 2. Acceso al Panel

- **URL de acceso:** `/admin/login.html` (o `admin.tudominio.com` tras configurar el dominio).
- Introduce el correo y la contraseña creados en el paso anterior.
- Si intentas ingresar a cualquier página de `/admin/` sin iniciar sesión, el sistema te redirigirá automáticamente a la pantalla de acceso.

---

## 3. Módulos Disponibles

### 📊 Dashboard (`/admin/index.html`)
- Muestra métricas clave en tiempo real:
  - Total de productos registrados.
  - Cantidad de productos activos visibles para clientes.
  - Alerta de productos con stock bajo o agotados (existencia <= 5).
  - Total de categorías y marcas.
- Tabla con los últimos productos actualizados y accesos rápidos de edición.

### 📦 Productos (`/admin/productos.html`)
- **Filtros avanzados:** Búsqueda en tiempo real por código o nombre, filtro por categoría, marca y estado (activo, inactivo, destacado, nuevo).
- **Creación / Edición:**
  - Código único (`codigo`), Nombre, Categoría, Subcategoría, Marca, Existencia, Descripción.
  - Switches de estado: `Activo` (visible en tienda), `Destacado` (aparece en inicio), `Nuevo` (insignia NUEVO).
  - **Subida de imágenes:** Puedes subir fotos directamente a Supabase Storage (bucket `productos`) o pegar URLs externas.
  - **Ficha técnica:** Editor de especificaciones en formato JSON.
- **Eliminación:** Permite borrar productos con diálogo de confirmación.

### 🏷️ Categorías (`/admin/categorias.html`)
- Permite gestionar las 42 categorías internas (`CAT-02` a `CAT-58`).
- Asignación al grupo web de la tienda (`herramientas`, `materiales`, `pinturas`, `electricidad`, `fontaneria`, `ceramicas`, `hogar`).

### 📑 Subcategorías (`/admin/subcategorias.html`)
- Gestión de segmentaciones finas (por ejemplo las 7 tipologías de cerámicas: Mármoles, Duelas, Porcelanato, etc.).

### 🎖️ Marcas (`/admin/marcas.html`)
- Permite renombrar los códigos de marca del catálogo original (`S-00`, `S-17`, etc.) a sus nombres comerciales reales (`Truper`, etc.) y asignarles su URL de logotipo.
