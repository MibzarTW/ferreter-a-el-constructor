/* ==========================================================
   PRODUCTOS — Catálogo simple para páginas sin sidebar
   (materiales, electricidad, fontanería)
   ========================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    // Si la página tiene sidebar, categoria.js se encarga de ella
    if (document.getElementById('sidebar-menu')) return;

    const categoriaSlug = grid.dataset.categoria;
    if (!categoriaSlug) return;

    grid.innerHTML = '<p class="grid-loading">Cargando productos del catálogo...</p>';

    if (!window.supabaseClient) {
        grid.innerHTML = '<p class="grid-loading">Error: Conexión con la base de datos no disponible.</p>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias!inner(id, nombre, slug, grupo)')
            .eq('activo', true)
            .eq('categorias.grupo', categoriaSlug)
            .order('nombre', { ascending: true });

        if (error) throw error;

        const productos = (data || []).map(window.adaptarProducto);
        renderProductos(productos, grid);

    } catch (err) {
        console.error('Error cargando categoría:', err);
        grid.innerHTML = `<p class="grid-loading">Error al cargar productos: ${window.escapeHtml(err.message)}</p>`;
    }
});

function renderProductos(productos, grid) {
    if (!grid) return;

    const counter = document.getElementById('productos-count');
    if (counter) counter.textContent = productos.length;

    if (!productos || !productos.length) {
        grid.innerHTML = '<p class="grid-loading">No hay productos en esta categoría todavía.</p>';
        return;
    }

    const categoriaSlug = grid.dataset.categoria || '';
    const esCeramica = categoriaSlug === 'ceramicas';

    grid.innerHTML = productos.map(p =>
        window.renderProductCard(p, {
            esCeramica: esCeramica
        })
    ).join('');

    window.attachImageFallbacks(grid);
}

window.renderProductos = renderProductos;
