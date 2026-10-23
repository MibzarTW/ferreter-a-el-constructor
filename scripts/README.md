# Guía de Migración de Imágenes a Supabase Storage

Este directorio contiene herramientas para migrar las imágenes locales existentes al bucket `productos` de Supabase Storage.

---

## Ejecución del Script de Migración

El script `migrar-imagenes.js` lee automáticamente todas las imágenes de `/assets/img/productos/**` (incluyendo la carpeta de cerámicas y subcarpetas), las sube a Supabase Storage y genera un archivo `mapeo_imagenes.json` con las URLs públicas definitivas.

### Pasos:

1. Abre tu terminal en la raíz del proyecto ferretería.
2. Ejecuta el script con Node.js:

```bash
node scripts/migrar-imagenes.js
```

### Usar Service Role Key (Recomendado para subir masivamente sin restricciones RLS)

En Windows (PowerShell):
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
node scripts/migrar-imagenes.js
```

En Linux / macOS:
```bash
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui" node scripts/migrar-imagenes.js
```

---

## Resultado

Al finalizar, se genera el archivo `scripts/mapeo_imagenes.json` con la correspondencia entre la ruta local y la URL pública en Supabase Storage:

```json
{
  "ceramicas/222-blanco.webp": "https://zpikmusxnaintmpduinr.supabase.co/storage/v1/object/public/productos/ceramicas/222-blanco.webp",
  ...
}
```

Estas URLs pueden ser usadas en los registros de productos o al importar nuevos catálogos.
