# Guía de Despliegue en Vercel — Ferretería El Constructor

Esta guía detalla el paso a paso para desplegar la tienda pública y el panel de administración en **Vercel** en un único proyecto, incluyendo el mapeo de subdominio para el panel de administración (`admin.tudominio.com`).

---

## 1. Conectar el Proyecto en Vercel

1. Inicia sesión en [Vercel](https://vercel.com).
2. Haz clic en **"Add New..."** > **"Project"**.
3. Importa tu repositorio Git de GitHub, GitLab o Bitbucket.
4. En la pantalla de configuración del proyecto:
   - **Framework Preset:** Selecciona `Other` (proyecto web estático HTML/CSS/JS).
   - **Root Directory:** `./` (la raíz del proyecto).
   - **Build and Output Settings:** Dejar los valores predeterminados (sin comando de build).
5. Haz clic en **"Deploy"**. En segundos el sitio estará publicado con una URL temporal de Vercel (ej: `ferreteria-el-constructor.vercel.app`).

---

## 2. Configurar Variables de Entorno en Vercel (Opcional)

El cliente frontend utiliza [`assets/js/config.js`](file:///c:/Users/HP/Desktop/ferreteria/assets/js/config.js) que contiene la URL de Supabase y la clave pública `anonKey`, la cual es segura para el navegador gracias a Row Level Security (RLS).

Si deseas sobreescribir estas credenciales desde variables de entorno en Vercel:
1. Ve a **Project Settings** > **Environment Variables**.
2. Agrega las siguientes variables:
   - `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `SUPABASE_ANON_KEY` = `tu-clave-anonima-publica`
3. Puedes asociarlas a los entornos `Production`, `Preview` y `Development`.

---

## 3. Configuración de Dominio Principal y Subdominio Admin

Gracias al archivo [`vercel.json`](file:///c:/Users/HP/Desktop/ferreteria/vercel.json) incluido en el proyecto, ambos sitios (la tienda y el panel de control) se gestionan en un solo proyecto:

| Host / URL | Destino real |
|---|---|
| `tudominio.com` / `www.tudominio.com` | Tienda pública (`/index.html`) |
| `tudominio.com/pages/herramientas` | Catálogo de herramientas |
| `admin.tudominio.com` | Panel de Administración (`/admin/index.html`) |
| `admin.tudominio.com/productos` | CRUD de productos (`/admin/productos.html`) |
| `admin.tudominio.com/login` | Acceso admin (`/admin/login.html`) |

### Pasos para vincular los dominios en Vercel:

1. En el panel de Vercel, ve a **Settings** > **Domains**.
2. **Agregar Dominio Principal:**
   - Escribe `tudominio.com` y haz clic en **Add**.
   - Vercel te indicará agregar un registro DNS tipo **A** apuntando a `76.76.21.21` (o un CNAME para `www.tudominio.com` apuntando a `cname.vercel-dns.com`).
3. **Agregar Subdominio Admin:**
   - En la misma sección de Domains, escribe `admin.tudominio.com` y haz clic en **Add**.
   - En tu proveedor DNS (Cloudflare, GoDaddy, Namecheap, etc.), crea un registro **CNAME**:
     - **Tipo:** `CNAME`
     - **Nombre / Host:** `admin`
     - **Valor / Destino:** `cname.vercel-dns.com`
     - **TTL:** Automático o 3600

4. ¡Listo! Vercel generará certificados SSL automáticos y gratuitos para ambos dominios. Cuando alguien visite `admin.tudominio.com`, la regla de rewrite en `vercel.json` servirá directamente el contenido de `/admin/` manteniendo la URL limpia.

---

## 4. Verificación Post-Deploy

Una vez propagado el DNS:
1. Entra a `https://tudominio.com` y confirma que cargan los carruseles de destacados, nuevos ingresos y navegación por categorías.
2. Entra a `https://admin.tudominio.com`:
   - Debe redirigirte a `/login` si no tienes sesión.
   - Inicia sesión con uno de los administradores creados en Supabase.
   - Verifica que el Dashboard cargue los conteos de productos, categorías y marcas en tiempo real.
