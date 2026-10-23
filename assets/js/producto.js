/* ==========================================================
   PRODUCTO — Carga la ficha individual de un producto desde Supabase
   ========================================================== */

const KEY_RECIENTES = 'recienVistos';
const MAX_RECIENTES = 20;

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('producto-detalle');
    if (!contenedor) return;

    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    if (!id) {
        mostrarNoEncontrado(contenedor);
        return;
    }

    if (!window.supabaseClient) {
        contenedor.innerHTML = '<p class="grid-loading">Error: Conexión con la base de datos no disponible.</p>';
        return;
    }

    contenedor.innerHTML = '<p class="grid-loading">Cargando información del producto...</p>';

    try {
        // Consultar el producto por su código
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias(nombre, slug, grupo), subcategorias(nombre, slug)')
            .eq('codigo', id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            mostrarNoEncontrado(contenedor);
            return;
        }

        const producto = window.adaptarProducto(data);

        // Actualizar título de la pestaña
        document.title = `${producto.nombre_corto || producto.nombre} | Ferretería El Constructor`;

        // Actualizar Breadcrumb
        const bcCategoria = document.getElementById('bc-categoria');
        const bcNombre    = document.getElementById('bc-nombre');
        const grupo = producto.categoria_grupo || 'herramientas';
        const catNombre = producto.categoria_nombre || window.capitalizar(grupo);

        if (bcCategoria) {
            bcCategoria.textContent = catNombre;
            bcCategoria.href = `/pages/${grupo}.html`;
        }
        if (bcNombre) {
            bcNombre.textContent = producto.nombre;
        }

        // Renderizar la ficha del producto
        renderProducto(producto, contenedor);

        // Cargar productos relacionados (misma categoría o mismo grupo)
        cargarRelacionados(producto);

    } catch (err) {
        console.error('Error al cargar producto:', err);
        mostrarNoEncontrado(contenedor);
    }
});

function mostrarNoEncontrado(contenedor) {
    contenedor.innerHTML = `
        <div class="sin-resultados" style="grid-column:1/-1;">
            <i class="fa-solid fa-box-open"></i>
            <h3>Producto no encontrado</h3>
            <p>Es posible que el enlace no sea válido o el producto ya no esté en el catálogo.</p>
            <a href="/" class="btn-primary">Volver al inicio</a>
        </div>
    `;
}

