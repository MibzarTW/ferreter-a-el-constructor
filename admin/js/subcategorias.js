// admin/js/subcategorias.js
// CRUD de subcategorías (ej: tipologías de cerámicas)

let SUBCATEGORIAS_LISTA = [];
let CATEGORIAS_CACHE = [];
let MODO_EDICION = false;
let EDITANDO_ID = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) return;

    await cargarCategoriasParaSelect();
    await cargarSubcategorias();
    initEventos();
});

async function cargarCategoriasParaSelect() {
    try {
        const { data, error } = await window.supabaseClient
            .from('categorias')
            .select('id, nombre')
            .order('nombre');

        if (error) throw error;
        CATEGORIAS_CACHE = data || [];

        const filterSelect = document.getElementById('filter-categoria');
        const modalSelect = document.getElementById('subcat-categoria');

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Todas las categorías</option>' +
                CATEGORIAS_CACHE.map(c => `<option value="${c.id}">${window.escapeHtml(c.nombre)} (${c.id})</option>`).join('');
        }

        if (modalSelect) {
            modalSelect.innerHTML = '<option value="">Seleccionar categoría...</option>' +
                CATEGORIAS_CACHE.map(c => `<option value="${c.id}">${window.escapeHtml(c.nombre)} (${c.id})</option>`).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function cargarSubcategorias() {
    const tbody = document.getElementById('subcategorias-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando subcategorías...</td></tr>';

    try {
        const { data, error } = await window.supabaseClient
            .from('subcategorias')
            .select('*, categorias(id, nombre), productos(count)')
            .order('orden', { ascending: true })
            .order('nombre', { ascending: true });

        if (error) throw error;

        SUBCATEGORIAS_LISTA = data || [];
        renderTablaSubcategorias(SUBCATEGORIAS_LISTA);

    } catch (err) {
        console.error('Error cargando subcategorías:', err);
        tbody.innerHTML = `<tr><td colspan="5" style="color: var(--admin-danger); text-align: center;">Error al cargar datos: ${window.escapeHtml(err.message)}</td></tr>`;
    }
}

function renderTablaSubcategorias(lista) {
    const tbody = document.getElementById('subcategorias-tbody');
    if (!tbody) return;

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--admin-text-muted);">No hay subcategorías registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(s => {
        const catNombre = s.categorias?.nombre || s.categoria_id;
        const prodsCount = s.productos?.[0]?.count || 0;

        return `
            <tr>
                <td style="font-weight: 600;">${window.escapeHtml(s.nombre)}</td>
                <td style="font-family: monospace; font-size: 12px; color: var(--admin-text-muted);">${window.escapeHtml(s.slug)}</td>
                <td>
                    <span class="badge badge-primary">${window.escapeHtml(catNombre)} (${s.categoria_id})</span>
                </td>
                <td>
                    <span class="badge badge-neutral">${prodsCount} productos</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="abrirModalSubcategoria('${s.id}')" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="confirmarEliminarSubcategoria('${s.id}', '${window.escapeHtml(s.nombre).replace(/'/g, "\\'")}', ${prodsCount})" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function initEventos() {
    document.getElementById('filter-categoria')?.addEventListener('change', (e) => {
        const catId = e.target.value;
        const filtradas = catId
            ? SUBCATEGORIAS_LISTA.filter(s => s.categoria_id === catId)
            : SUBCATEGORIAS_LISTA;
        renderTablaSubcategorias(filtradas);
    });

    document.getElementById('search-subcategoria')?.addEventListener('input', (e) => {
        const q = window.normalizarTexto(e.target.value);
        const filtradas = SUBCATEGORIAS_LISTA.filter(s =>
            window.normalizarTexto(s.nombre).includes(q) ||
            window.normalizarTexto(s.slug).includes(q)
        );
        renderTablaSubcategorias(filtradas);
    });

    document.getElementById('form-subcategoria')?.addEventListener('submit', guardarSubcategoria);
}

window.abrirModalSubcategoria = function (id = null) {
    const modal = document.getElementById('modal-subcategoria');
    const form = document.getElementById('form-subcategoria');
    const title = document.getElementById('modal-subcat-title');

    form.reset();

    if (id) {
        MODO_EDICION = true;
        EDITANDO_ID = id;
        title.textContent = 'Editar Subcategoría';

        const sub = SUBCATEGORIAS_LISTA.find(s => s.id === id);
        if (sub) {
            document.getElementById('subcat-categoria').value = sub.categoria_id || '';
            document.getElementById('subcat-nombre').value = sub.nombre || '';
            document.getElementById('subcat-slug').value = sub.slug || '';
            document.getElementById('subcat-orden').value = sub.orden || 0;
        }
    } else {
        MODO_EDICION = false;
        EDITANDO_ID = null;
        title.textContent = 'Nueva Subcategoría';
        document.getElementById('subcat-orden').value = 0;
    }

    modal.classList.add('active');
};

window.cerrarModalSubcategoria = function () {
    document.getElementById('modal-subcategoria')?.classList.remove('active');
};

async function guardarSubcategoria(e) {
    e.preventDefault();

    const categoria_id = document.getElementById('subcat-categoria').value;
    const nombre = document.getElementById('subcat-nombre').value.trim();
    let slug = document.getElementById('subcat-slug').value.trim().toLowerCase();
    const orden = parseInt(document.getElementById('subcat-orden').value) || 0;

    if (!slug) {
        slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const payload = { categoria_id, nombre, slug, orden };

    try {
        if (MODO_EDICION && EDITANDO_ID) {
            const { error } = await window.supabaseClient
                .from('subcategorias')
                .update(payload)
                .eq('id', EDITANDO_ID);

            if (error) throw error;
            window.showAdminToast(`Subcategoría "${nombre}" actualizada.`);
        } else {
            const { error } = await window.supabaseClient
                .from('subcategorias')
                .insert([payload]);

            if (error) throw error;
            window.showAdminToast(`Subcategoría "${nombre}" creada.`);
        }

        cerrarModalSubcategoria();
        cargarSubcategorias();

    } catch (err) {
        console.error('Error guardando subcategoría:', err);
        window.showAdminToast(`Error al guardar: ${err.message}`, 'error');
    }
}

window.confirmarEliminarSubcategoria = async function (id, nombre, prodsCount) {
    if (!confirm(`¿Eliminar la subcategoría "${nombre}"? Los productos asignados conservarán su categoría principal.`)) return;

    try {
        const { error } = await window.supabaseClient
            .from('subcategorias')
            .delete()
            .eq('id', id);

        if (error) throw error;
        window.showAdminToast('Subcategoría eliminada.');
        cargarSubcategorias();
    } catch (err) {
        console.error(err);
        window.showAdminToast(`Error: ${err.message}`, 'error');
    }
};
