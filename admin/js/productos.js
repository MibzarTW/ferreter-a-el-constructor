// admin/js/productos.js
// CRUD completo de productos con soporte para Storage y URLs externas

const PAGE_SIZE = 15;
let PAGINA_ACTUAL = 1;
let TOTAL_REGISTROS = 0;
let FILTRO_BUSQUEDA = '';
let FILTRO_CATEGORIA = '';
let FILTRO_MARCA = '';
let FILTRO_ESTADO = '';

let CATEGORIAS_CACHE = [];
let SUBCATEGORIAS_CACHE = [];
let MARCAS_CACHE = [];

let IMAGENES_TEMP = [];
let MODO_EDICION = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) return;

    await cargarOpcionesFiltro();
    await cargarProductos();
    initEventos();

    // Si viene con parámetro ?nuevo=1, abrir modal de creación directamente
    const params = new URLSearchParams(location.search);
    if (params.get('nuevo') === '1') {
        abrirModalProducto();
    } else if (params.get('editar')) {
        abrirModalProducto(params.get('editar'));
    }
});

/* ---------- Cargar Categorías, Subcategorías y Marcas para selects ---------- */
async function cargarOpcionesFiltro() {
    try {
        const [catsRes, subsRes, marcasRes] = await Promise.all([
            window.supabaseClient.from('categorias').select('id, nombre, grupo').order('nombre'),
            window.supabaseClient.from('subcategorias').select('id, categoria_id, nombre, slug').order('nombre'),
            window.supabaseClient.from('marcas').select('id, nombre').order('nombre')
        ]);

        CATEGORIAS_CACHE = catsRes.data || [];
        SUBCATEGORIAS_CACHE = subsRes.data || [];
        MARCAS_CACHE = marcasRes.data || [];

        // Poblar selects de filtro
        const filterCat = document.getElementById('filter-categoria');
        const filterMarca = document.getElementById('filter-marca');

        if (filterCat) {
            filterCat.innerHTML = '<option value="">Todas las categorías</option>' +
                CATEGORIAS_CACHE.map(c => `<option value="${c.id}">${window.escapeHtml(c.nombre)}</option>`).join('');
        }

        if (filterMarca) {
            filterMarca.innerHTML = '<option value="">Todas las marcas</option>' +
                MARCAS_CACHE.map(m => `<option value="${m.id}">${window.escapeHtml(m.nombre)}</option>`).join('');
        }

        // Poblar selects del modal
        const modalCat = document.getElementById('prod-categoria');
        const modalMarca = document.getElementById('prod-marca');

        if (modalCat) {
            modalCat.innerHTML = '<option value="">Seleccionar categoría...</option>' +
                CATEGORIAS_CACHE.map(c => `<option value="${c.id}">${window.escapeHtml(c.nombre)} (${c.id})</option>`).join('');
        }

        if (modalMarca) {
            modalMarca.innerHTML = '<option value="">Seleccionar marca...</option>' +
                MARCAS_CACHE.map(m => `<option value="${m.id}">${window.escapeHtml(m.nombre)} (${m.id})</option>`).join('');
        }

    } catch (err) {
        console.error('Error cargando listas auxiliares:', err);
    }
}

