/**
 * scripts/migrar-imagenes.js
 * 
 * Script para migrar todas las imágenes locales de assets/img/productos/**
 * hacia el bucket público 'productos' de Supabase Storage.
 * 
 * Ejecución en terminal:
 *   node scripts/migrar-imagenes.js
 * 
 * Variables de entorno soportadas (opcional):
 *   SUPABASE_URL=...
 *   SUPABASE_KEY=... (service_role key o anon key)
 */

const fs = require('fs');
const path = require('path');

// Configuración por defecto tomada de assets/js/config.js
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zpikmusxnaintmpduinr.supabase.co';
// Para scripts masivos en backend se recomienda SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_oHAdMl_YloMlTxHCDGebIg_JPV8xd-Q';
const BUCKET_NAME = 'productos';

const CARPETA_ORIGEN = path.resolve(__dirname, '../assets/img/productos');
const ARCHIVO_MAPEO = path.resolve(__dirname, 'mapeo_imagenes.json');

const MIME_TYPES = {
    '.webp': 'image/webp',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jpe':  'image/jpeg',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.gif':  'image/gif'
};

function obtenerArchivos(dir, lista = []) {
    if (!fs.existsSync(dir)) return lista;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            obtenerArchivos(fullPath, lista);
        } else {
            const ext = path.extname(item).toLowerCase();
            if (MIME_TYPES[ext]) {
                lista.push(fullPath);
            }
        }
    }
    return lista;
}

function sanitizarNombre(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
        .replace(/[^a-zA-Z0-9._/-]/g, '_'); // Reemplazar caracteres especiales y espacios
}

async function subirArchivoASupabase(rutaLocal, rutaDestinoStorage) {
    const fileBuffer = fs.readFileSync(rutaLocal);
    const ext = path.extname(rutaLocal).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${rutaDestinoStorage}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'apikey': SUPABASE_KEY,
            'Content-Type': contentType,
            'x-upsert': 'true'
        },
        body: fileBuffer
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${rutaDestinoStorage}`;
}

async function migrar() {
    console.log('====================================================');
    console.log('MIGRACIÓN DE IMÁGENES A SUPABASE STORAGE');
    console.log('====================================================');
    console.log(`Origen: ${CARPETA_ORIGEN}`);
    console.log(`Destino: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`);
    console.log('----------------------------------------------------');

    const archivos = obtenerArchivos(CARPETA_ORIGEN);
    console.log(`Total de imágenes detectadas: ${archivos.length}\n`);

    if (archivos.length === 0) {
        console.log('No se encontraron imágenes para migrar.');
        return;
    }

    const mapaResultados = {};
    let subidas = 0;
    let fallidas = 0;

    for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const relativo = path.relative(CARPETA_ORIGEN, archivo).replace(/\\/g, '/');
        const rutaStorage = sanitizarNombre(relativo);

        process.stdout.write(`[${i + 1}/${archivos.length}] Subiendo: ${relativo}... `);

        try {
            const urlPublica = await subirArchivoASupabase(archivo, rutaStorage);
            mapaResultados[relativo] = urlPublica;
            subidas++;
            console.log('OK');
        } catch (err) {
            fallidas++;
            console.log(`ERROR (${err.message})`);
        }
    }

    // Guardar archivo con el mapeo completo
    fs.writeFileSync(ARCHIVO_MAPEO, JSON.stringify(mapaResultados, null, 2), 'utf-8');

    console.log('\n----------------------------------------------------');
    console.log(`Migración finalizada:`);
    console.log(`  - Exitosas: ${subidas}`);
    console.log(`  - Fallidas: ${fallidas}`);
    console.log(`Mapeo guardado en: ${ARCHIVO_MAPEO}`);
    console.log('====================================================\n');
}

migrar().catch(err => {
    console.error('Error fatal durante la migración:', err);
});
