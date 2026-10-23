// admin/js/dashboard.js
// Métricas y resumen del catálogo para el panel de administración

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabaseClient) return;

    cargarMetricas();
    cargarUltimosProductos();
});

async function cargarMetricas() {
    try {
        // 1. Total de productos
        const { count: totalProductos, error: errProd } = await window.supabaseClient
            .from('productos')
            .select('*', { count: 'exact', head: true });

        // 2. Productos activos
        const { count: productosActivos, error: errAct } = await window.supabaseClient
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);

        // 3. Productos con bajo stock (<= 5)
        const { count: bajoStock, error: errStock } = await window.supabaseClient
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .lte('existencia', 5);

        // 4. Total categorías
        const { count: totalCategorias, error: errCat } = await window.supabaseClient
            .from('categorias')
            .select('*', { count: 'exact', head: true });

        // 5. Total marcas
        const { count: totalMarcas, error: errMarcas } = await window.supabaseClient
            .from('marcas')
            .select('*', { count: 'exact', head: true });

        // Actualizar UI
        const elTotal = document.getElementById('metric-total-productos');
        const elActivos = document.getElementById('metric-productos-activos');
        const elStock = document.getElementById('metric-bajo-stock');
        const elCategorias = document.getElementById('metric-total-categorias');
        const elMarcas = document.getElementById('metric-total-marcas');

        if (elTotal) elTotal.textContent = (totalProductos !== null) ? totalProductos.toLocaleString() : '—';
        if (elActivos) elActivos.textContent = (productosActivos !== null) ? productosActivos.toLocaleString() : '—';
        if (elStock) elStock.textContent = (bajoStock !== null) ? bajoStock.toLocaleString() : '—';
        if (elCategorias) elCategorias.textContent = (totalCategorias !== null) ? totalCategorias.toLocaleString() : '—';
        if (elMarcas) elMarcas.textContent = (totalMarcas !== null) ? totalMarcas.toLocaleString() : '—';

    } catch (err) {
        console.error('Error cargando métricas:', err);
    }
}

async function cargarUltimosProductos() {
    const tbody = document.getElementById('recent-products-tbody');
    if (!tbody) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('codigo, nombre, existencia, activo, destacado, nuevo, updated_at, marcas(nombre), categorias(nombre)')
            .order('updated_at', { ascending: false })
            .limit(8);

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted);">No hay productos registrados aún.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(p => {
            const marcaNombre = p.marcas?.nombre || 'Genérico';
            const catNombre = p.categorias?.nombre || '—';
            const fecha = new Date(p.updated_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return `
                <tr>
                    <td><strong>${window.escapeHtml(p.codigo)}</strong></td>
                    <td>
                        <div style="font-weight: 500;">${window.escapeHtml(p.nombre)}</div>
                        <div style="font-size: 11px; color: var(--admin-text-muted);">${window.escapeHtml(catNombre)} • ${window.escapeHtml(marcaNombre)}</div>
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
                    <td style="color: var(--admin-text-muted); font-size: 12px;">${fecha}</td>
                    <td>
                        <a href="/admin/productos.html?editar=${encodeURIComponent(p.codigo)}" class="btn-icon" title="Editar producto">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </a>
                        <a href="/pages/producto.html?id=${encodeURIComponent(p.codigo)}" target="_blank" class="btn-icon" title="Ver en tienda">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error cargando últimos productos:', err);
        tbody.innerHTML = `<tr><td colspan="6" style="color: var(--admin-danger);">Error al cargar productos recientes: ${window.escapeHtml(err.message)}</td></tr>`;
    }
}
