# AGENTS.md

Guía de arquitectura técnica y convenciones para agentes de IA y desarrolladores en **Ferretería El Constructor**.

## Stack Tecnológico y Reglas

- **Frontend:** HTML5 semántico, CSS moderno en `assets/css/style.css` (variables CSS, temas `[data-theme="light|dark"]`), Vanilla JavaScript modular.
- **Backend / Database:** Supabase (PostgreSQL con extensiones `pg_trgm`, Row Level Security en todas las tablas, Supabase Auth y Supabase Storage bucket `productos`).
- **Data Layer:** Centralizado en `assets/js/utils.js` (`adaptarProducto()`, `renderProductCard()`, `PLACEHOLDER`), `assets/js/config.js` y `assets/js/supabase.js`.
- **Rutas Absolutas:** Todos los recursos y enlaces usan rutas absolutas desde la raíz (`/assets/...`, `/pages/...`, `/admin/...`). Debe servirse por HTTP, no mediante `file://`.
- **No inventar precios:** El catálogo es exclusivamente para cotización vía WhatsApp. El carrito se gestiona en el cliente mediante `localStorage` con la clave `cotizacion` y abre WhatsApp (`https://wa.me/50361498918`) con el mensaje preformateado.

## Esquema de Datos en Supabase

- `categorias (id TEXT PK, nombre TEXT, slug TEXT UNIQUE, grupo TEXT, icono TEXT, orden INT)`: 42 categorías agrupadas en los 7 grupos web: `herramientas`, `materiales`, `pinturas`, `electricidad`, `fontaneria`, `ceramicas`, `hogar`.
- `subcategorias (id UUID PK, categoria_id TEXT FK, nombre TEXT, slug TEXT, orden INT)`: tipologías y divisiones finas.
- `marcas (id TEXT PK, nombre TEXT, logo_url TEXT)`: 22 marcas del catálogo (`S-00` a `S-74`).
- `productos (codigo TEXT PK, nombre TEXT, descripcion TEXT, categoria_id TEXT FK, subcategoria_id UUID FK, marca_id TEXT FK, existencia NUMERIC, especificaciones JSONB, imagenes TEXT[], etiquetas TEXT[], nuevo BOOL, destacado BOOL, activo BOOL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)`: clave primaria `codigo` para compatibilidad directa con importaciones masivas.

## Convención de Carga de Scripts en HTML

Cada página HTML pública debe cargar los scripts en el siguiente orden estricto:
1. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
2. `/assets/js/config.js`
3. `/assets/js/supabase.js`
4. `/assets/js/utils.js`
5. `/assets/js/main.js`
6. Script específico de la página (`categoria.js`, `productos.js`, `ceramicas.js`, `producto.js`, `busqueda.js`, `destacados.js`, `nuevos.js`).

## Panel de Administración (`/admin`)

- Protegido por `admin/js/auth-guard.js` vía Supabase Auth.
- Redirección automática a `/admin/login.html` si no hay sesión iniciada.
- Estilos neutros aislados en `admin/css/admin.css`.
- CRUD modular: `productos.html`, `categorias.html`, `subcategorias.html`, `marcas.html`.

## Reglas de Despliegue en Vercel

- `vercel.json` maneja URLs limpias (`cleanUrls: true`) y reescribe peticiones con host `admin.*` hacia `/admin/`.
- La clave `anonKey` es pública y segura para el navegador gracias a RLS.
- NUNCA commitear credenciales con rol `service_role` ni archivos `.env`.