/* ---------- Cargar y paginar productos ---------- */
async function cargarProductos() {
    const tbody = document.getElementById('productos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando productos...</td></tr>';

    try {
        let query = window.supabaseClient
            .from('productos')
            .select('codigo, nombre, existencia, activo, destacado, nuevo, categoria_id, marca_id, imagenes, marcas(nombre), categorias(nombre)', { count: 'exact' });

        // Filtros
        if (FILTRO_BUSQUEDA) {
            const clean = FILTRO_BUSQUEDA.replace(/[%,]/g, '');
            query = query.or(`nombre.ilike.%${clean}%,codigo.ilike.%${clean}%`);
        }
        if (FILTRO_CATEGORIA) {
            query = query.eq('categoria_id', FILTRO_CATEGORIA);
        }
        if (FILTRO_MARCA) {
            query = query.eq('marca_id', FILTRO_MARCA);
        }
        if (FILTRO_ESTADO === 'activo') query = query.eq('activo', true);
        if (FILTRO_ESTADO === 'inactivo') query = query.eq('activo', false);
        if (FILTRO_ESTADO === 'destacado') query = query.eq('destacado', true);
        if (FILTRO_ESTADO === 'nuevo') query = query.eq('nuevo', true);

        // Paginación
        const desde = (PAGINA_ACTUAL - 1) * PAGE_SIZE;
        const hasta = desde + PAGE_SIZE - 1;

        query = query.order('codigo', { ascending: true }).range(desde, hasta);

        const { data, count, error } = await query;
        if (error) throw error;

        TOTAL_REGISTROS = count || 0;
        renderTablaProductos(data || []);
        actualizarPaginacion();

    } catch (err) {
        console.error('Error consultando productos:', err);
        tbody.innerHTML = `<tr><td colspan="7" style="color: var(--admin-danger); text-align: center;">Error al cargar datos: ${window.escapeHtml(err.message)}</td></tr>`;
    }
}

function renderTablaProductos(lista) {
    const tbody = document.getElementById('productos-tbody');
    if (!tbody) return;

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--admin-text-muted);">No se encontraron productos con los filtros seleccionados.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const marca = p.marcas?.nombre || p.marca_id || 'Genérico';
        const categoria = p.categorias?.nombre || p.categoria_id || '—';
        const img = (Array.isArray(p.imagenes) && p.imagenes.length) ? p.imagenes[0] : (window.PLACEHOLDER || '');

        return `
            <tr>
                <td style="width: 50px;">
                    <div style="width: 44px; height: 44px; border-radius: 4px; overflow: hidden; background: #f1f5f9; border: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: center;">
                        <img src="${img}" alt="" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='${window.PLACEHOLDER}';">
                    </div>
                </td>
                <td style="font-weight: 600; font-family: monospace;">${window.escapeHtml(p.codigo)}</td>
                <td>
                    <div style="font-weight: 500; max-width: 380px;">${window.escapeHtml(p.nombre)}</div>
                    <div style="font-size: 11px; color: var(--admin-text-muted);">
                        <span style="color: var(--admin-primary);">${window.escapeHtml(categoria)}</span> • ${window.escapeHtml(marca)}
                    </div>
                </td>
                <td>
                    <span class="badge ${p.existencia <= 5 ? 'badge-danger' : 'badge-neutral'}">
                        ${Number(p.existencia)}
                    </span>
                </td>
                <td>
                    ${p.activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-neutral">Inactivo</span>'}
                    ${p.destacado ? '<span class="badge badge-primary">Destacado</span>' : ''}
                    ${p.nuevo ? '<span class="badge badge-warning">Nuevo</span>' : ''}
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="abrirModalProducto('${window.escapeHtml(p.codigo)}')" title="Editar producto">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <a href="/pages/producto.html?id=${encodeURIComponent(p.codigo)}" target="_blank" class="btn-icon" title="Ver en tienda">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                        <button class="btn-icon delete" onclick="confirmarEliminarProducto('${window.escapeHtml(p.codigo)}', '${window.escapeHtml(p.nombre).replace(/'/g, "\\'")}')" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(TOTAL_REGISTROS / PAGE_SIZE) || 1;
    const desde = TOTAL_REGISTROS === 0 ? 0 : (PAGINA_ACTUAL - 1) * PAGE_SIZE + 1;
    const hasta = Math.min(PAGINA_ACTUAL * PAGE_SIZE, TOTAL_REGISTROS);

    const txtInfo = document.getElementById('pagination-info');
    const txtPage = document.getElementById('pagination-current-page');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    if (txtInfo) txtInfo.textContent = `Mostrando ${desde} - ${hasta} de ${TOTAL_REGISTROS.toLocaleString()} productos`;
    if (txtPage) txtPage.textContent = `Página ${PAGINA_ACTUAL} de ${totalPaginas}`;

    if (btnPrev) btnPrev.disabled = PAGINA_ACTUAL <= 1;
    if (btnNext) btnNext.disabled = PAGINA_ACTUAL >= totalPaginas;
}

/* ---------- Eventos de Filtro ---------- */
function initEventos() {
    // Búsqueda con debounce
    const searchInput = document.getElementById('search-input');
    let timer = null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                FILTRO_BUSQUEDA = e.target.value.trim();
                PAGINA_ACTUAL = 1;
                cargarProductos();
            }, 300);
        });
    }

    // Selects de filtro
    document.getElementById('filter-categoria')?.addEventListener('change', (e) => {
        FILTRO_CATEGORIA = e.target.value;
        PAGINA_ACTUAL = 1;
        cargarProductos();
    });

    document.getElementById('filter-marca')?.addEventListener('change', (e) => {
        FILTRO_MARCA = e.target.value;
        PAGINA_ACTUAL = 1;
        cargarProductos();
    });

    document.getElementById('filter-estado')?.addEventListener('change', (e) => {
        FILTRO_ESTADO = e.target.value;
        PAGINA_ACTUAL = 1;
        cargarProductos();
    });

    // Paginación botones
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
        if (PAGINA_ACTUAL > 1) {
            PAGINA_ACTUAL -= 1;
            cargarProductos();
        }
    });

    document.getElementById('btn-next-page')?.addEventListener('click', () => {
        const totalPaginas = Math.ceil(TOTAL_REGISTROS / PAGE_SIZE);
        if (PAGINA_ACTUAL < totalPaginas) {
            PAGINA_ACTUAL += 1;
            cargarProductos();
        }
    });

    // Dependencia de categoría a subcategorías en el modal
    document.getElementById('prod-categoria')?.addEventListener('change', (e) => {
        actualizarSelectSubcategorias(e.target.value);
    });

    // Formulario guardar
    document.getElementById('form-producto')?.addEventListener('submit', guardarProducto);

    // Botón agregar imagen externa
    document.getElementById('btn-add-img-url')?.addEventListener('click', () => {
        const input = document.getElementById('prod-img-url-input');
        const url = input?.value.trim();
        if (url) {
            IMAGENES_TEMP.push(url);
            input.value = '';
            renderImagenesPreview();
        }
    });

    // Subida de archivos a Supabase Storage
    const fileInput = document.getElementById('prod-file-upload');
    fileInput?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const dropzone = document.querySelector('.upload-dropzone p');
        const textoOriginal = dropzone ? dropzone.textContent : '';
        if (dropzone) dropzone.textContent = 'Subiendo a Storage...';

        for (const file of files) {
            try {
                const ext = file.name.split('.').pop();
                const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const path = `productos/${Date.now()}_${cleanName}`;

                const { data, error } = await window.supabaseClient.storage
                    .from('productos')
                    .upload(path, file, { cacheControl: '3600', upsert: true });

                if (error) throw error;

                const { data: { publicUrl } } = window.supabaseClient.storage
                    .from('productos')
                    .getPublicUrl(path);

                IMAGENES_TEMP.push(publicUrl);
                renderImagenesPreview();
                window.showAdminToast(`Imagen "${file.name}" subida con éxito`);

            } catch (err) {
                console.error('Error subiendo imagen:', err);
                window.showAdminToast(`Error al subir imagen: ${err.message}`, 'error');
            }
        }

        if (dropzone) dropzone.textContent = textoOriginal;
        fileInput.value = '';
    });
}

function actualizarSelectSubcategorias(categoriaId, valorSeleccionado = null) {
    const select = document.getElementById('prod-subcategoria');
    if (!select) return;

    if (!categoriaId) {
        select.innerHTML = '<option value="">(Sin subcategoría)</option>';
        return;
    }

    const filtradas = SUBCATEGORIAS_CACHE.filter(s => s.categoria_id === categoriaId);
    if (!filtradas.length) {
        select.innerHTML = '<option value="">(No aplica subcategoría)</option>';
        return;
    }

    select.innerHTML = '<option value="">Seleccionar subcategoría...</option>' +
        filtradas.map(s => {
            const sel = (valorSeleccionado && valorSeleccionado === s.id) ? 'selected' : '';
            return `<option value="${s.id}" ${sel}>${window.escapeHtml(s.nombre)}</option>`;
        }).join('');
}

function renderImagenesPreview() {
    const strip = document.getElementById('image-preview-strip');
    if (!strip) return;

    strip.innerHTML = IMAGENES_TEMP.map((url, idx) => `
        <div class="image-preview-thumb">
            <img src="${url}" alt="Img ${idx + 1}" onerror="this.onerror=null;this.src='${window.PLACEHOLDER}';">
            <button type="button" class="btn-remove-thumb" onclick="eliminarImagenTemp(${idx})" title="Quitar imagen">✕</button>
        </div>
    `).join('');
}

window.eliminarImagenTemp = function (idx) {
    IMAGENES_TEMP.splice(idx, 1);
    renderImagenesPreview();
};

/* ---------- Modal Abrir / Cerrar ---------- */
window.abrirModalProducto = async function (codigo = null) {
    const modal = document.getElementById('modal-producto');
    const form = document.getElementById('form-producto');
    const modalTitle = document.getElementById('modal-producto-title');
    const codigoInput = document.getElementById('prod-codigo');

    form.reset();
    IMAGENES_TEMP = [];
    renderImagenesPreview();

    if (codigo) {
        // MODO EDICIÓN
        MODO_EDICION = true;
        modalTitle.textContent = `Editar Producto #${codigo}`;
        codigoInput.value = codigo;
        codigoInput.readOnly = true;

        try {
            const { data, error } = await window.supabaseClient
                .from('productos')
                .select('*')
                .eq('codigo', codigo)
                .single();

            if (error) throw error;

            document.getElementById('prod-nombre').value = data.nombre || '';
            document.getElementById('prod-descripcion').value = data.descripcion || '';
            document.getElementById('prod-existencia').value = data.existencia || 0;
            document.getElementById('prod-categoria').value = data.categoria_id || '';
            
            actualizarSelectSubcategorias(data.categoria_id, data.subcategoria_id);

            document.getElementById('prod-marca').value = data.marca_id || 'S-00';
            document.getElementById('prod-activo').checked = data.activo !== false;
            document.getElementById('prod-destacado').checked = Boolean(data.destacado);
            document.getElementById('prod-nuevo').checked = Boolean(data.nuevo);

            // Especificaciones JSON
            const specsStr = data.especificaciones ? JSON.stringify(data.especificaciones, null, 2) : '{}';
            document.getElementById('prod-specs-json').value = specsStr;

            // Imágenes
            IMAGENES_TEMP = Array.isArray(data.imagenes) ? [...data.imagenes] : [];
            renderImagenesPreview();

        } catch (err) {
            console.error('Error cargando producto para edición:', err);
            window.showAdminToast('No se pudo cargar la información del producto', 'error');
            return;
        }

    } else {
        // MODO CREACIÓN
        MODO_EDICION = false;
        modalTitle.textContent = 'Crear Nuevo Producto';
        codigoInput.value = '';
        codigoInput.readOnly = false;
        document.getElementById('prod-activo').checked = true;
        document.getElementById('prod-specs-json').value = '{}';
        actualizarSelectSubcategorias(null);
    }

    modal.classList.add('active');
};

