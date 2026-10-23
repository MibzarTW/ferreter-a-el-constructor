// admin/js/categorias.js
// CRUD de categorías con asignación de grupo web

let CATEGORIAS_LISTA = [];
let MODO_EDICION = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) return;

    await cargarCategorias();
    initEventos();
});

async function cargarCategorias() {
    const tbody = document.getElementById('categorias-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando categorías...</td></tr>';

    try {
        const { data, error } = await window.supabaseClient
            .from('categorias')
            .select('*, productos(count)')
            .order('orden', { ascending: true })
            .order('nombre', { ascending: true });

        if (error) throw error;

        CATEGORIAS_LISTA = data || [];
        renderTablaCategorias(CATEGORIAS_LISTA);

    } catch (err) {
        console.error('Error cargando categorías:', err);
        tbody.innerHTML = `<tr><td colspan="6" style="color: var(--admin-danger); text-align: center;">Error al cargar categorías: ${window.escapeHtml(err.message)}</td></tr>`;
    }
}

function renderTablaCategorias(lista) {
    const tbody = document.getElementById('categorias-tbody');
    if (!tbody) return;

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--admin-text-muted);">No hay categorías registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(c => {
        const prodsCount = c.productos?.[0]?.count || 0;
        return `
            <tr>
                <td style="font-weight: 600; font-family: monospace;">${window.escapeHtml(c.id)}</td>
                <td style="font-weight: 500;">${window.escapeHtml(c.nombre)}</td>
                <td style="font-family: monospace; font-size: 12px; color: var(--admin-text-muted);">${window.escapeHtml(c.slug)}</td>
                <td>
                    <span class="badge badge-primary">${window.escapeHtml(c.grupo)}</span>
                </td>
                <td>
                    <span class="badge badge-neutral">${prodsCount} productos</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="abrirModalCategoria('${window.escapeHtml(c.id)}')" title="Editar categoría">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="confirmarEliminarCategoria('${window.escapeHtml(c.id)}', '${window.escapeHtml(c.nombre).replace(/'/g, "\\'")}', ${prodsCount})" title="Eliminar">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function initEventos() {
    // Filtro por grupo
    document.getElementById('filter-grupo')?.addEventListener('change', (e) => {
        const grupo = e.target.value;
        const filtradas = grupo
            ? CATEGORIAS_LISTA.filter(c => c.grupo === grupo)
            : CATEGORIAS_LISTA;
        renderTablaCategorias(filtradas);
    });

    // Búsqueda
    document.getElementById('search-categoria')?.addEventListener('input', (e) => {
        const q = window.normalizarTexto(e.target.value);
        const filtradas = CATEGORIAS_LISTA.filter(c =>
            window.normalizarTexto(c.nombre).includes(q) ||
            window.normalizarTexto(c.id).includes(q)
        );
        renderTablaCategorias(filtradas);
    });

    // Form submit
    document.getElementById('form-categoria')?.addEventListener('submit', guardarCategoria);
}

window.abrirModalCategoria = function (id = null) {
    const modal = document.getElementById('modal-categoria');
    const form = document.getElementById('form-categoria');
    const title = document.getElementById('modal-cat-title');
    const idInput = document.getElementById('cat-id');

    form.reset();

    if (id) {
        MODO_EDICION = true;
        title.textContent = `Editar Categoría (${id})`;
        idInput.value = id;
        idInput.readOnly = true;

        const cat = CATEGORIAS_LISTA.find(c => c.id === id);
        if (cat) {
            document.getElementById('cat-nombre').value = cat.nombre || '';
            document.getElementById('cat-slug').value = cat.slug || '';
            document.getElementById('cat-grupo').value = cat.grupo || 'herramientas';
            document.getElementById('cat-orden').value = cat.orden || 0;
            document.getElementById('cat-icono').value = cat.icono || '';
        }
    } else {
        MODO_EDICION = false;
        title.textContent = 'Nueva Categoría';
        idInput.value = '';
        idInput.readOnly = false;
        document.getElementById('cat-grupo').value = 'herramientas';
        document.getElementById('cat-orden').value = 0;
    }

    modal.classList.add('active');
};

window.cerrarModalCategoria = function () {
    document.getElementById('modal-categoria')?.classList.remove('active');
};

async function guardarCategoria(e) {
    e.preventDefault();

    const id = document.getElementById('cat-id').value.trim().toUpperCase();
    const nombre = document.getElementById('cat-nombre').value.trim();
    let slug = document.getElementById('cat-slug').value.trim().toLowerCase();
    const grupo = document.getElementById('cat-grupo').value;
    const orden = parseInt(document.getElementById('cat-orden').value) || 0;
    const icono = document.getElementById('cat-icono').value.trim();

    if (!slug) {
        slug = nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const payload = { id, nombre, slug, grupo, orden, icono };

    try {
        if (MODO_EDICION) {
            const { error } = await window.supabaseClient
                .from('categorias')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            window.showAdminToast(`Categoría "${nombre}" actualizada.`);
        } else {
            const { error } = await window.supabaseClient
                .from('categorias')
                .insert([payload]);

            if (error) throw error;
            window.showAdminToast(`Categoría "${nombre}" creada.`);
        }

        cerrarModalCategoria();
        cargarCategorias();

    } catch (err) {
        console.error('Error guardando categoría:', err);
        window.showAdminToast(`Error al guardar: ${err.message}`, 'error');
    }
}

window.confirmarEliminarCategoria = async function (id, nombre, prodsCount) {
    if (prodsCount > 0) {
        alert(`No puedes eliminar la categoría "${nombre}" (${id}) porque contiene ${prodsCount} producto(s) asignado(s). Reasigna los productos primero.`);
        return;
    }

    if (!confirm(`¿Eliminar la categoría "${nombre}" (${id})?`)) return;

    try {
        const { error } = await window.supabaseClient
            .from('categorias')
            .delete()
            .eq('id', id);

        if (error) throw error;
        window.showAdminToast(`Categoría eliminada.`);
        cargarCategorias();
    } catch (err) {
        console.error(err);
        window.showAdminToast(`Error al eliminar: ${err.message}`, 'error');
    }
};
