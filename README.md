# Ferretería El Constructor — Catálogo y Panel Administrativo

Sitio web oficial, catálogo en tiempo real y panel de control administrativo para **Ferretería El Constructor**, desarrollado en HTML/CSS/JavaScript vanilla con backend y base de datos en **Supabase** y despliegue en **Vercel**.

---

## 📑 Tabla de Contenidos
1. [Características Principales](#características-principales)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Cómo Ejecutar Localmente](#cómo-ejecutar-localmente)
4. [Base de Datos y Seguridad (Supabase)](#base-de-datos-y-seguridad-supabase)
5. [Panel de Administración (/admin)](#panel-de-administración-admin)
6. [Cómo Agregar Nuevas Categorías](#cómo-agregar-nuevas-categorías)
7. [Subida y Migración de Imágenes](#subida-y-migración-de-imágenes)
8. [Despliegue en Vercel](#despliegue-en-vercel)

---

## 1. Características Principales

- **Catálogo Dinámico 100% en Supabase:** Eliminación total de JSONs estáticos. Consultas eficientes directas desde el cliente.
- **Cotizador a WhatsApp:** El carrito de compras no requiere login ni pago en línea; guarda los productos cotizados en `localStorage` y genera el pedido formateado por WhatsApp.
- **Data Layer Unificado:**
  - `assets/js/utils.js`: Adaptador único `adaptarProducto()` y generador estándar de tarjetas de producto con fallback de imágenes en SVG.
  - `assets/js/config.js` y `supabase.js`: Inicialización segura del cliente Supabase.
- **Páginas de Catálogo Especializadas:**
  - `herramientas.html`, `pinturas.html`, `hogar.html`: Navegación con sidebar de filtros por categoría y paginación "Cargar más".
  - `materiales.html`, `electricidad.html`, `fontaneria.html`: Catálogo directo por cuadrícula.
  - `ceramicas.html`: Sección especializada con barra de tipologías (Mármoles, Duelas, Porcelanato, etc.) y tarjetas interactivas con doble imagen (principal y ambiente aplicado).
  - `producto.html`: Ficha de detalle con galería de miniaturas, zoom interactivo, ficha técnica y productos relacionados.
  - `busqueda.html`: Buscador en tiempo real por nombre, marca o código.
- **Panel Administrativo Completo (`/admin`):**
  - Autenticación segura mediante Supabase Auth (email/password).
  - Dashboard con métricas de stock e inventario en tiempo real.
  - CRUD de productos con editor de especificaciones JSON y subida directa a Supabase Storage.
  - CRUD de categorías, subcategorías y marcas.
  - Diseño neutro profesional (grises/slate/azul pizarra) independiente de la estética de la tienda.

---

## 2. Estructura del Proyecto

```text
├── index.html                      # Página de inicio
├── vercel.json                     # Configuración de despliegue y subdominio admin
├── .gitignore                      # Exclusiones de Git
├── admin/                          # Panel de Administración
│   ├── index.html                  # Dashboard de métricas
│   ├── login.html                  # Pantalla de acceso
│   ├── productos.html              # CRUD de productos
│   ├── categorias.html             # CRUD de categorías
│   ├── subcategorias.html          # CRUD de subcategorías y tipologías
│   ├── marcas.html                 # CRUD de marcas
│   ├── css/admin.css               # Estilos del panel de control
│   ├── js/auth-guard.js            # Guard de autenticación y sesión
│   └── js/*.js                     # Lógica de cada módulo administrativo
├── assets/
│   ├── components/                 # Parciales (header.html, footer.html)
│   ├── css/style.css               # Estilos principales de la tienda
│   ├── js/config.js                # Configuración pública de Supabase
│   ├── js/supabase.js              # Inicializador del cliente
│   ├── js/utils.js                 # Utilidades, placeholder y adaptador
│   ├── js/main.js                  # Lógica de carrito, tema y navegación
│   └── js/*.js                     # Controladores por página pública
├── pages/                          # Páginas de categorías y vistas públicas
│   ├── herramientas.html
│   ├── materiales.html
│   ├── pinturas.html
│   ├── electricidad.html
│   ├── fontaneria.html
│   ├── ceramicas.html
│   ├── hogar.html                  # Nueva categoría (Jardinería/Limpieza/Línea Blanca)
│   ├── producto.html               # Ficha de detalle
│   ├── busqueda.html               # Resultados de búsqueda
│   ├── contacto.html
│   └── servicios.html
├── scripts/                        # Scripts de soporte
│   ├── migrar-imagenes.js          # Migrador de imágenes a Supabase Storage
│   └── README.md
├── supabase/                       # Scripts y migraciones SQL
│   ├── migrations/
│   │   ├── 001_schema.sql          # Tablas, índices y triggers
│   │   ├── 002_rls.sql             # Políticas de seguridad RLS
│   │   ├── 003_storage.sql         # Configuración del bucket 'productos'
│   │   └── 004_seed.sql            # Semilla con 42 categorías, 22 marcas y demos
│   └── README.md
└── docs/
    └── DEPLOY_VERCEL.md            # Guía detallada de despliegue en Vercel
```

---

## 3. Cómo Ejecutar Localmente

Dado que el sitio utiliza rutas absolutas desde la raíz (`/assets/...`, `/pages/...`, `/admin/...`), **debe servirse a través de un servidor HTTP local**, no abriendo directamente los archivos con doble clic (`file:///`).

### Opciones para levantar servidor local:

**Con Node.js (npx):**
```bash
npx serve .
# o
npx http-server . -p 3000
```

**Con Python:**
```bash
python -m http.server 3000
```

**Con VS Code:**
- Instala la extensión **Live Server** y haz clic en "Go Live" en la barra inferior.

Abre tu navegador en `http://localhost:3000`.

---

## 4. Base de Datos y Seguridad (Supabase)

### Esquema Relacional:
1. **`categorias`**: Clave primaria `id` (formato `CAT-XX`), `nombre`, `slug`, `grupo` (indica en qué sección de la web aparece: `herramientas`, `materiales`, `pinturas`, `electricidad`, `fontaneria`, `ceramicas`, `hogar`), `icono`, `orden`.
2. **`subcategorias`**: Clave primaria UUID, vinculada a `categoria_id` (ej. las 7 tipologías de cerámicas).
3. **`marcas`**: Clave primaria `id` (formato `S-XX`), `nombre`, `logo_url`.
4. **`productos`**: Clave primaria `codigo` (para compatibilidad total con `insertar_productos.sql`), `nombre`, `descripcion`, `categoria_id`, `subcategoria_id`, `marca_id`, `existencia`, `especificaciones` (JSONB), `imagenes` (TEXT[]), `etiquetas`, `nuevo`, `destacado`, `activo`.

### Políticas RLS (Row Level Security):
- **Lectura (`SELECT`):** Pública para cualquier visitante anónimo o usuario registrado.
- **Modificación (`INSERT`, `UPDATE`, `DELETE`):** Exclusiva para usuarios autenticados con rol administrativo.
- **Storage:** Lectura pública del bucket `productos`; subida y eliminación exclusiva para usuarios autenticados.

---

## 5. Panel de Administración (/admin)

### Creación de Administradores:
1. Entra a tu consola de [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a **Authentication** > **Users** > **Add user** > **Create user**.
3. Ingresa correo y contraseña y marca la casilla **"Auto Confirm User"**.
4. Inicia sesión en `/admin/login.html`.

### Uso del Panel:
- **Crear un Producto:** Ve a `/admin/productos.html` > Botón **"Nuevo Producto"**. Llena los campos requeridos (`codigo` y `nombre`).
- **Subir Imágenes:** En el modal de producto, arrastra o selecciona imágenes en el recuadro punteado. Se subirán automáticamente a Supabase Storage y se agregarán a la galería. También puedes añadir URLs de imágenes externas.
- **Renombrar Marcas:** Ve a `/admin/marcas.html` para asignar el nombre comercial a cada código (ej: editar `S-17` y nombrarlo `Truper`).

---

## 6. Cómo Agregar Nuevas Categorías

1. Ingresa a `/admin/categorias.html` y pulsa **"Nueva Categoría"**.
2. Asigna un ID único (ej: `CAT-59`), el nombre y selecciona el **Grupo Web Destino**:
   - Si seleccionas `herramientas`, aparecerá automáticamente en el sidebar de herramientas.
   - Si seleccionas `pinturas`, aparecerá en pinturas, etc.
3. Guarda los cambios. Los nuevos productos asignados a esa categoría se reflejarán inmediatamente en la tienda pública sin tocar código.

---

## 7. Subida y Migración de Imágenes

Para subir las fotos locales existentes a Supabase Storage:
```bash
node scripts/migrar-imagenes.js
```
El script generará el archivo `scripts/mapeo_imagenes.json` con las URLs en la nube listas para consultar.

---

## 8. Despliegue en Vercel

Consulta la guía completa en [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) para:
- Conectar tu repositorio a Vercel.
- Configurar el dominio principal (`tudominio.com`).
- Configurar el subdominio del panel administrativo (`admin.tudominio.com`).
"# test" 
