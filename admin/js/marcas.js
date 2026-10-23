// admin/js/marcas.js
// CRUD de marcas del catálogo (permite renombrar S-00, S-17, etc., a sus nombres reales)

let MARCAS_LISTA = [];
let MODO_EDICION = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) return;

    await cargarMarcas();
    initEventos();
});

async function cargarMarcas() {
    const tbody = document.getElementById('marcas-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando marcas...</td></tr>';

    try {
        const { data, error } = await window.supabaseClient
            .from('marcas')
            .select('*, productos(count)')
            .order('id', { ascending: true });

        if (error) throw error;

        MARCAS_LISTA = data || [];
        renderTablaMarcas(MARCAS_LISTA);

    } catch (err) {
        console.error('Error cargando marcas:', err);
        tbody.innerHTML = `<tr><td colspan="5" style="color: var(--admin-danger); text-align: center;">Error al cargar datos: ${window.escapeHtml(err.message)}</td></tr>`;
    }
}

function renderTablaMarcas(lista) {
    const tbody = document.getElementById('marcas-tbody');
    if (!tbody) return;

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--admin-text-muted);">No hay marcas registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(m => {
        const prodsCount = m.productos?.[0]?.count || 0;
        const logoHTML = m.logo_url
            ? `<img src="${m.logo_url}" alt="" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; border: 1px solid var(--admin-border);" onerror="this.style.display='none';">`
            : '<div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--admin-text-light);"><i class="fa-solid fa-certificate"></i></div>';

        return `
            <tr>
                <td style="width: 50px;">${logoHTML}</td>
                <td style="font-weight: 600; font-family: monospace;">${window.escapeHtml(m.id)}</td>
                <td style="font-weight: 500;">${window.escapeHtml(m.nombre)}</td>
                <td>
                    <span class="badge ${prodsCount > 0 ? 'badge-primary' : 'badge-neutral'}">
                        ${prodsCount} productos
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="abrirModalMarca('${window.escapeHtml(m.id)}')" title="Renombrar / Editar marca">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="confirmarEliminarMarca('${window.escapeHtml(m.id)}', '${window.escapeHtml(m.nombre).replace(/'/g, "\\'")}', ${prodsCount})" title="Eliminar marca">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function initEventos() {
    document.getElementById('search-marca')?.addEventListener('input', (e) => {
        const q = window.normalizarTexto(e.target.value);
        const filtradas = MARCAS_LISTA.filter(m =>
            window.normalizarTexto(m.nombre).includes(q) ||
            window.normalizarTexto(m.id).includes(q)
        );
        renderTablaMarcas(filtradas);
    });

    document.getElementById('form-marca')?.addEventListener('submit', guardarMarca);
}

window.abrirModalMarca = function (id = null) {
    const modal = document.getElementById('modal-marca');
    const form = document.getElementById('form-marca');
    const title = document.getElementById('modal-marca-title');
    const idInput = document.getElementById('marca-id');

    form.reset();

    if (id) {
        MODO_EDICION = true;
        title.textContent = `Editar Marca (${id})`;
        idInput.value = id;
        idInput.readOnly = true;

        const marca = MARCAS_LISTA.find(m => m.id === id);
        if (marca) {
            document.getElementById('marca-nombre').value = marca.nombre || '';
            document.getElementById('marca-logo').value = marca.logo_url || '';
        }
    } else {
        MODO_EDICION = false;
        title.textContent = 'Nueva Marca';
        idInput.value = '';
        idInput.readOnly = false;
    }

    modal.classList.add('active');
};

window.cerrarModalMarca = function () {
    document.getElementById('modal-marca')?.classList.remove('active');
};

async function guardarMarca(e) {
    e.preventDefault();

    const id = document.getElementById('marca-id').value.trim().toUpperCase();
    const nombre = document.getElementById('marca-nombre').value.trim();
    const logo_url = document.getElementById('marca-logo').value.trim() || null;

    const payload = { id, nombre, logo_url };

    try {
        if (MODO_EDICION) {
            const { error } = await window.supabaseClient
                .from('marcas')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            window.showAdminToast(`Marca "${nombre}" actualizada.`);
        } else {
            const { error } = await window.supabaseClient
                .from('marcas')
                .insert([payload]);

            if (error) throw error;
            window.showAdminToast(`Marca "${nombre}" registrada.`);
        }

        cerrarModalMarca();
        cargarMarcas();

    } catch (err) {
        console.error('Error guardando marca:', err);
        window.showAdminToast(`Error al guardar: ${err.message}`, 'error');
    }
}

window.confirmarEliminarMarca = async function (id, nombre, prodsCount) {
    if (prodsCount > 0) {
        alert(`No puedes eliminar la marca "${nombre}" (${id}) porque tiene ${prodsCount} producto(s) asignado(s).`);
        return;
    }

    if (!confirm(`¿Eliminar la marca "${nombre}" (${id})?`)) return;

    try {
        const { error } = await window.supabaseClient
            .from('marcas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        window.showAdminToast('Marca eliminada.');
        cargarMarcas();
    } catch (err) {
        console.error(err);
        window.showAdminToast(`Error: ${err.message}`, 'error');
    }
};
