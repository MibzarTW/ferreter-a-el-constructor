/* ==========================================================
   UTILIDADES COMPARTIDAS — Ferretería El Constructor
   Unifica el placeholder, adaptador de datos y render de tarjetas
   ========================================================== */

// 1. Placeholder SVG oficial
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
    '<rect fill="#f0f0f1" width="400" height="400"/>' +
    '<text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#a0a0a6" text-anchor="middle" dominant-baseline="middle">Sin imagen</text>' +
    '</svg>'
);
window.PLACEHOLDER = PLACEHOLDER;
window.PLACEHOLDER_CAT = PLACEHOLDER;
window.PLACEHOLDER_CER = PLACEHOLDER;
window.PLACEHOLDER_PRODUCTO = PLACEHOLDER;
window.PLACEHOLDER_DEST = PLACEHOLDER;
window.PLACEHOLDER_NUEVOS = PLACEHOLDER;
window.PLACEHOLDER_VISTOS = PLACEHOLDER;

// 2. Manejo de imágenes caídas
function attachImageFallbacks(container) {
    if (!container) return;
    container.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            this.onerror = null;
            this.src = PLACEHOLDER;
        }, { once: true });
    });
}
window.attachImageFallbacks = attachImageFallbacks;

// 3. Sanitización de cadenas
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

// 4. Normalización para búsqueda (sin tildes, minúsculas)
function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}
window.normalizarTexto = normalizarTexto;
window.normalizar = normalizarTexto;

// 5. Capitalización
function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
window.capitalizar = capitalizar;

// 6. Adaptador unificado: Transforma registro de Supabase al formato del frontend
function adaptarProducto(dbProducto) {
    if (!dbProducto) return null;

    const especs = dbProducto.especificaciones || {};
    const imagenes = Array.isArray(dbProducto.imagenes) && dbProducto.imagenes.length > 0
        ? dbProducto.imagenes
        : (dbProducto.imagen ? [dbProducto.imagen] : []);

    const imgPrincipal = imagenes[0] || PLACEHOLDER;
    const imgSecundaria = imagenes[1] || imagenes[0] || PLACEHOLDER;

    // Marca
    let marcaNombre = 'Genérico';
    if (dbProducto.marcas && typeof dbProducto.marcas === 'object') {
        marcaNombre = dbProducto.marcas.nombre || dbProducto.marcas.nombre_marca || 'Genérico';
    } else if (dbProducto.marca) {
        marcaNombre = dbProducto.marca;
    } else if (dbProducto.marca_id) {
        marcaNombre = dbProducto.marca_id;
    }

    // Categoría y subcategoría
    const catObj = dbProducto.categorias || {};
    const subObj = dbProducto.subcategorias || {};

    const grupo = catObj.grupo || '';
    const categoriaNombre = catObj.nombre || '';
    const subcategoriaSlug = subObj.slug || especs.tipologia || 'todas';
    const subcategoriaNombre = subObj.nombre || '';

    // Unidades
    const esCeramica = grupo === 'ceramicas' || dbProducto.categoria_id === 'CAT-23';
    let unidades = dbProducto.unidades;
    if (!unidades) {
        unidades = esCeramica ? 'piezas,cajas,m2' : 'piezas';
    }

    return {
        id: dbProducto.codigo,
        codigo: dbProducto.codigo,
        nombre: dbProducto.nombre || '',
        nombre_corto: dbProducto.nombre_corto || dbProducto.nombre || '',
        descripcion: dbProducto.descripcion || '',
        marca: marcaNombre,
        marca_id: dbProducto.marca_id,
        categoria_id: dbProducto.categoria_id,
        categoria_nombre: categoriaNombre,
        categoria_grupo: grupo,
        subcategoria_id: dbProducto.subcategoria_id,
        subcategoria_slug: subcategoriaSlug,
        subcategoria_nombre: subcategoriaNombre,
        subcategoria: subcategoriaNombre || subcategoriaSlug,
        existencia: Number(dbProducto.existencia) || 0,
        imagen: imgPrincipal,
        imagen_fondo: imgSecundaria,
        galeria: imagenes.length > 0 ? imagenes : [PLACEHOLDER],
        especificaciones: especs,
        tamaño: especs.tamaño || especs.medida || '',
        acabado: especs.acabado || '',
        superficie: especs.superficie || '',
        tipo: especs.tipo || '',
        m2_por_caja: especs.m2_por_caja || '',
        piezas_x_caja: especs.piezas_x_caja || '',
        piezas_x_metro: especs.piezas_x_metro || '',
        caras: especs.caras || '',
        tipologia: subcategoriaSlug,
        unidades: unidades,
        nuevo: Boolean(dbProducto.nuevo),
        destacado: Boolean(dbProducto.destacado),
        activo: dbProducto.activo !== false,
        etiquetas: Array.isArray(dbProducto.etiquetas) ? dbProducto.etiquetas : []
    };
}
window.adaptarProducto = adaptarProducto;

