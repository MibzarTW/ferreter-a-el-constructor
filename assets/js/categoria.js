/* ==========================================================
   CATEGORÍA — Sidebar con filtros por categoría SQL + "Cargar más"
   (herramientas, pinturas, hogar y páginas avanzadas)
   ========================================================== */

const PRODUCTOS_POR_PAGINA = 12;

let TODOS_LOS_PRODUCTOS = [];
let FILTRADOS = [];
let PAGINA_ACTUAL = 1;
let GRUPO_ACTUAL = '';
let CAT_SQL_ACTUAL = 'todas';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    GRUPO_ACTUAL = grid.dataset.categoria || '';
    if (!GRUPO_ACTUAL) return;

    grid.innerHTML = '<p class="grid-loading">Cargando catálogo...</p>';

    if (!window.supabaseClient) {
        grid.innerHTML = '<p class="grid-loading">Error: Conexión con Supabase no disponible.</p>';
        return;
    }

    try {
        // Cargar productos correspondientes al grupo de la página
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select('*, marcas(nombre), categorias!inner(id, nombre, slug, grupo), subcategorias(nombre, slug)')
            .eq('activo', true)
            .eq('categorias.grupo', GRUPO_ACTUAL)
            .order('nombre', { ascending: true });

        if (error) throw error;

        TODOS_LOS_PRODUCTOS = (data || []).map(window.adaptarProducto);

        renderSidebar();
        filtrarYRenderizar();
        initSidebarToggle();
        initCargarMas();

    } catch (err) {
        console.error('Error cargando catálogo:', err);
        grid.innerHTML = `<p class="grid-loading">Error al cargar productos: ${window.escapeHtml(err.message)}</p>`;
    }
});

/* ---------- Render del Sidebar con categorías reales ---------- */
function renderSidebar() {
    const menu = document.getElementById('sidebar-menu');
    if (!menu) return;

    // Agrupar y contar por categoría SQL interna (id y nombre)
    const categoriasMap = new Map();

    TODOS_LOS_PRODUCTOS.forEach(p => {
        const catId = p.categoria_id || 'CAT-OTRO';
        const catNombre = p.categoria_nombre || p.categoria_id || 'Otros';
        if (!categoriasMap.has(catId)) {
            categoriasMap.set(catId, { id: catId, nombre: catNombre, count: 0 });
        }
        categoriasMap.get(catId).count += 1;
    });

    const listaCats = Array.from(categoriasMap.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
    );

    let html = `
        <a href="#" class="sidebar-item ${CAT_SQL_ACTUAL === 'todas' ? 'active' : ''}" data-cat="todas">
            <span>Todas</span>
            <span class="sidebar-count">${TODOS_LOS_PRODUCTOS.length}</span>
        </a>
    `;

    listaCats.forEach(cat => {
        const activa = CAT_SQL_ACTUAL === cat.id ? 'active' : '';
        html += `
            <a href="#" class="sidebar-item ${activa}" data-cat="${window.escapeHtml(cat.id)}" data-nombre="${window.escapeHtml(cat.nombre)}">
                <span>${window.escapeHtml(cat.nombre)}</span>
                <span class="sidebar-count">${cat.count}</span>
            </a>
        `;
    });

    menu.innerHTML = html;

    // Click en categoría del sidebar
    menu.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            CAT_SQL_ACTUAL = item.dataset.cat;
            PAGINA_ACTUAL = 1;

            menu.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Actualizar título
            const titulo = document.getElementById('categoria-titulo');
            if (titulo) {
                if (CAT_SQL_ACTUAL === 'todas') {
                    titulo.textContent = window.capitalizar(GRUPO_ACTUAL);
                } else {
                    titulo.textContent = item.dataset.nombre || window.capitalizar(GRUPO_ACTUAL);
                }
            }

            // Cerrar sidebar en móvil si está abierto
            document.getElementById('categoria-sidebar')?.classList.remove('open');

            filtrarYRenderizar();
        });
    });
}

/* ---------- Filtrar productos y reiniciar paginación ---------- */
function filtrarYRenderizar() {
    if (CAT_SQL_ACTUAL === 'todas') {
        FILTRADOS = [...TODOS_LOS_PRODUCTOS];
    } else {
        FILTRADOS = TODOS_LOS_PRODUCTOS.filter(p => p.categoria_id === CAT_SQL_ACTUAL);
    }

    // Ordenar por marca y luego por nombre
    FILTRADOS.sort((a, b) => {
        const marcaA = (a.marca || '').toLowerCase();
        const marcaB = (b.marca || '').toLowerCase();
        if (marcaA !== marcaB) return marcaA.localeCompare(marcaB);
        return (a.nombre || '').localeCompare(b.nombre || '');
    });

    PAGINA_ACTUAL = 1;
    renderProductosPaginados();
}

/* ---------- Render con paginación "Cargar más" ---------- */
function renderProductosPaginados() {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    if (!FILTRADOS.length) {
        grid.innerHTML = '<p class="grid-loading">No hay productos en esta sección todavía.</p>';
        actualizarContadores(0, 0);
        return;
    }

    const fin = PAGINA_ACTUAL * PRODUCTOS_POR_PAGINA;
    const pagina = FILTRADOS.slice(0, fin);

    grid.innerHTML = pagina.map(p =>
        window.renderProductCard(p, {
            esCeramica: p.categoria_grupo === 'ceramicas'
        })
    ).join('');

    window.attachImageFallbacks(grid);
    actualizarContadores(pagina.length, FILTRADOS.length);
}

function actualizarContadores(mostrados, total) {
    const elMostrados = document.getElementById('productos-mostrados');
    const elTotal = document.getElementById('productos-total');
    if (elMostrados) elMostrados.textContent = mostrados;
    if (elTotal) elTotal.textContent = total;

    const btn = document.getElementById('btn-cargar-mas');
    if (btn && btn.parentElement) {
        btn.parentElement.style.display = mostrados >= total ? 'none' : 'block';
    }
}

function initCargarMas() {
    const btn = document.getElementById('btn-cargar-mas');
    if (!btn) return;

    btn.addEventListener('click', () => {
        PAGINA_ACTUAL += 1;
        renderProductosPaginados();
    });
}

function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('categoria-sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}