function renderProducto(p, contenedor) {
    // Normalizar lista de especificaciones
    const specsArray = [];
    const rawSpecs = p.especificaciones || {};

    if (Array.isArray(rawSpecs)) {
        specsArray.push(...rawSpecs);
    } else if (typeof rawSpecs === 'object') {
        Object.entries(rawSpecs).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                const label = key.replace(/_/g, ' ');
                specsArray.push({ etiqueta: window.capitalizar(label), valor: String(val) });
            }
        });
    }

    if (p.tamaño && !specsArray.some(s => s.etiqueta.toLowerCase() === 'tamaño' || s.etiqueta.toLowerCase() === 'medida')) {
        specsArray.push({ etiqueta: 'Medida / Tamaño', valor: p.tamaño });
    }
    if (p.marca && !specsArray.some(s => s.etiqueta.toLowerCase() === 'marca')) {
        specsArray.push({ etiqueta: 'Marca', valor: p.marca });
    }
    if (p.m2_por_caja && !specsArray.some(s => s.etiqueta.toLowerCase().includes('m2'))) {
        specsArray.push({ etiqueta: 'm² por caja', valor: p.m2_por_caja + ' m²' });
    }
    if (p.piezas_x_caja && !specsArray.some(s => s.etiqueta.toLowerCase().includes('piezas'))) {
        specsArray.push({ etiqueta: 'Piezas por caja', valor: p.piezas_x_caja });
    }

    const specsHTML = specsArray.map(s => `
        <tr>
            <td>${window.escapeHtml(s.etiqueta)}</td>
            <td>${window.escapeHtml(s.valor)}</td>
        </tr>
    `).join('');

    // Galería
    const imagenes = Array.isArray(p.galeria) && p.galeria.length ? p.galeria : [p.imagen];
    const thumbsHTML = imagenes.length > 1 ? `
        <div class="producto-thumbs">
            ${imagenes.map((img, i) => `
                <button class="producto-thumb ${i === 0 ? 'active' : ''}"
                        data-img="${img}"
                        aria-label="Ver imagen ${i + 1}">
                    <img src="${img}" alt="Vista ${i + 1}">
                </button>
            `).join('')}
        </div>
    ` : '';

    const esCeramica = p.categoria_grupo === 'ceramicas' || p.categoria_id === 'CAT-23';
    const unidades = p.unidades || (esCeramica ? 'piezas,cajas,m2' : 'piezas');

    // Etiquetas
    const etiquetas = Array.isArray(p.etiquetas) ? p.etiquetas : [];
    const tipoMostrar = (p.tipo || '').toString().trim();
    const etiquetasHTML = etiquetas
        .map(e => `<span class="producto-etiqueta">${window.escapeHtml(e)}</span>`)
        .join('');

    const marcaYTipo = `
        <span class="producto-marca">${window.escapeHtml(p.marca || '')}</span>
        ${tipoMostrar ? `<span class="producto-tipo">${window.escapeHtml(tipoMostrar)}</span>` : ''}
        ${etiquetasHTML}
    `;

    contenedor.innerHTML = `
        <div class="producto-top">
            <div class="producto-galeria">
                <div class="producto-img-principal" id="img-principal-wrap">
                    <img id="producto-img-grande" src="${imagenes[0]}" alt="${window.escapeHtml(p.nombre)}">
                    <button class="producto-zoom-hint" aria-label="Ampliar imagen" type="button">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </button>
                </div>
                ${thumbsHTML}
            </div>

            <div class="producto-info">
                <div class="producto-marca-row">
                    ${marcaYTipo}
                </div>
                <h1>${window.escapeHtml(p.nombre_corto || p.nombre)}</h1>
                <span class="producto-codigo">Código: ${window.escapeHtml(p.codigo || 'N/D')}</span>

                ${p.descripcion ? `<p class="producto-descripcion">${window.escapeHtml(p.descripcion)}</p>` : ''}

                ${esCeramica ? renderSpecsRapidas(p) : ''}

                <button class="btn-add-cart producto-btn-cotizar"
                        data-id="${window.escapeHtml(p.id)}"
                        data-nombre="${window.escapeHtml(p.nombre)}"
                        data-imagen="${imagenes[0]}"
                        data-unidades="${window.escapeHtml(unidades)}">
                    <i class="fa-solid fa-cart-plus"></i> Agregar a cotización
                </button>

                <div class="producto-aviso">
                    <i class="fa-solid fa-circle-info"></i>
                    Los precios se cotizan por WhatsApp. Escríbenos para confirmar disponibilidad y entrega.
                </div>
            </div>
        </div>

        ${specsHTML ? `
            <details class="producto-specs-wrapper" open>
                <summary class="producto-specs-toggle">
                    <span><i class="fa-solid fa-list-check"></i> Ficha técnica</span>
                    <i class="fa-solid fa-chevron-down producto-specs-arrow"></i>
                </summary>
                <table class="producto-specs">
                    <tbody>${specsHTML}</tbody>
                </table>
            </details>
        ` : ''}
    `;

    // Fallbacks
    window.attachImageFallbacks(contenedor);

    // Eventos de miniaturas de galería
    const mainImg = document.getElementById('producto-img-grande');
    contenedor.querySelectorAll('.producto-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            if (mainImg) mainImg.src = thumb.dataset.img;
            contenedor.querySelectorAll('.producto-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // Zoom modal
    initZoomImagenes();

    // Guardar en Recién Vistos (localStorage)
    guardarReciente(p);
}

function renderSpecsRapidas(p) {
    const items = [
        p.tamaño     ? `<span><i class="fa-solid fa-ruler-combined"></i> ${window.escapeHtml(p.tamaño)}</span>` : '',
        p.acabado    ? `<span><i class="fa-solid fa-palette"></i> ${window.escapeHtml(p.acabado)}</span>` : '',
        p.superficie ? `<span><i class="fa-solid fa-fingerprint"></i> ${window.escapeHtml(p.superficie)}</span>` : '',
        p.m2_por_caja? `<span><i class="fa-solid fa-box"></i> ${window.escapeHtml(p.m2_por_caja)} m² / caja</span>` : ''
    ].filter(Boolean).join('');

    if (!items) return '';
    return `<div class="producto-specs-rapidas">${items}</div>`;
}

function initZoomImagenes() {
    let zoomModal = document.getElementById('zoom-modal');
    if (!zoomModal) {
        zoomModal = document.createElement('div');
        zoomModal.id = 'zoom-modal';
        zoomModal.className = 'zoom-modal';
        zoomModal.innerHTML = `
            <button class="zoom-close" aria-label="Cerrar" type="button">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="zoom-img-wrapper">
                <img id="zoom-img" src="" alt="Vista ampliada">
            </div>
        `;
        document.body.appendChild(zoomModal);

        const cerrarZoom = () => zoomModal.classList.remove('active');
        zoomModal.querySelector('.zoom-close')?.addEventListener('click', cerrarZoom);
        zoomModal.addEventListener('click', (e) => {
            if (e.target === zoomModal) cerrarZoom();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarZoom();
        });
    }

    const wrap = document.getElementById('img-principal-wrap');
    const mainImg = document.getElementById('producto-img-grande');
    const zoomImg = document.getElementById('zoom-img');

    if (wrap && mainImg && zoomImg) {
        wrap.addEventListener('click', () => {
            zoomImg.src = mainImg.src;
            zoomModal.classList.add('active');
        });
    }
}

function guardarReciente(producto) {
    try {
        let lista = JSON.parse(localStorage.getItem(KEY_RECIENTES) || '[]');
        lista = lista.filter(it => it.id !== producto.id);
        lista.unshift({
            id: producto.id,
            nombre: producto.nombre,
            imagen: producto.imagen,
            marca: producto.marca,
            categoria: producto.categoria_nombre || producto.categoria_grupo,
            categoriaSlug: producto.categoria_grupo,
            unidades: producto.unidades || 'piezas',
            fecha: Date.now()
        });
        lista = lista.slice(0, MAX_RECIENTES);
        localStorage.setItem(KEY_RECIENTES, JSON.stringify(lista));
    } catch (e) {
        console.warn('No se pudo guardar en recién vistos:', e);
    }
}

async function cargarRelacionados(producto) {
    const grid = document.getElementById('relacionados-grid');
    const seccion = document.getElementById('relacionados-seccion');
    if (!grid) return;

    try {
        // Buscar productos de la misma categoría o grupo
        let query = window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias(nombre, slug, grupo)')
            .eq('activo', true)
            .neq('codigo', producto.codigo);

        if (producto.categoria_id) {
            query = query.eq('categoria_id', producto.categoria_id);
        }

        const { data, error } = await query.limit(4);
        if (error) throw error;

        if (!data || data.length === 0) {
            if (seccion) seccion.style.display = 'none';
            return;
        }

        const adaptados = data.map(window.adaptarProducto);
        grid.innerHTML = adaptados.map(p =>
            window.renderProductCard(p, {
                esCeramica: p.categoria_grupo === 'ceramicas'
            })
        ).join('');

        window.attachImageFallbacks(grid);
        if (seccion) seccion.style.display = 'block';

    } catch (err) {
        console.warn('Error cargando relacionados:', err);
        if (seccion) seccion.style.display = 'none';
    }
}