// 7. Renderizado unificado de tarjeta de producto (HTML idéntico al diseño original)
function renderProductCard(p, opciones = {}) {
    if (!p) return '';
    const esCeramica = opciones.esCeramica || p.categoria_grupo === 'ceramicas' || p.categoria_id === 'CAT-23';
    const esCarrusel = opciones.esCarrusel || false;
    const conBadgeNuevo = opciones.conBadgeNuevo !== undefined ? opciones.conBadgeNuevo : p.nuevo;
    const etiquetaMarca = opciones.categoriaNombre || p.marca;

    if (esCeramica && !esCarrusel) {
        return `
        <article class="product-card ceramic-card">
            <a href="/pages/producto.html?id=${encodeURIComponent(p.id)}" class="product-link">
                <div class="ceramic-imgs">
                    <div class="ceramic-img-main">
                        <img src="${p.imagen}" alt="${escapeHtml(p.nombre)}" loading="lazy">
                    </div>
                    <div class="ceramic-img-hover">
                        <img src="${p.imagen_fondo}" alt="${escapeHtml(p.nombre)} aplicado" loading="lazy">
                    </div>
                </div>
            </a>
            <div class="product-info">
                <span class="product-brand">${escapeHtml(p.marca)}</span>
                <h3><a href="/pages/producto.html?id=${encodeURIComponent(p.id)}" class="product-link-text">${escapeHtml(p.nombre)}</a></h3>
                <div class="ceramic-meta">
                    ${p.tamaño ? `<span><i class="fa-solid fa-ruler-combined"></i> ${escapeHtml(p.tamaño)}</span>` : ''}
                    ${p.acabado ? `<span><i class="fa-solid fa-palette"></i> ${escapeHtml(p.acabado)}</span>` : ''}
                </div>
                <button class="btn-add-cart"
                        data-id="${escapeHtml(p.id)}"
                        data-nombre="${escapeHtml(p.nombre)}"
                        data-imagen="${escapeHtml(p.imagen)}"
                        data-unidades="${escapeHtml(p.unidades || 'piezas,cajas,m2')}">
                    <i class="fa-solid fa-plus"></i> Agregar a cotización
                </button>
            </div>
        </article>
        `;
    }

    const cardClass = esCarrusel ? 'product-card descubre-card' : 'product-card';

    return `
    <article class="${cardClass}">
        <a href="/pages/producto.html?id=${encodeURIComponent(p.id)}" class="product-link">
            <div class="product-img">
                ${conBadgeNuevo ? '<span class="badge-nuevo">NUEVO</span>' : ''}
                <img src="${p.imagen}" alt="${escapeHtml(p.nombre)}" loading="lazy">
            </div>
        </a>
        <div class="product-info">
            <span class="product-brand">${escapeHtml(etiquetaMarca)}</span>
            <h3><a href="/pages/producto.html?id=${encodeURIComponent(p.id)}" class="product-link-text">${escapeHtml(p.nombre)}</a></h3>
            <button class="btn-add-cart"
                    data-id="${escapeHtml(p.id)}"
                    data-nombre="${escapeHtml(p.nombre)}"
                    data-imagen="${escapeHtml(p.imagen)}"
                    data-unidades="${escapeHtml(p.unidades || 'piezas')}">
                <i class="fa-solid fa-plus"></i> Agregar a cotización
            </button>
        </div>
    </article>
    `;
}
window.renderProductCard = renderProductCard;

// 8. Control compartido para carruseles horizontales con flechas
function setupCarruselScroll(carrusel, prevBtn, nextBtn) {
    if (!carrusel) return;
    const desplazar = (dir) => {
        const ancho = carrusel.clientWidth * 0.8;
        carrusel.scrollBy({ left: dir * ancho, behavior: 'smooth' });
    };

    if (prevBtn) prevBtn.onclick = () => desplazar(-1);
    if (nextBtn) nextBtn.onclick = () => desplazar(1);
}
window.setupCarruselScroll = setupCarruselScroll;