window.cerrarModalProducto = function () {
    document.getElementById('modal-producto')?.classList.remove('active');
};

/* ---------- Guardar Producto (Insert o Update) ---------- */
async function guardarProducto(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btn-save-producto');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const existencia = parseFloat(document.getElementById('prod-existencia').value) || 0;
    const categoria_id = document.getElementById('prod-categoria').value || null;
    const subcategoria_id = document.getElementById('prod-subcategoria').value || null;
    const marca_id = document.getElementById('prod-marca').value || null;
    const activo = document.getElementById('prod-activo').checked;
    const destacado = document.getElementById('prod-destacado').checked;
    const nuevo = document.getElementById('prod-nuevo').checked;

    let especificaciones = {};
    try {
        const rawSpecs = document.getElementById('prod-specs-json').value.trim();
        if (rawSpecs) especificaciones = JSON.parse(rawSpecs);
    } catch (jsonErr) {
        window.showAdminToast('El formato JSON de especificaciones no es válido', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Producto';
        return;
    }

    const payload = {
        codigo,
        nombre,
        descripcion,
        existencia,
        categoria_id,
        subcategoria_id,
        marca_id,
        activo,
        destacado,
        nuevo,
        especificaciones,
        imagenes: IMAGENES_TEMP
    };

    try {
        if (MODO_EDICION) {
            const { error } = await window.supabaseClient
                .from('productos')
                .update(payload)
                .eq('codigo', codigo);

            if (error) throw error;
            window.showAdminToast(`Producto #${codigo} actualizado exitosamente`);
        } else {
            const { error } = await window.supabaseClient
                .from('productos')
                .insert([payload]);

            if (error) throw error;
            window.showAdminToast(`Producto #${codigo} creado exitosamente`);
        }

        cerrarModalProducto();
        cargarProductos();

    } catch (err) {
        console.error('Error guardando producto:', err);
        window.showAdminToast(`Error al guardar: ${err.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Producto';
    }
}

/* ---------- Eliminar Producto ---------- */
window.confirmarEliminarProducto = async function (codigo, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto:\n\n[#${codigo}] ${nombre}?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('productos')
            .delete()
            .eq('codigo', codigo);

        if (error) throw error;

        window.showAdminToast(`Producto #${codigo} eliminado.`);
        cargarProductos();

    } catch (err) {
        console.error('Error eliminando producto:', err);
        window.showAdminToast(`No se pudo eliminar el producto: ${err.message}`, 'error');
    }
};
